import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react'
import { ArrowUpRight, X } from '@phosphor-icons/react'
import { isPilotTrigger } from './pilot-triggers'

const EMPTY = { name: '', role: '', organization: '', email: '', message: '', website: '' }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SUCCESS_HOLD_MS = 1150
const CLOSE_MS = 240
const SHAKE_MS = 460

const PilotContext = createContext({
  open: false,
  openPilot: () => {},
  closePilot: () => {},
})

export function usePilot() {
  return useContext(PilotContext)
}

export function PilotProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const openRef = useRef(false)
  const closingRef = useRef(false)
  const closeTimer = useRef(0)

  const openPilot = useCallback(() => {
    window.clearTimeout(closeTimer.current)
    closingRef.current = false
    openRef.current = true
    setClosing(false)
    setOpen(true)
  }, [])

  const closePilot = useCallback(() => {
    if (!openRef.current || closingRef.current) return
    closingRef.current = true
    setClosing(true)
    closeTimer.current = window.setTimeout(() => {
      openRef.current = false
      closingRef.current = false
      setOpen(false)
      setClosing(false)
    }, CLOSE_MS)
  }, [])

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  useEffect(() => {
    const onClick = (event) => {
      const trigger = event.target.closest?.('[data-pilot-form], a[href]')
      if (!isPilotTrigger(trigger)) return
      event.preventDefault()
      openPilot()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [openPilot])

  return (
    <PilotContext.Provider value={{ open, openPilot, closePilot }}>
      {children}
      {open ? <PilotDialog closing={closing} onClose={closePilot} /> : null}
    </PilotContext.Provider>
  )
}

export function PilotButton({ className, children, onClick, ...props }) {
  const { openPilot } = usePilot()
  return (
    <button
      type="button"
      className={className}
      data-pilot-form
      onClick={(event) => {
        openPilot()
        onClick?.(event)
      }}
      {...props}
    >
      {children}
    </button>
  )
}

function DrumMark({ shaking, tone }) {
  return (
    <svg className={`pilot-mark${shaking ? ' is-shaking' : ''}${tone ? ` is-${tone}` : ''}`} viewBox="0 0 476 520" fill="none" stroke="currentColor" strokeWidth="34" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d="M 104.82 74.50 L 366.46 74.50 A 40.50 40.50 0 0 1 402.59 133.29 L 368.99 199.68 A 63.50 63.50 0 0 1 312.33 234.50 L 158.12 234.50 A 63.50 63.50 0 0 1 101.18 199.11 L 68.50 132.93 A 40.50 40.50 0 0 1 104.82 74.50 Z" />
      <path d="M 158.62 284.50 L 312.06 284.50 A 63.50 63.50 0 0 1 368.75 319.39 L 403.25 387.75 A 40.50 40.50 0 0 1 367.09 446.50 L 104.32 446.50 A 40.50 40.50 0 0 1 68.01 388.07 L 101.68 319.88 A 63.50 63.50 0 0 1 158.62 284.50 Z" />
    </svg>
  )
}

function usePilotViewport(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined

    const sync = () => {
      const viewport = window.visualViewport
      const mobile = window.matchMedia('(max-width: 520px)').matches
      if (!viewport || !mobile) {
        root.style.removeProperty('--dm-vv-offset-top')
        root.style.removeProperty('--dm-vv-offset-left')
        root.style.removeProperty('--dm-vv-width')
        root.style.removeProperty('--dm-vv-height')
        root.removeAttribute('data-kb')
        return
      }
      root.style.setProperty('--dm-vv-offset-top', `${viewport.offsetTop}px`)
      root.style.setProperty('--dm-vv-offset-left', `${viewport.offsetLeft}px`)
      root.style.setProperty('--dm-vv-width', `${viewport.width}px`)
      root.style.setProperty('--dm-vv-height', `${viewport.height}px`)
      root.toggleAttribute('data-kb', viewport.height < window.innerHeight * 0.82)
    }

    let frame = 0
    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        sync()
      })
    }

    sync()
    window.visualViewport?.addEventListener('resize', schedule)
    window.visualViewport?.addEventListener('scroll', schedule)
    window.addEventListener('resize', schedule)
    return () => {
      window.cancelAnimationFrame(frame)
      window.visualViewport?.removeEventListener('resize', schedule)
      window.visualViewport?.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [rootRef])
}

function PilotDialog({ closing, onClose }) {
  const titleId = useId()
  const rootRef = useRef(null)
  const panelRef = useRef(null)
  const firstField = useRef(null)
  const openedAt = useRef(0)
  const lastFocus = useRef(null)
  const successTimer = useRef(0)
  const shakeTimer = useRef(0)
  const [values, setValues] = useState(EMPTY)
  const [bad, setBad] = useState([])
  const [status, setStatus] = useState({ tone: '', text: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [shake, setShake] = useState(false)

  usePilotViewport(rootRef)

  useEffect(() => {
    openedAt.current = Date.now()
    lastFocus.current = document.activeElement
    const frame = window.requestAnimationFrame(() => firstField.current?.focus())
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const nodes = [...panelRef.current.querySelectorAll('button, input, textarea')].filter((node) => !node.disabled && node.tabIndex !== -1 && node.getAttribute('aria-hidden') !== 'true')
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(successTimer.current)
      window.clearTimeout(shakeTimer.current)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      if (lastFocus.current instanceof HTMLElement) lastFocus.current.focus()
    }
  }, [onClose])

  const update = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
    setBad((current) => current.filter((name) => name !== field))
  }

  const fail = (text, fields, focusName) => {
    setStatus({ tone: 'error', text })
    setBad(fields)
    setShake(true)
    window.clearTimeout(shakeTimer.current)
    shakeTimer.current = window.setTimeout(() => setShake(false), SHAKE_MS)
    const focus = focusName && panelRef.current?.querySelector(`[name="${focusName}"]`)
    focus?.focus()
  }

  const submit = async (event) => {
    event.preventDefault()
    if (sending || sent) return
    const name = values.name.trim()
    const role = values.role.trim()
    const organization = values.organization.trim()
    const email = values.email.trim()
    const message = values.message.trim()
    const missing = [
      !name && 'name',
      !role && 'role',
      !organization && 'organization',
      (!email || !EMAIL_RE.test(email)) && 'email',
      !message && 'message',
    ].filter(Boolean)
    if (missing.length) {
      return fail(
        missing.includes('email') && email ? 'A valid work email is required.' : 'Name, role, organization, work email, and a short note are required.',
        missing,
        missing[0],
      )
    }

    setSending(true)
    setStatus({ tone: '', text: '' })
    try {
      const response = await fetch('/api/pilot-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, name, role, organization, email, message, openedAt: openedAt.current }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setSending(false)
        return fail(payload.error || 'Could not send. Try again shortly.', [], null)
      }
      setSent(true)
      setStatus({ tone: 'success', text: 'Received. We will reply from team@damaros.ai.' })
      successTimer.current = window.setTimeout(onClose, SUCCESS_HOLD_MS)
    } catch {
      setSending(false)
      fail('Network error. Check the connection and try again.', [], null)
    }
  }

  const state = sent ? 'success' : sending ? 'sending' : status.tone === 'error' ? 'error' : 'idle'

  return (
    <div ref={rootRef} className={`pilot-root${closing ? ' is-closing' : ''}`} data-state={state}>
      <button className="pilot-backdrop" type="button" aria-label="Close pilot inquiry" onClick={onClose} />
      <section
        ref={panelRef}
        className="pilot-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="pilot-head">
          <p>Start a pilot</p>
          <h2 id={titleId}>Clinical investigation, rewired: Start with one real site workflow.</h2>
          <button className="pilot-close" type="button" aria-label="Close" onClick={onClose}>
            <X size={16} weight="bold" />
          </button>
        </header>
        <form id="pilot-inquiry-form" onSubmit={submit} noValidate>
          <div className="pilot-grid">
            <label className="pilot-req">
              <span>Name<span aria-hidden="true">*</span></span>
              <input ref={firstField} className={bad.includes('name') ? 'is-invalid' : ''} name="name" autoComplete="name" maxLength={120} required value={values.name} onChange={update('name')} />
            </label>
            <label className="pilot-req">
              <span>Role<span aria-hidden="true">*</span></span>
              <input className={bad.includes('role') ? 'is-invalid' : ''} name="role" autoComplete="organization-title" maxLength={120} required value={values.role} onChange={update('role')} />
            </label>
            <label className="pilot-req pilot-span">
              <span>Organization<span aria-hidden="true">*</span></span>
              <input className={bad.includes('organization') ? 'is-invalid' : ''} name="organization" autoComplete="organization" maxLength={160} required value={values.organization} onChange={update('organization')} />
            </label>
            <label className="pilot-req pilot-span">
              <span>Work email<span aria-hidden="true">*</span></span>
              <input className={bad.includes('email') ? 'is-invalid' : ''} name="email" type="email" autoComplete="email" inputMode="email" maxLength={254} required value={values.email} onChange={update('email')} />
            </label>
            <label className="pilot-req pilot-span">
              <span>What you are working on<span aria-hidden="true">*</span></span>
              <textarea className={bad.includes('message') ? 'is-invalid' : ''} name="message" required rows={4} maxLength={4000} value={values.message} onChange={update('message')} />
            </label>
            <label className="pilot-hp" aria-hidden="true">
              <span>Website</span>
              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={values.website} onChange={update('website')} />
            </label>
          </div>
          <footer className="pilot-foot">
            <div className="pilot-actions">
              <button className="button button-primary" type="submit" disabled={sending || sent}>
                <svg className="pilot-submit-check" viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                <span>{sent ? 'Sent' : sending ? 'Sending' : 'Send inquiry'}</span>
                {!sent && !sending && <ArrowUpRight size={15} weight="bold" />}
              </button>
              <p className={`pilot-status${status.tone ? ` is-${status.tone}` : ''}`} role="status" aria-live="polite">{status.text}</p>
            </div>
            <DrumMark shaking={shake} tone={status.tone === 'error' ? 'error' : ''} />
          </footer>
          <p className="pilot-note">Name, role, organization, work email, and a short note. Nothing leaves this form except the inquiry email.</p>
        </form>
      </section>
    </div>
  )
}
