import { Scale, ArrowUpRight } from 'lucide-react'
import PageShell from '../components/layout/PageShell'
import theme from '../components/layout/ThemedPage.module.css'
import styles from './LegalPage.module.css'
import { useLanguage } from '../hooks/useLanguage'

export default function LegalDocument({ doc }) {
  const { locale } = useLanguage()
  const content = doc[locale] || doc.en
  return (
    <PageShell className={theme.pageShell}>
      <div className={theme.glow} aria-hidden="true" />
      <header className={styles.hero}>
        <span className={theme.eyebrow}><Scale size={14} aria-hidden="true" /> {content.eyebrow}</span>
        <h1 className={styles.title}>{content.title}</h1>
        <p className={styles.intro}>{content.intro}</p>
        <span className={styles.updated}>{content.updatedLabel}: {content.updated}</span>
      </header>
      <div className={styles.document}>
        {content.sections.map(section => (
          <section key={section.heading} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.heading}</h2>
            {section.body.map((block, index) =>
              Array.isArray(block) ? (
                <ul key={index} className={styles.list}>
                  {block.map(item => <li key={item}>{item}</li>)}
                </ul>
              ) : (
                <p key={index} className={styles.paragraph}>{block}</p>
              )
            )}
            {section.link && (
              <a
                className={styles.inlineLink}
                href={section.link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {section.link.label} <ArrowUpRight size={13} aria-hidden="true" />
              </a>
            )}
          </section>
        ))}
      </div>
    </PageShell>
  )
}
