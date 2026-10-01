// Graba una sesión real de MINDSCAPE (con Gemini) y toma las capturas del README.
// Requiere el backend en http://localhost:8000 y el frontend en APP_URL.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'out');
const APP_URL = process.env.APP_URL || 'http://localhost:3000';
const W = 1120, H = 700;
const IMAGE_INDEX = Number(process.env.IMAGE_INDEX || 3); // Imagen predeterminada elegida en la demo
// Cada mensaje puede ir acompañado de una zona señalada en la imagen ({ x, y } de 0 a 1)
const USER_MESSAGES = [
  { text: 'Me siento un poco así: en calma por fuera, pero como si todo pasara muy lejos de mí.', point: { x: 0.36, y: 0.5 } },
  { text: 'Creo que es el trabajo, no paro y casi no tengo tiempo para mí. Me ha ayudado ponerle nombre; lo dejo aquí por hoy, gracias.' },
];
// Se envía solo si el modelo no ha dado la conversación por finalizada
const EXTRA_GOODBYE = { text: 'Sí, lo dejo aquí. Gracias por la conversación, adiós.' };

// Cursor visible en el vídeo (la grabación headless no muestra el puntero)
const CURSOR_SCRIPT = `
  window.addEventListener('DOMContentLoaded', () => {
    const c = document.createElement('div');
    c.id = '__cursor';
    c.style.cssText = 'position:fixed;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;' +
      'background:rgba(255,255,255,.85);border:2px solid rgba(0,0,0,.55);box-shadow:0 2px 8px rgba(0,0,0,.35);' +
      'z-index:2147483647;pointer-events:none;transition:transform .12s ease;transform:translate(-100px,-100px)';
    document.documentElement.appendChild(c);
    let x = -100, y = -100;
    const place = (s) => c.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
    document.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; place(1); }, true);
    document.addEventListener('mousedown', () => place(0.7), true);
    document.addEventListener('mouseup', () => place(1), true);
  });
`;

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    recordVideo: { dir: OUT, size: { width: W, height: H } },
    acceptDownloads: true,
  });
  await context.addInitScript(CURSOR_SCRIPT);
  const page = await context.newPage();
  const t0 = Date.now();
  const now = () => (Date.now() - t0) / 1000;
  const waits = []; // Intervalos [inicio, fin] en segundos esperando al modelo (se recortan en el GIF)

  // Aborta si el backend devuelve un error (p. ej. cuota de Gemini agotada)
  let backendError = null;
  page.on('response', async (res) => {
    if (res.url().includes(':8000/') && res.status() >= 400) {
      backendError = `${res.status()} ${res.url()}: ${await res.text().catch(() => '')}`;
    }
  });
  const check = () => {
    if (backendError) throw new Error(`El backend devolvió un error: ${backendError}`);
  };

  // Aborta si la interfaz muestra un aviso de error o una respuesta mal formada
  const checkUi = async () => {
    check();
    const errorToast = page.locator('.chakra-alert[data-status="error"]');
    if (await errorToast.count()) throw new Error(`La interfaz muestra un error: ${await errorToast.first().innerText()}`);
    const texts = await page.locator('.entry__text').allInnerTexts();
    const broken = texts.find((t) => /```|"message"\s*:|"punto"\s*:|"finished"\s*:|\[\s*\d{1,4}\s*,\s*\d{1,4}\s*\]/.test(t));
    if (broken) throw new Error(`Respuesta mal formada en el chat: ${broken.slice(0, 160)}`);
  };

  const moveTo = async (locator) => {
    const b = await locator.boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 25 });
  };
  const click = async (locator) => {
    await locator.scrollIntoViewIfNeeded();
    await moveTo(locator);
    await page.waitForTimeout(250);
    await page.mouse.down();
    await page.waitForTimeout(90);
    await page.mouse.up();
  };
  const still = async (name, opts = {}) => {
    await page.evaluate(() => { document.getElementById('__cursor').style.visibility = 'hidden'; });
    await page.screenshot({ path: path.join(OUT, name), ...opts });
    await page.evaluate(() => { document.getElementById('__cursor').style.visibility = 'visible'; });
    console.log(`[${now().toFixed(1)}s] captura ${name}`);
  };
  const timedWait = async (fn) => {
    const start = now();
    await fn();
    waits.push([start, now()]);
    console.log(`[${now().toFixed(1)}s] espera al modelo: ${(now() - start).toFixed(1)}s`);
  };
  const waitUntil = (predicate) => page.waitForFunction(predicate, null, { timeout: 120000, polling: 250 })
    .finally(check);

  // 1. Menú principal
  await page.goto(APP_URL);
  await page.mouse.move(W / 2, H / 2 + 200);
  await page.waitForTimeout(1000);
  await still('mindscape-home.png');
  await page.waitForTimeout(600);
  await click(page.getByRole('button', { name: 'Elegir una imagen' }));

  // 2. Galería: recorrer algunas imágenes y elegir una
  const thumb = (i) => page.getByRole('button', { name: `Imagen ${i + 1}`, exact: true });
  await thumb(0).waitFor();
  await page.waitForTimeout(900);
  for (const i of [12, 6, 20]) {
    await moveTo(thumb(i));
    await page.waitForTimeout(450);
  }
  await click(thumb(IMAGE_INDEX));
  const enter = page.getByRole('button', { name: 'Empezar la conversación' });
  await enter.waitFor();
  await page.waitForTimeout(900);
  await still('mindscape-image-selection.png');

  // 3. Inicio de la conversación a partir de la imagen
  await click(enter);
  const ta = page.getByLabel('Tu mensaje');
  const entries = page.locator('.entry');
  await timedWait(() => waitUntil(() => document.querySelector('.entry--bot')));
  await checkUi();
  await page.waitForTimeout(5000); // Movimiento de cámara y lectura de la pregunta inicial

  // Señala una zona haciendo clic en la escena (x, y relativos a la parte visible)
  const pointAt = async ({ x, y }) => {
    const box = await page.locator('.scene').boundingBox();
    await page.mouse.move(box.x + box.width * x, box.y + box.height * y, { steps: 30 });
    await page.waitForTimeout(350);
    await page.mouse.down();
    await page.waitForTimeout(90);
    await page.mouse.up();
    await page.waitForTimeout(700);
  };

  const send = async ({ text, point }) => {
    const n = await entries.count();
    if (point) await pointAt(point);
    await click(ta);
    await ta.pressSequentially(text, { delay: 22 });
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await timedWait(() => page.waitForFunction(
      (k) => document.querySelectorAll('.entry').length >= k, n + 2, { timeout: 120000, polling: 250 },
    ).finally(check));
    await checkUi();
    const reply = await entries.last().innerText();
    console.log('  usuaria:', text, '\n  modelo :', reply.replace(/\s+/g, ' ').replace(/^\d*\s*Mindscape: /, '').slice(0, 200));
    await page.waitForTimeout(Math.min(6000, 3000 + reply.length * 12)); // Movimiento de cámara y lectura
  };

  // 4. Conversación hasta que el modelo la da por finalizada
  const pdfBtn = page.getByRole('button', { name: 'Descargar resumen en PDF' });
  for (let i = 0; i < USER_MESSAGES.length; i++) {
    await send(USER_MESSAGES[i]);
    if (i === 0) await still('mindscape-chat.png');
  }
  if (!(await pdfBtn.isVisible())) await send(EXTRA_GOODBYE);
  if (!(await pdfBtn.isVisible())) throw new Error('El modelo no ha finalizado la conversación; vuelve a intentarlo.');

  // 5. Fin de la sesión y descarga del resumen
  await page.waitForTimeout(5000); // La imagen se enmarca y se dibuja el recorrido
  await still('mindscape-finished.png');
  await moveTo(page.getByRole('button', { name: 'Empezar con otra imagen' }));
  await page.waitForTimeout(500);
  const download = page.waitForEvent('download', { timeout: 120000 });
  await click(pdfBtn);
  let dl;
  await timedWait(async () => { dl = await download; await dl.path(); });
  check();
  await dl.saveAs(path.join(OUT, 'summary.pdf'));
  await checkUi();
  await page.waitForTimeout(1500);

  const videoPath = await page.video().path();
  const total = now();
  await context.close();
  await browser.close();
  fs.renameSync(videoPath, path.join(OUT, 'session.webm'));
  fs.writeFileSync(path.join(OUT, 'timeline.json'), JSON.stringify({ waits, total }, null, 2));
  console.log('Grabación completada en', OUT);
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
