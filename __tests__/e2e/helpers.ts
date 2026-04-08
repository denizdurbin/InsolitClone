import { vi } from 'vitest'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/utils/supabase/admin'

/**
 * Injects a session token into the mocked cookie store so that
 * getCurrentUserFromCookie() finds it during e2e tests.
 */
export function mockCookies(token: string | null) {
  vi.mocked(cookies).mockResolvedValue({
    get: vi.fn().mockReturnValue(token ? { value: token } : undefined),
  } as never)
}

/**
 * Deletes a test user (and all related rows via CASCADE) by email.
 * Call this in afterEach / afterAll to keep the DB clean.
 */
export async function deleteUserByEmail(email: string) {
  const admin = createAdminClient()
  await admin.from('users').delete().eq('email', email.toLowerCase())
}

/**
 * Extracts the session cookie value set by a register/login response.
 */
export function extractSessionCookie(response: Response): string | null {
  const header = response.headers.get('set-cookie') ?? ''
  const match = header.match(/insolit_session=([^;]+)/)
  return match?.[1] ?? null
}
