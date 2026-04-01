import { createClient } from '@supabase/supabase-js'

export const ADMIN_ENV_ERROR_MESSAGE =
  'Configuration serveur incomplete. Ajoute SUPABASE_SERVICE_ROLE_KEY dans .env.local puis redemarre le serveur.'

function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE ?? process.env.SUPABASE_SERVICE_KEY ?? ''
}

export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = getServiceRoleKey()

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(ADMIN_ENV_ERROR_MESSAGE)
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
