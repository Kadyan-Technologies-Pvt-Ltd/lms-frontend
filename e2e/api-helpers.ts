import type { APIRequestContext } from '@playwright/test'

import { ADMIN_EMAIL, ADMIN_PASSWORD } from './credentials'

export async function getAdminToken(request: APIRequestContext): Promise<string> {
  const res = await request.post('/api/v1/auth/login/', { data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } })
  if (!res.ok()) throw new Error(`Admin login failed in test setup: ${res.status()} ${await res.text()}`)
  const body = await res.json()
  return body.access as string
}

export async function createTestMember(request: APIRequestContext, adminToken: string, overrides: Record<string, string> = {}) {
  // The suffix goes in the *name* too, not just the email — a prior run's
  // leaked member (e.g. one whose cleanup silently failed) named identically
  // "E2E Test" caused a real strict-mode failure once two of them existed
  // at once and a dropdown search matched both. Unique names make that class
  // of failure impossible even if a leak happens again.
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`
  const res = await request.post('/api/v1/members/', {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: {
      email: `e2e-${suffix}@test.com`,
      first_name: 'E2E',
      last_name: suffix,
      mobile: `9${suffix}`.slice(0, 10),
      joining_date: new Date().toISOString().slice(0, 10),
      ...overrides,
    },
  })
  if (!res.ok()) throw new Error(`Member creation failed in test setup: ${res.status()} ${await res.text()}`)
  return res.json() as Promise<{ id: string; member_id: string; email: string; generated_password: string; full_name: string }>
}

export async function deleteTestMember(request: APIRequestContext, adminToken: string, memberId: string) {
  const res = await request.delete(`/api/v1/members/${memberId}/`, { headers: { Authorization: `Bearer ${adminToken}` } })
  // Deliberately not `res.ok()`-gated with a throw-and-abandon — cleanup
  // runs in `finally`/`afterAll` blocks where throwing would mask the
  // original test failure. Logging loudly is enough to catch a leak without
  // hiding what actually broke the test.
  if (!res.ok() && res.status() !== 404) {
    console.error(`Test-member cleanup failed for ${memberId}: ${res.status()} ${await res.text()}`)
  }
}

export async function getActivePlan(request: APIRequestContext, adminToken: string) {
  const res = await request.get('/api/v1/memberships/plans/?is_active=true&page_size=1', {
    headers: { Authorization: `Bearer ${adminToken}` },
  })
  const body = await res.json()
  if (!body.data?.length) throw new Error('No active membership plan exists — tests need at least one.')
  return body.data[0] as { id: string; name: string; price: string; duration_days: number }
}

export async function assignMembership(request: APIRequestContext, adminToken: string, memberId: string, planId: string) {
  const res = await request.post('/api/v1/memberships/', {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: { member: memberId, plan: planId, start_date: new Date().toISOString().slice(0, 10) },
  })
  if (!res.ok()) throw new Error(`Membership assignment failed in test setup: ${res.status()} ${await res.text()}`)
  return res.json() as Promise<{ id: string; amount_due: string }>
}
