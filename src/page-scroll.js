import { useEffect } from 'react'

/** Live product chrome. Clip-only — never a page-scroll trap. */
export const DEMO_PAGE_WHEEL_SURFACES = [
  '.hero-workspace',
  '.agent-console',
  '.node-system',
  '.landing-source-demo',
  '.demo-product',
  '.live-workspace',
].join(', ')

export const WHEEL_LINE_PX = 16

export function isIntentionalScrollOverflow(value) {
  return value === 'auto' || value === 'scroll' || value === 'overlay'
}

export function remainingScroll(size, client, offset, delta) {
  if (!delta) return 0
  return delta > 0 ? Math.max(0, size - client - offset) : Math.max(0, offset)
}

export function canElementScroll({
  overflowX = 'visible',
  overflowY = 'visible',
  scrollWidth = 0,
  scrollHeight = 0,
  clientWidth = 0,
  clientHeight = 0,
  scrollLeft = 0,
  scrollTop = 0,
} = {}, deltaX = 0, deltaY = 0) {
  const yRoom = isIntentionalScrollOverflow(overflowY)
    ? remainingScroll(scrollHeight, clientHeight, scrollTop, deltaY)
    : 0
  const xRoom = isIntentionalScrollOverflow(overflowX)
    ? remainingScroll(scrollWidth, clientWidth, scrollLeft, deltaX)
    : 0
  return (Boolean(deltaY) && yRoom > 0.5) || (Boolean(deltaX) && xRoom > 0.5)
}

export function shouldPassPageWheel(chain, deltaX, deltaY) {
  if (!chain?.length || !chain.some((node) => node.surface)) return false
  return !chain.some((node) => canElementScroll(node, deltaX, deltaY))
}

export function pageWheelDelta(event, pageHeight = 800) {
  if (!event || event.defaultPrevented || event.ctrlKey) return null
  const scale = event.deltaMode === 1 ? WHEEL_LINE_PX : event.deltaMode === 2 ? pageHeight : 1
  return { x: (event.deltaX || 0) * scale, y: (event.deltaY || 0) * scale }
}

export function applyPassedPageWheel(view, deltaX, deltaY) {
  view?.scrollBy?.(deltaX, deltaY)
}

function measureWheelNode(node) {
  if (!node || node.nodeType !== 1) {
    return {
      surface: false,
      overflowX: 'visible',
      overflowY: 'visible',
      scrollWidth: 0,
      scrollHeight: 0,
      clientWidth: 0,
      clientHeight: 0,
      scrollLeft: 0,
      scrollTop: 0,
    }
  }
  const style = globalThis.getComputedStyle?.(node)
  return {
    surface: Boolean(node.matches?.(DEMO_PAGE_WHEEL_SURFACES)),
    overflowX: style?.overflowX ?? 'visible',
    overflowY: style?.overflowY ?? 'visible',
    scrollWidth: node.scrollWidth ?? 0,
    scrollHeight: node.scrollHeight ?? 0,
    clientWidth: node.clientWidth ?? 0,
    clientHeight: node.clientHeight ?? 0,
    scrollLeft: node.scrollLeft ?? 0,
    scrollTop: node.scrollTop ?? 0,
  }
}

export function collectWheelChain(target) {
  const chain = []
  let node = target?.nodeType === 3 ? target.parentElement : target
  while (node && node !== document.documentElement && node !== document.body) {
    const metrics = measureWheelNode(node)
    chain.push(metrics)
    if (metrics.surface) return chain
    node = node.parentElement
  }
  return []
}

export function bindDemoPageWheel(target = globalThis) {
  const onWheel = (event) => {
    const delta = pageWheelDelta(event, target.innerHeight)
    if (!delta) return
    if (!shouldPassPageWheel(collectWheelChain(event.target), delta.x, delta.y)) return
    event.preventDefault()
    applyPassedPageWheel(target, delta.x, delta.y)
  }
  target.addEventListener('wheel', onWheel, { capture: true, passive: false })
  return () => target.removeEventListener('wheel', onWheel, { capture: true })
}

export function useDemoPageWheel() {
  useEffect(() => bindDemoPageWheel(), [])
}
