import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cookie } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'
import styles from './CookieConsent.module.css'

const STORAGE_KEY = 'blist.cookieConsent'

export const OPEN_COOKIE_CONSENT_EVENT = 'blist:open-cookie-consent'

function readStoredConsent() {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export default function CookieConsent() {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!readStoredConsent()) setVisible(true)
    const handleOpen = () => {
      try {
        window.localStorage.removeItem(STORAGE_KEY)
      } catch {
        // Storage unavailable; just show the banner again.
      }
      setVisible(true)
    }
    window.addEventListener(OPEN_COOKIE_CONSENT_EVENT, handleOpen)
    return () => window.removeEventListener(OPEN_COOKIE_CONSENT_EVENT, handleOpen)
  }, [])

  if (!visible) return null

  const decide = (value) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // Storage unavailable; still close for this visit.
    }
    setVisible(false)
  }

  return (
    <div className={styles.banner} role="dialog" aria-live="polite" aria-label={t('cookie.title')}>
      <span className={styles.icon} aria-hidden="true">
        <Cookie size={20} />
      </span>
      <div className={styles.body}>
        <p className={styles.message}>{t('cookie.message')}</p>
        <Link to="/privacy" className={styles.more}>{t('footer.privacy')}</Link>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.reject} onClick={() => decide('rejected')}>
          {t('cookie.reject')}
        </button>
        <button type="button" className={styles.accept} onClick={() => decide('accepted')}>
          {t('cookie.accept')}
        </button>
      </div>
    </div>
  )
}
