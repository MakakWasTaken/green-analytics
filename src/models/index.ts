import { Timestamp } from 'firebase/firestore/lite'

export interface DefaultFirestoreDoc {
  id: string
  createdAt: Timestamp
}
