import { vi } from 'vitest'

// Stub Next.js server-only guard globally
vi.mock('server-only', () => ({}))
