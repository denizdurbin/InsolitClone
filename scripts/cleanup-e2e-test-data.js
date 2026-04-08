#!/usr/bin/env node
// Purges any leftover e2e test data from a previous crashed CI run.
// Called as a pre-flight step before e2e tests run in CI.
const { createClient } = require('@supabase/supabase-js')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.log('Supabase env vars not set, skipping cleanup.')
  process.exit(0)
}

const client = createClient(url, key)

client
  .from('users')
  .delete()
  .like('email', '%@insolit-test.local')
  .then(({ error }) => {
    if (error) {
      console.error('Cleanup warning:', error.message)
    } else {
      console.log('Pre-flight cleanup done.')
    }
  })
