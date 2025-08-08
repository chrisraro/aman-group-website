'use server'

type ActivityModule =
  | 'brokerages'
  | 'agents'
  | 'model-houses'
  | 'loan-calculator'
  | 'lot-only'
  | (string & {}) // allow custom

type ActivityAction = 'create' | 'update' | 'delete' | 'reset' | (string & {})

export type AdminActivity = {
  id: string
  module: ActivityModule
  action: ActivityAction
  entityId?: string
  user?: string
  details?: Record<string, unknown>
  ts: number // unix ms
}

const KV_URL = process.env.KV_REST_API_URL
const KV_TOKEN = process.env.KV_REST_API_TOKEN

if (!KV_URL || !KV_TOKEN) {
  // We avoid throwing at import time in case this file is loaded in environments without KV.
  // Calls will throw with a clear message if invoked without config.
  console.warn(
    "[admin-activity] KV_REST_API_URL or KV_REST_API_TOKEN is not configured. Activity logging will be disabled.",
  )
}

async function kvPipeline(commands: (string | number)[][]) {
  if (!KV_URL || !KV_TOKEN) throw new Error("Upstash KV is not configured")
  const res = await fetch(`${KV_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
    // Route Handlers can call out to external services
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`KV pipeline error: ${res.status} ${text}`)
  }
  return res.json()
}

export async function recordAdminActivity(activity: Omit<AdminActivity, 'id' | 'ts'> & Partial<Pick<AdminActivity, 'ts'>>) {
  const entry: AdminActivity = {
    id: (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)),
    ts: activity.ts ?? Date.now(),
    module: activity.module,
    action: activity.action,
    entityId: activity.entityId,
    user: activity.user,
    details: activity.details,
  }

  const key = 'admin:recent-activity'
  // Keep last 100 (remove older ranks)
  await kvPipeline([
    ['ZADD', key, entry.ts, JSON.stringify(entry)],
    ['ZREMRANGEBYRANK', key, 0, -101], // leave only latest 100
  ])

  return entry
}

export async function incrementModuleChange(module: ActivityModule, delta = 1) {
  const key = 'admin:stats'
  await kvPipeline([
    ['HINCRBY', key, `${module}:changes`, delta],
    ['HINCRBY', key, 'totalChanges', delta],
    ['HSET', key, 'updatedAt', Date.now()],
  ])
  return true
}

export async function setCounts(counts: Partial<Record<'brokerages' | 'agents' | 'model-houses' | 'lot-only', number>>) {
  const key = 'admin:stats'
  const cmds: (string | number)[][] = []
  for (const [field, value] of Object.entries(counts)) {
    if (typeof value === 'number') {
      cmds.push(['HSET', key, `${field}:count`, value])
    }
  }
  if (cmds.length > 0) {
    cmds.push(['HSET', key, 'updatedAt', Date.now()])
    await kvPipeline(cmds)
  }
  return true
}

export async function getAdminStats(): Promise<Record<string, number | string>> {
  const key = 'admin:stats'
  const res = await kvPipeline([['HGETALL', key]])
  // Upstash returns [["field","value"], ...]
  const arr: [string, string][] = res?.[0]?.result ?? []
  const out: Record<string, number | string> = {}
  for (let i = 0; i < arr.length; i += 2) {
    const field = arr[i] as unknown as string
    const value = arr[i + 1] as unknown as string
    const num = Number(value)
    out[field] = Number.isNaN(num) ? value : num
  }
  return out
}

export async function getRecentActivity(limit = 10): Promise<AdminActivity[]> {
  const key = 'admin:recent-activity'
  const res = await kvPipeline([['ZREVRANGE', key, 0, Math.max(0, limit - 1)]])
  const list: string[] = res?.[0]?.result ?? []
  return list
    .map((s) => {
      try {
        return JSON.parse(s) as AdminActivity
      } catch {
        return null
      }
    })
    .filter(Boolean) as AdminActivity[]
}
