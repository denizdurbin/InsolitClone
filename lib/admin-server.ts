import 'server-only'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function parseAdminEmails(value?: string) {
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmailServer(email: string | null | undefined) {
  if (!email) {
    return false
  }

  const allowed = parseAdminEmails(process.env.ADMIN_EMAILS)
  if (allowed.length === 0) {
    return false
  }

  return allowed.includes(email.trim().toLowerCase())
}

export function getServiceSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing')
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey)
}
