// One key per run avoids overwriting runs saved by another tab. No Firebase writes.
export function progressPrefix(userId, levelId) {
  return `basement-progress-v1:${encodeURIComponent(userId || 'guest')}:${encodeURIComponent(levelId)}:`
}

export function validRange(start, end) {
  return Number.isInteger(start) && Number.isInteger(end) && start >= 0 && end <= 100 && start < end
}

export function readRuns(storage, prefix) {
  const runs = []
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    if (!key?.startsWith(prefix)) continue
    const run = JSON.parse(storage.getItem(key))
    if (!run || typeof run.id !== 'string' || key !== prefix + run.id ||
        !validRange(run.start, run.end) || !Number.isFinite(run.createdAt) ||
        !Number.isFinite(new Date(run.createdAt).getTime())) throw new Error('Invalid saved run')
    runs.push(run)
  }
  return runs.sort((a, b) => b.createdAt - a.createdAt || a.id.localeCompare(b.id))
}

export function saveRun(storage, prefix, run) {
  if (!validRange(run.start, run.end)) throw new Error('Invalid percentage range')
  storage.setItem(prefix + run.id, JSON.stringify(run))
}

export function bestProgress(runs) {
  return runs.reduce((best, run) => run.start === 0 ? Math.max(best, run.end) : best, 0)
}
