import { usePhaseCycle } from './usePhaseCycle'

/**
 * Trident - the three prongs are the product, so they are the interface.
 *
 * Built in the same product register as the landing workspace: window chrome,
 * a provider rail, a checkpoint card, and a receipt ledger. The loop runs one
 * governed task end to end. The long beat is the checkpoint hold, because that
 * beat is the headline - any model can propose, none can decide.
 */

const PROVIDERS = [
  { name: 'Anthropic', meta: 'External - attested' },
  { name: 'OpenAI', meta: 'External - attested' },
  { name: 'On-site', meta: 'Local runtime' },
]

const STEPS = ['Propose', 'Validate', 'Checkpoint', 'Receipt']

const PHASES = [
  { hold: 900, step: 0, state: 'run', status: 'RUNNING', schema: 'Awaiting proposal', verdict: 'proposing' },
  { hold: 820, step: 1, state: 'run', status: 'VALIDATING', schema: 'Checking against task contract', verdict: 'validating' },
  { hold: 760, step: 1, state: 'valid', status: 'VALIDATED', schema: '19 fields - contract satisfied', verdict: 'validated' },
  { hold: 1500, step: 2, state: 'hold', status: 'HOLDING', schema: '19 fields - contract satisfied', verdict: 'held' },
  { hold: 900, step: 2, state: 'signed', status: 'SIGNED', schema: '19 fields - contract satisfied', verdict: 'signed' },
  { hold: 1600, step: 3, state: 'signed', status: 'RELEASED', schema: '19 fields - contract satisfied', verdict: 'receipted', commit: true },
]

const REST = PHASES.length - 1

const TONE = { run: 'run', valid: 'valid', hold: 'hold', signed: 'signed' }

export default function TridentConsole({ animate = true }) {
  const { phase, cycle } = usePhaseCycle(PHASES, { animate, restPhase: REST })
  const state = PHASES[phase]
  const lane = cycle % PROVIDERS.length
  const provider = PROVIDERS[lane]
  const seq = 1044 + cycle

  const receipts = [
    { id: `REV-018-TR3-${seq}`, signer: 'M. Avdol', time: '14:07' },
    { id: `REV-018-TR3-${seq - 1}`, signer: 'J. Kujo', time: '11:52' },
    { id: `REV-018-TR3-${seq - 2}`, signer: 'M. Avdol', time: '09:41' },
  ]

  const verdict = {
    proposing: { label: 'Proposal in flight', note: `${provider.name} is drafting. No authority granted.` },
    validating: { label: 'Schema check running', note: 'Output must match the task contract or it is discarded.' },
    validated: { label: 'Schema valid', note: 'Contract satisfied. Work is now eligible for review.' },
    held: { label: 'Held for site authority', note: 'Nothing advances until a named person at the site signs.' },
    signed: { label: 'Accepted by M. Avdol', note: 'Site signature recorded. Authority stayed local.' },
    receipted: { label: 'Receipt written', note: 'Run is replayable without the model being available.' },
  }[state.verdict]

  return (
    <div className="pconsole">
      <div className="pconsole-bar">
        <div className="pconsole-lights" aria-hidden="true"><i /><i /><i /></div>
        <span className="pconsole-name">Trident</span>
        <span className={`pconsole-live${animate ? ' is-live' : ''}`}><i /> Run 018-017</span>
      </div>

      <div className="pconsole-body tc-body">
        <div className="tc-rail">
          <p className="pconsole-kicker">Providers</p>
          {PROVIDERS.map((item, i) => (
            <div className={`tc-provider${i === lane ? ' is-active' : ''}`} key={item.name}>
              <i aria-hidden="true" />
              <span><strong>{item.name}</strong><small>{item.meta}</small></span>
              <em>{i === lane ? 'ACTIVE' : 'READY'}</em>
            </div>
          ))}
          <p className="tc-rail-note">Operators choose the provider. The task contract does not change.</p>
        </div>

        <div className="tc-main">
          <div className="tc-head">
            <span><strong>Task T-07</strong><small>Draft screening rationale - I-4.2 ECOG</small></span>
            <em className={`tc-status is-${TONE[state.state]}`}>{state.status}</em>
          </div>

          <ol className="tc-steps">
            {STEPS.map((label, i) => (
              <li className={i < state.step ? 'is-done' : i === state.step ? 'is-now' : ''} key={label}>
                <b>{String(i + 1).padStart(2, '0')}</b>{label}
              </li>
            ))}
          </ol>

          <div className={`tc-checkpoint is-${TONE[state.state]}`}>
            <dl>
              <div><dt>Provider</dt><dd>{provider.name} - identity attested</dd></div>
              <div><dt>Schema</dt><dd>{state.schema}</dd></div>
              <div><dt>Authority</dt><dd>Site of record - PI or Sub-I</dd></div>
            </dl>
            <p className="tc-verdict"><strong>{verdict.label}</strong><small>{verdict.note}</small></p>
          </div>

          <div className="tc-ledger">
            <p className="pconsole-kicker">Execution receipts</p>
            <header><small>REV</small><small>DECISION</small><small>SIGNER</small><small>TIME</small></header>
            {receipts.map((row, i) => (
              <div className={i === 0 && state.commit ? 'is-new' : ''} key={row.id}>
                <code>{row.id}</code><b>Accepted</b><span>{row.signer}</span><time>{row.time}</time>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
