import { readFile } from 'node:fs/promises'

/**
 * Read a source file for the spec-lock suites, with line endings normalised.
 *
 * The suites assert against literal source text, and this repo checks out with
 * `core.autocrlf=true`. So the same file is LF in one working tree and CRLF in
 * the next, and a pattern written as `\.trident-diagram,\n\.nectar-network`
 * matches on the machine it was written on and nowhere else. Worse, the break
 * usually surfaces as `Cannot read properties of null` from a `.match(...)[0]`
 * rather than as a message about what drifted.
 *
 * Normalising here means a spec-lock can be written the way the source reads
 * and stay true on any checkout. Nothing in the suite cares which bytes end a
 * line; every one of them cares what is on it.
 */
export async function readSource(path) {
  return (await readFile(path, 'utf8')).replace(/\r\n/g, '\n')
}
