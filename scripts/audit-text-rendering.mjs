import process from 'node:process'

const CDP_ENDPOINT = process.env.CDP_ENDPOINT || 'http://127.0.0.1:9224'
const APP_URL = process.env.APP_URL || 'http://127.0.0.1:5173/'
const ROUTES = ['/', '/about']
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 1000, deviceScaleFactor: 1 },
  { name: 'laptop', width: 1280, height: 800, deviceScaleFactor: 1 },
  { name: 'tablet', width: 768, height: 1024, deviceScaleFactor: 1 },
  { name: 'iphone-15-pro', width: 393, height: 852, deviceScaleFactor: 3, mobile: true },
  { name: 'minimum', width: 320, height: 720, deviceScaleFactor: 2, mobile: true },
]
const STATE_CONTROLS = [
  { name: 'landing-stage', selector: '.hero-app-nav button' },
  { name: 'agent', selector: '.agent-console-nav button' },
  { name: 'site-control', selector: '.node-policy-item' },
]

async function getPageTarget() {
  const response = await fetch(`${CDP_ENDPOINT}/json/list`)
  const targets = await response.json()
  const page = targets.find((target) => target.type === 'page' && target.url.startsWith(APP_URL))
  if (!page) throw new Error(`No Chrome page found for ${APP_URL}`)
  return page
}

async function connect(url) {
  const socket = new WebSocket(url)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })

  let id = 0
  const pending = new Map()
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data)
    if (!message.id || !pending.has(message.id)) return
    const { resolve, reject } = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) reject(new Error(message.error.message))
    else resolve(message.result)
  })

  return {
    call(method, params = {}) {
      const callId = ++id
      socket.send(JSON.stringify({ id: callId, method, params }))
      return new Promise((resolve, reject) => pending.set(callId, { resolve, reject }))
    },
    close() {
      socket.close()
    },
  }
}

const auditExpression = `
(async () => {
  await document.fonts.ready;
  const textSelector = 'h1,h2,h3,h4,h5,p,a,button,label,li,dt,dd,small,strong,b,em,time,span';
  const nodes = [...document.querySelectorAll(textSelector)].filter((element) => {
    const ownText = [...element.childNodes]
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent)
      .join('')
      .trim();
    return ownText.length > 0;
  });
  const unsupported = new Map();
  const clipped = [];
  const transformedText = [];

  for (const element of nodes) {
    const text = element.textContent.trim().replace(/\\s+/g, ' ');
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    for (const char of text) {
      const code = char.codePointAt(0);
      if (code < 32 || code > 126) unsupported.set(char, (unsupported.get(char) || 0) + 1);
    }

    const clipsInline = element.scrollWidth > element.clientWidth + 1;
    const clipsBlock = element.scrollHeight > element.clientHeight + 1;
    if ((clipsInline || clipsBlock) && ['hidden', 'clip'].includes(style.overflow) && Number(style.opacity) > 0) {
      clipped.push({
        selector: element.className ? '.' + String(element.className).trim().replace(/\\s+/g, '.') : element.tagName.toLowerCase(),
        path: [...function* () { let node = element; while (node && node !== document.body) { yield node.className ? '.' + String(node.className).trim().replace(/\\s+/g, '.') : node.tagName.toLowerCase(); node = node.parentElement; } }()].slice(0, 6),
        text: text.slice(0, 90),
        width: [element.clientWidth, element.scrollWidth],
        height: [element.clientHeight, element.scrollHeight],
      });
    }

    let ancestor = element;
    const decorativeMotion = Boolean(element.closest('.biomarker-rain, .network-us-map, .clinic-network-layer'));
    while (ancestor && ancestor !== document.documentElement) {
      const transform = getComputedStyle(ancestor).transform;
      if (!decorativeMotion && transform && transform !== 'none') {
        transformedText.push({
          text: text.slice(0, 90),
          owner: ancestor.className ? '.' + String(ancestor.className).trim().replace(/\\s+/g, '.') : ancestor.tagName.toLowerCase(),
          transform,
        });
        break;
      }
      ancestor = ancestor.parentElement;
    }

    if (rect.right > innerWidth + 1 || rect.left < -1) {
      clipped.push({
        selector: element.className ? '.' + String(element.className).trim().replace(/\\s+/g, '.') : element.tagName.toLowerCase(),
        owner: element.parentElement?.className ? '.' + String(element.parentElement.className).trim().replace(/\\s+/g, '.') : element.parentElement?.tagName.toLowerCase(),
        path: [...function* () { let node = element; while (node && node !== document.body) { yield node.className ? '.' + String(node.className).trim().replace(/\\s+/g, '.') : node.tagName.toLowerCase(); node = node.parentElement; } }()].slice(0, 6),
        text: text.slice(0, 90),
        width: [Math.round(rect.left), Math.round(rect.right)],
      });
    }
  }

  return {
    url: location.href,
    fontLoaded: document.fonts.check('16px Endless'),
    bodyFont: getComputedStyle(document.body).fontFamily,
    unsupported: [...unsupported].map(([char, count]) => ({ char, code: 'U+' + char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'), count })),
    clipped: clipped.slice(0, 30),
    transformedText: transformedText.slice(0, 30),
    totals: { textNodes: nodes.length, clipped: clipped.length, transformedText: transformedText.length },
  };
})()
`

const target = await getPageTarget()
const cdp = await connect(target.webSocketDebuggerUrl)
await cdp.call('Page.enable')
await cdp.call('Runtime.enable')
await cdp.call('Emulation.setScrollbarsHidden', { hidden: true })

const results = []
for (const route of ROUTES) {
  for (const viewport of VIEWPORTS) {
    await cdp.call('Emulation.setDeviceMetricsOverride', {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: viewport.deviceScaleFactor,
      mobile: Boolean(viewport.mobile),
      screenWidth: viewport.width,
      screenHeight: viewport.height,
    })
    await cdp.call('Page.navigate', { url: new URL(route, APP_URL).href })
    await new Promise((resolve) => setTimeout(resolve, 900))

    for (const ratio of [0, 0.34, 0.68, 1]) {
      await cdp.call('Runtime.evaluate', {
        expression: `scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * ${ratio}, behavior: 'instant' })`,
      })
      await new Promise((resolve) => setTimeout(resolve, 180))
      const response = await cdp.call('Runtime.evaluate', { expression: auditExpression, awaitPromise: true, returnByValue: true })
      results.push({ route, viewport: viewport.name, ratio, ...response.result.value })
    }

    if (route === '/' && ['desktop', 'iphone-15-pro'].includes(viewport.name)) {
      for (const control of STATE_CONTROLS) {
        const countResult = await cdp.call('Runtime.evaluate', {
          expression: `document.querySelectorAll(${JSON.stringify(control.selector)}).length`,
          returnByValue: true,
        })
        for (let index = 0; index < countResult.result.value; index += 1) {
          await cdp.call('Runtime.evaluate', {
            expression: `document.querySelectorAll(${JSON.stringify(control.selector)})[${index}]?.click()`,
          })
          await new Promise((resolve) => setTimeout(resolve, 450))
          const response = await cdp.call('Runtime.evaluate', { expression: auditExpression, awaitPromise: true, returnByValue: true })
          results.push({ route, viewport: viewport.name, state: `${control.name}-${index + 1}`, ...response.result.value })
        }
      }
    }
  }
}

cdp.close()
console.log(JSON.stringify(results, null, 2))
