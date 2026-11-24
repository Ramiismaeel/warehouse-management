/** Mirrors backend CustomerResponse. Every field except name is optional. */
export interface Customer {
  id: number
  name: string
  email: string | null
  phone: string | null
  street: string | null
  /** PLZ, 5 digits. */
  zipCode: string | null
  /** Ort. */
  city: string | null
  /** ISO timestamp. */
  createdAt: string
  /** ISO timestamp. */
  updatedAt: string
}

/** Mirrors backend CustomerRequest (create and update). */
export interface CustomerRequest {
  name: string
  email: string | null
  phone: string | null
  street: string | null
  zipCode: string | null
  city: string | null
}
