import { SqliteSaver } from '@langchain/langgraph-checkpoint-sqlite'
import { mkdirSync } from 'fs'
import { join } from 'path'

// File-based checkpointer — survives across HTTP requests and Next.js route recompilations.
// Any module instance that calls getCheckpointer() gets a saver backed by the same SQLite file,
// so a run started in /api/eval/runs can be resumed in /api/eval/reviews/[id].

function createCheckpointer(): SqliteSaver {
  const dataDir = join(process.cwd(), 'data')
  mkdirSync(dataDir, { recursive: true })
  return SqliteSaver.fromConnString(join(dataDir, 'eval-checkpoints.db'))
}

let _checkpointer: SqliteSaver | null = null

export function getCheckpointer(): SqliteSaver {
  if (!_checkpointer) {
    _checkpointer = createCheckpointer()
  }
  return _checkpointer
}
