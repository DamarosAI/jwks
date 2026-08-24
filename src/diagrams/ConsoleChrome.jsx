/**
 * Shared console chrome.
 *
 * Deliberately reuses the landing workspace's own classes - mac-titlebar,
 * traffic-lights, window-breadcrumb, window-brand, window-live - so the
 * Trident and Nectar panels are not a lookalike of the product surface, they
 * are the same surface. The monogram sits in the breadcrumb exactly where it
 * sits in the hero window.
 */

export function ConsoleChrome({ name, scope, live, pulse }) {
  return (
    <div className="mac-titlebar">
      <div className="traffic-lights" aria-hidden="true"><i /><i /><i /></div>
      <span className="window-breadcrumb">
        <span className="window-title window-brand">
          <img src="/assets/damaros-monogram-blue.svg" alt="" aria-hidden="true" decoding="async" />
        </span>
        <span>{name}</span>
        <span>{scope}</span>
      </span>
      <span className={`window-live${pulse ? '' : ' is-parked'}`}><i /> {live}</span>
    </div>
  )
}

/**
 * Icons in the workspace's own hand - 18px box, 1.35 stroke, round joins -
 * rather than a second icon family. The model glyph is a trident: three tines
 * on one crossbar over one shaft.
 */
export function ConsoleGlyph({ kind, size = 16 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 18 18',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.35,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }
  if (kind === 'model') return <svg {...common}><path d="M4.4 5.2v4.1M9 4.2v4.9M13.6 5.2v4.1" /><path d="M4.4 9.3h9.2" /><path d="M9 9.3v4.5" /></svg>
  if (kind === 'site') return <svg {...common}><path d="M3.4 14.6V6.9L9 3.6l5.6 3.3v7.7Z" /><path d="M7.3 14.6v-3.5h3.4v3.5" /></svg>
  if (kind === 'structure') return <svg {...common}><path d="m9 3.4 5.4 2.7L9 8.8 3.6 6.1Z" /><path d="m3.6 9.2 5.4 2.7 5.4-2.7" /></svg>
  if (kind === 'record') return <svg {...common}><circle cx="9" cy="6.2" r="2.4" /><path d="M4.3 14.6c.5-2.9 2.1-4.4 4.7-4.4s4.2 1.5 4.7 4.4" /></svg>
  return <svg {...common}><circle cx="9" cy="9" r="5.8" /><path d="m5.1 5.1 7.8 7.8" /></svg>
}
