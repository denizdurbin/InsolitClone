import { vi } from 'vitest'

// Stub server-only guard
vi.mock('server-only', () => ({}))

// next/headers is still mocked — cookie transport doesn't exist outside Next.js.
// Individual tests inject session tokens manually via mockCookies().
vi.mock('next/headers', () => ({ cookies: vi.fn() }))
