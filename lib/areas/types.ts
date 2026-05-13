export type AreaScope = 'interior' | 'exterior'

export interface AreaRecord {
  id: string
  scope: AreaScope
  name: string
  active: boolean
  position: number
  createdAt?: string
  updatedAt?: string
}
