import LegalDocument from './LegalDocument'
import { legalDocument } from '../content/legal'

export default function LegalNotice() {
  return <LegalDocument doc={legalDocument} />
}
