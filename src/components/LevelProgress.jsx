import { useCallback, useEffect, useRef, useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { bestProgress, progressPrefix, readRuns, saveRun, validRange } from '../utils/levelProgress'
import Input from './ui/Input'
import Button from './ui/Button'
import Modal from './ui/Modal'
import theme from './layout/ThemedPage.module.css'
import styles from './LevelProgress.module.css'

export default function LevelProgress({ userId, levelId }) {
  const { t, locale } = useLanguage()
  const prefix = progressPrefix(userId, levelId)
  const [runs, setRuns] = useState([])
  const [start, setStart] = useState('0')
  const [end, setEnd] = useState('')
  const [invalid, setInvalid] = useState(false)
  const [error, setError] = useState(false)
  const [status, setStatus] = useState('')
  const [ready, setReady] = useState(false)
  const [removing, setRemoving] = useState(null)
  const [visible, setVisible] = useState(5)
  const endRef = useRef(null)
  const startRef = useRef(null)

  const refresh = useCallback(() => {
    try {
      setRuns(readRuns(window.localStorage, prefix))
      setError(false)
      setReady(true)
    } catch { setError(true); setReady(false); setStatus('') }
  }, [prefix])

  useEffect(() => {
    refresh()
    const onStorage = event => { if (!event.key || event.key.startsWith(prefix)) refresh() }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [prefix, refresh])

  function addRun(event) {
    event.preventDefault()
    setStatus('')
    if (start.trim() === '' || end.trim() === '' || !validRange(Number(start), Number(end))) {
      setInvalid(true)
      const target = start.trim() === '' || !Number.isInteger(Number(start)) || Number(start) < 0 || Number(start) >= 100 ? startRef : endRef
      target.current?.focus()
      return
    }
    try {
      const run = { id: crypto.randomUUID(), start: Number(start), end: Number(end), createdAt: Date.now() }
      saveRun(window.localStorage, prefix, run)
      refresh()
      setEnd('')
      setInvalid(false)
      setStatus('saved')
      endRef.current?.focus()
    } catch { setStatus(''); setError(true) }
  }

  function removeRun() {
    try {
      window.localStorage.removeItem(prefix + removing.id)
      refresh()
      setRemoving(null)
      setStatus('removed')
    } catch { setStatus(''); setError(true) }
  }

  const best = bestProgress(runs)
  return (
    <section className={`${theme.surface} ${styles.card}`} aria-label={t('progress.title')}>
      <div className={styles.heading}>
        <div><span className={theme.sectionLabel}>{t('progress.personal')}</span><h2>{t('progress.title')}</h2></div>
        <div className={styles.best}><strong>{best}%</strong><span>{t('progress.best')}</span></div>
      </div>
      <progress className={styles.meter} max="100" value={best} aria-label={t('progress.best')} />
      <p className={styles.note}>{t('progress.local')}</p>
      <form noValidate onSubmit={addRun} className={styles.form}>
        <Input ref={startRef} type="number" min="0" max="99" step="1" label={t('progress.from')} value={start} error={invalid && (start.trim() === '' || !Number.isInteger(Number(start)) || Number(start) < 0 || Number(start) >= 100) ? t('progress.invalid') : undefined} onChange={event => { setStart(event.target.value); setInvalid(false) }} />
        <Input ref={endRef} type="number" min="1" max="100" step="1" label={t('progress.to')} placeholder="75" value={end} error={invalid ? t('progress.invalid') : undefined} onChange={event => { setEnd(event.target.value); setInvalid(false) }} />
        <Button type="submit" disabled={!ready}>{t('progress.add')}</Button>
      </form>
      <p className={styles.note}>{t('progress.hint')}</p>
      <div role="status" className={styles.status}>{status ? t(`progress.${status}`) : ''}</div>
      {error && <div role="alert"><p>{t('progress.error')}</p><Button onClick={refresh} variant="secondary">{t('progress.retry')}</Button></div>}
      <h3>{t('progress.history')} ({runs.length})</h3>
      {ready && runs.length === 0 && <p className={styles.note}>{t('progress.empty')}</p>}
      <ul className={styles.runs}>
        {runs.slice(0, visible).map(run => (
          <li key={run.id}>
            <div><strong>{run.start}–{run.end}%</strong><span className={styles.note}>{run.start === 0 ? t('progress.normal') : t('progress.practice')}</span></div>
            <time dateTime={new Date(run.createdAt).toISOString()}>{new Date(run.createdAt).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}</time>
            <Button variant="ghost" size="sm" onClick={() => setRemoving(run)} aria-label={`${t('progress.remove')} ${run.start}–${run.end}%`}>{t('progress.remove')}</Button>
          </li>
        ))}
      </ul>
      {runs.length > visible && <Button variant="secondary" onClick={() => setVisible(count => count + 10)}>{t('progress.more')}</Button>}
      <Modal isOpen={!!removing} onClose={() => setRemoving(null)} title={t('progress.remove')}>
        <p>{t('progress.confirm', { run: removing ? `${removing.start}–${removing.end}%` : '' })}</p>
        {error && <p role="alert">{t('progress.error')}</p>}
        <div className={styles.actions}><Button variant="secondary" onClick={() => setRemoving(null)}>{t('progress.cancel')}</Button><Button onClick={removeRun}>{t('progress.remove')}</Button></div>
      </Modal>
    </section>
  )
}
