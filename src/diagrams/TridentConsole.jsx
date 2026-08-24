import { ConsoleChrome, ConsoleGlyph } from './ConsoleChrome'
import { useScrollPhase } from './useScrollPhase'

/**
 * Trident - the three prongs are the product, so they are the interface.
 *
 * Same surface as the landing workspace: window chrome with the monogram in
 * the breadcrumb, a left rail in the workspace's nav grammar, then the task,
 * the checkpoint, and the receipt. Scrolling the section runs one governed
 * task end to end. The checkpoint hold owns the widest stretch of scroll,
 * because that beat is the headline - any model can propose, none can decide.
 */

const PROVIDERS = [
  { name: 'Anthropic', meta: 'External - attested' },
  { name: 'OpenAI', meta: 'External - attested' },
  { name: 'On-site', meta: 'Local runtime', kind: 'site' },
]

const STEPS = ['Propose', 'Validate', 'Checkpoint', 'Receipt']

const PHASES = [
  { span: 1, step: 0, state: 'run', status: 'RUNNING', schema: 'Awaiting proposal', verdict: 'proposing' },
  { span: 1, step: 1, state: 'run', status: 'VALIDATING', schema: 'Checking against task contract', verdict: 'validating' },
  { span: 1, step: 1, state: 'valid', status: 'VALIDATED', schema: '19 fields - contract satisfied', verdict: 'validated' },
  { span: 2.2, step: 2, state: 'hold', status: 'HOLDING', schema: '19 fields - contract satisfied', verdict: 'held' },
  { span: 1.2, step: 2, state: 'signed', status: 'SIGNED', schema: '19 fields - contract satisfied', verdict: 'signed' },
  { span: 2, step: 3, state: 'signed', status: 'RELEASED', schema: '19 fields - contract satisfied', verdict: 'receipted', commit: true },
]

const REST = PHASES.length - 1

const TONE = { run: 'run', valid: 'valid', hold: 'hold', signed: 'signed' }

const VERDICTS = {
  proposing: { label: 'Proposal in flight', note: 'Anthropic is drafting. No authority granted.' },
  validating: { label: 'Schema check running', note: 'Output must match the task contract or it is discarded.' },
  validated: { label: 'Schema valid', note: 'Contract satisfied. Work is now eligible for review.' },
  held: { label: 'Held for site authority', note: 'Nothing advances until a named person at the site signs.' },
  signed: { label: 'Accepted by M. Avdol', note: 'Site signature recorded. Authority stayed local.' },
  receipted: { label: 'Receipt written', note: 'Run is replayable without the model being available.' },
}

const RECEIPTS = [
  { id: 'REV-018-TR3-1044', signer: 'M. Avdol', time: '14:07' },
  { id: 'REV-018-TR3-1043', signer: 'J. Kujo', time: '11:52' },
  { id: 'REV-018-TR3-1042', signer: 'M. Avdol', time: '09:41' },
]

export default function TridentConsole({ animate = true, reduced = false, section }) {
  const phase = useScrollPhase(PHASES, { reduced, target: section })
  const state = PHASES[phase] ?? PHASES[REST]
  const verdict = VERDICTS[state.verdict]

  return (
    <div className="pconsole">
      <ConsoleChrome name="Trident" scope="Run 018-017" live="Site authority" pulse={animate} />

      <div className="pconsole-body tc-body">
        <div className="tc-rail">
          <strong>PROVIDERS</strong>
          {PROVIDERS.map((item, i) => (
            <div className={`tc-provider${i === 0 ? ' active' : ''}`} key={item.name}>
              <ConsoleGlyph kind={item.kind ?? 'model'} />
              <span>{item.name}<small>{item.meta}</small></span>
              {i === 0 ? <em>ACTIVE</em> : null}
            </div>
          ))}

          {/* The site sits in the same rail as the providers, because it is an
              actor in the run and not a setting on it. */}
          <strong className="tc-rail-split">AUTHORITY</strong>
          <div className="tc-provider is-authority">
            <ConsoleGlyph kind="site" />
            <span>Site of record<small>PI or Sub-I signs</small></span>
          </div>

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
              <div><dt>Provider</dt><dd>Anthropic - identity attested</dd></div>
              <div><dt>Schema</dt><dd>{state.schema}</dd></div>
              <div><dt>Authority</dt><dd>Site of record - PI or Sub-I</dd></div>
            </dl>
            <p className="tc-verdict"><strong>{verdict.label}</strong><small>{verdict.note}</small></p>
          </div>

          <div className="tc-ledger">
            <p className="pconsole-kicker">Execution receipts</p>
            <header><small>REV</small><small>DECISION</small><small>SIGNER</small><small>TIME</small></header>
            {RECEIPTS.map((row, i) => (
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
