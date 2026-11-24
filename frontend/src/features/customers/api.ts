import { apiClient } from "@/api/client"
import type { Customer, CustomerRequest } from "@/features/customers/types"

export async function fetchCustomers(): Promise<Customer[]> {
  const { data } = await apiClient.get<Customer[]>("/customers")
  return data
}

/** 404 when no customer has this id. */
export async function fetchCustomer(id: number): Promise<Customer> {
  const { data } = await apiClient.get<Customer>(`/customers/${id}`)
  return data
}

/** 400 with `errors` on invalid fields. */
export async function createCustomer(request: CustomerRequest): Promise<Customer> {
  const { data } = await apiClient.post<Customer>("/customers", request)
  return data
}

/** Same errors as createCustomer, plus 404 when the customer no longer exists. */
export async function updateCustomer(id: number, request: CustomerRequest): Promise<Customer> {
  const { data } = await apiClient.put<Customer>(`/customers/${id}`, request)
  return data
}

/** 409 when the customer is used in a Warenausgang (business rule 7). */
export async function deleteCustomer(id: number): Promise<void> {
  await apiClient.delete(`/customers/${id}`)
}
