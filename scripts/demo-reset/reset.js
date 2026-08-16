#!/usr/bin/env node
/**
 * Empties the OpenSpace database for a clean demo.
 *
 * Deletes ROWS. It does not drop or recreate tables — the schema, its RLS
 * policies and its indexes are left exactly as they are, so the application
 * keeps working against an empty database with no migration step. That is
 * deliberate: the repo has no baseline migration (see supabase/README.md), so
 * a dropped schema could not be rebuilt from this codebase.
 *
 *   node scripts/demo-reset/reset.js                # dry run — prints the plan, deletes nothing
 *   node scripts/demo-reset/reset.js --confirm      # actually deletes
 *
 * Flags:
 *   --keep-auth      leave auth.users alone (accounts survive, their data does not)
 *   --keep-storage   leave uploaded photos in the listing-photos bucket
 *
 * THIS IS IRREVERSIBLE. Run scripts/demo-reset/backup.js first.
 */

const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const dep = (name) => require(path.join(ROOT, 'backend', 'node_modules', name));

dep('dotenv').config({ path: path.join(ROOT, 'backend', '.env') });
const { createClient } = dep('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('✖ SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in backend/.env');
  process.exit(1);
}

const args = process.argv.slice(2);
const CONFIRM = args.includes('--confirm');
const KEEP_AUTH = args.includes('--keep-auth');
const KEEP_STORAGE = args.includes('--keep-storage');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// Child tables first: favourites and view_requests both reference listings,
// listings references profiles, profiles references auth.users. Deleting in
// this order means no delete is ever blocked by a foreign key, whether or not
// the constraint happens to cascade.
const TABLES = [
  { name: 'favourites', pk: 'id' },
  { name: 'view_requests', pk: 'id' },
  { name: 'listings', pk: 'id' },
  { name: 'security_audit_logs', pk: 'id' },
  { name: 'profiles', pk: 'id' },
];

const BUCKET = 'listing-photos';

async function countRows(table) {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  return error ? null : count;
}

async function deleteAllRows({ name, pk }) {
  // PostgREST refuses an unfiltered delete, so use a predicate that matches
  // every row instead of enumerating primary keys.
  const { error } = await supabase.from(name).delete().not(pk, 'is', null);
  if (error) throw new Error(`${name}: ${error.message}`);
  return countRows(name);
}

async function listAuthUsers() {
  const users = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`auth.users: ${error.message}`);
    users.push(...data.users);
    if (data.users.length < 1000) break;
  }
  return users;
}

async function listStorageRecursive(prefix = '') {
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 10000 });
  if (error) throw new Error(`storage: ${error.message}`);

  const files = [];
  for (const entry of data) {
    const key = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id === null) files.push(...(await listStorageRecursive(key)));
    else files.push(key);
  }
  return files;
}

async function main() {
  const host = new URL(SUPABASE_URL).hostname;

  console.log(`\n${CONFIRM ? '⚠  DELETING FROM' : 'Dry run against'}  ${host}\n`);

  const plan = [];
  for (const table of TABLES) {
    plan.push({ label: table.name, count: await countRows(table.name) });
  }

  const users = KEEP_AUTH ? [] : await listAuthUsers();
  if (!KEEP_AUTH) plan.push({ label: 'auth.users', count: users.length });

  const files = KEEP_STORAGE ? [] : await listStorageRecursive();
  if (!KEEP_STORAGE) plan.push({ label: `storage:${BUCKET}`, count: files.length });

  for (const { label, count } of plan) {
    console.log(`  ${label.padEnd(24)} ${count === null ? '  n/a' : String(count).padStart(5)} to delete`);
  }
  if (KEEP_AUTH) console.log('  auth.users               kept (--keep-auth)');
  if (KEEP_STORAGE) console.log(`  storage:${BUCKET}   kept (--keep-storage)`);

  if (!CONFIRM) {
    console.log('\nDry run — nothing was deleted. Re-run with --confirm to execute.');
    console.log('Make sure scripts/demo-reset/backup.js has been run first.\n');
    return;
  }

  console.log('');
  for (const table of TABLES) {
    const remaining = await deleteAllRows(table);
    console.log(`  ✔ ${table.name.padEnd(24)} emptied (${remaining ?? '?'} remaining)`);
  }

  if (!KEEP_STORAGE && files.length) {
    // remove() caps at 1000 paths per call.
    for (let i = 0; i < files.length; i += 1000) {
      const { error } = await supabase.storage.from(BUCKET).remove(files.slice(i, i + 1000));
      if (error) throw new Error(`storage: ${error.message}`);
    }
    console.log(`  ✔ ${`storage:${BUCKET}`.padEnd(24)} ${files.length} objects removed`);
  }

  // Last, because deleting a user cascades into anything still referencing it.
  if (!KEEP_AUTH) {
    for (const user of users) {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw new Error(`auth.users ${user.id}: ${error.message}`);
    }
    console.log(`  ✔ ${'auth.users'.padEnd(24)} ${users.length} accounts removed`);
  }

  console.log('\n✔ Database is empty. Verify with: node scripts/demo-reset/verify.js\n');
}

main().catch((err) => {
  console.error(`\n✖ Reset failed: ${err.message}`);
  console.error('  The database may be partially emptied. Check with verify.js before retrying.\n');
  process.exit(1);
});
