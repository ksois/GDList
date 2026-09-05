import LegalDocument from './LegalDocument'
import { privacyDocument } from '../content/privacy'

export default function PrivacyPolicy() {
  return <LegalDocument doc={privacyDocument} />
}
