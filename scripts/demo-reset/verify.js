#!/usr/bin/env node
/**
 * Confirms the database is empty and the schema survived the reset.
 *
 *   node scripts/demo-reset/verify.js
 *
 * Exits non-zero if any table still holds rows, or if a table the app depends
 * on has gone missing — the failure mode that matters, since an empty demo and
 * a broken demo look identical from the API until someone tries to post.
 */

const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const dep = (name) => require(path.join(ROOT, 'backend', 'node_modules', name));

dep('dotenv').config({ path: path.join(ROOT, 'backend', '.env') });
const { createClient } = dep('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

const TABLES = ['profiles', 'listings', 'view_requests', 'favourites', 'security_audit_logs'];
const BUCKET = 'listing-photos';

async function listStorageRecursive(prefix = '') {
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 10000 });
  if (error) throw new Error(error.message);

  const files = [];
  for (const entry of data) {
    const key = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id === null) files.push(...(await listStorageRecursive(key)));
    else files.push(key);
  }
  return files;
}

async function main() {
  console.log(`\nVerifying ${new URL(SUPABASE_URL).hostname}\n`);
  let failed = false;

  for (const table of TABLES) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      // Reaching the table at all is the schema check: a dropped table errors
      // here rather than reporting zero rows.
      console.log(`  ✖ ${table.padEnd(24)} unreachable — ${error.message}`);
      failed = true;
    } else if (count > 0) {
      console.log(`  ✖ ${table.padEnd(24)} ${count} rows remain`);
      failed = true;
    } else {
      console.log(`  ✔ ${table.padEnd(24)} empty, schema intact`);
    }
  }

  const { data: userPage, error: userErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (userErr) {
    console.log(`  ✖ ${'auth.users'.padEnd(24)} ${userErr.message}`);
    failed = true;
  } else {
    const n = userPage.users.length;
    console.log(`  ${n ? 'ℹ' : '✔'} ${'auth.users'.padEnd(24)} ${n ? 'accounts still present' : 'no accounts'}`);
  }

  const files = await listStorageRecursive();
  console.log(`  ${files.length ? 'ℹ' : '✔'} ${`storage:${BUCKET}`.padEnd(24)} ${files.length} objects`);

  console.log(`\n${failed ? '✖ Not clean — see above.' : '✔ Database is empty and every table is still reachable.'}\n`);
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(`\n✖ Verify failed: ${err.message}\n`);
  process.exit(1);
});
