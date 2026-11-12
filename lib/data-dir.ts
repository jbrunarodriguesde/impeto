import 'server-only'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

// O /tmp da Vercel é efêmero: os dados podem desaparecer quando a função reinicia.
// Use DATABASE_URL e PostgreSQL externo para armazenamento permanente.
export const dataDir =
  process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
    ? '/tmp/.data'
    : process.env.LOCAL_DATABASE_DIR || join(process.cwd(), '.data')

export async function ensureDataDir(): Promise<string> {
  try {
    await mkdir(dataDir, { recursive: true })
    return dataDir
  } catch (error) {
    console.error('[Ímpeto] Não foi possível criar o diretório de dados:', dataDir, error)
    throw error
  }
}
