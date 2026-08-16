export function isPilotTrigger(node) {
  if (!node || typeof node.getAttribute !== 'function') return false
  if (node.hasAttribute('data-pilot-form')) return true
  const href = node.getAttribute('href') || ''
  return /Pilot(%20|\+| )?Inquiry/i.test(href) || /subject=Damaros%20Pilot%20Inquiry/i.test(href)
}
