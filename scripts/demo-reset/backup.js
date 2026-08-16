#!/usr/bin/env node
/**
 * Dumps every row the app owns to timestamped JSON, before anything is deleted.
 *
 * This is a *data* backup only. It does not capture schema, RLS policies or
 * indexes — the Supabase CLI (`supabase db pull`) is the tool for that, and
 * `scripts/demo-reset/README.md` explains why that step still has to happen.
 *
 *   node scripts/demo-reset/backup.js
 *
 * Writes to backups/<timestamp>/ at the repo root (gitignored — these files
 * contain real user data and must never be committed).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

// Both deps are resolved out of backend/node_modules so this script needs no
// install of its own.
const dep = (name) => require(path.join(ROOT, 'backend', 'node_modules', name));

dep('dotenv').config({ path: path.join(ROOT, 'backend', '.env') });
const { createClient } = dep('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('✖ SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in backend/.env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// Every table the application reads or writes. Order is irrelevant here —
// it matters in reset.js, where foreign keys do.
const TABLES = ['profiles', 'listings', 'view_requests', 'favourites', 'security_audit_logs'];
const BUCKET = 'listing-photos';
const PAGE = 1000;

async function dumpTable(name) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(name)
      .select('*')
      .range(from, from + PAGE - 1);

    // A table that does not exist is worth reporting, not worth aborting over —
    // security_audit_logs is optional in some environments.
    if (error) return { name, rows: null, error: error.message };
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return { name, rows, error: null };
}

async function dumpAuthUsers() {
  const users = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PAGE });
    if (error) return { name: 'auth.users', rows: null, error: error.message };
    users.push(...data.users);
    if (data.users.length < PAGE) break;
  }
  return { name: 'auth.users', rows: users, error: null };
}

// Photos are stored under a per-user folder, so a flat list() returns folders
// (id === null) rather than objects. Walk into each one.
async function listStorageRecursive(prefix = '') {
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit: 10000 });
  if (error) throw new Error(error.message);

  const files = [];
  for (const entry of data) {
    const key = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.id === null) files.push(...(await listStorageRecursive(key)));
    else files.push({ ...entry, path: key });
  }
  return files;
}

// The photo bytes themselves are the part that cannot be recreated, so pull
// them down rather than just recording their names.
async function dumpStorage(dir) {
  let files;
  try {
    files = await listStorageRecursive();
  } catch (err) {
    return { name: `storage:${BUCKET}`, rows: null, error: err.message };
  }

  const outDir = path.join(dir, 'storage', BUCKET);
  for (const file of files) {
    const { data, error } = await supabase.storage.from(BUCKET).download(file.path);
    if (error) return { name: `storage:${BUCKET}`, rows: null, error: `${file.path}: ${error.message}` };
    const dest = path.join(outDir, file.path);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, Buffer.from(await data.arrayBuffer()));
  }
  return { name: `storage:${BUCKET}`, rows: files, error: null };
}

// Best-effort schema capture. PostgREST publishes an OpenAPI document at the
// REST root describing every exposed table and column, which is not a
// substitute for `supabase db pull` — it has no RLS policies, indexes,
// constraints or defaults — but it is better than the nothing the repo has
// today, and it costs one request.
async function dumpSchemaHint() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` },
  });
  if (!res.ok) return { name: 'schema-hint', rows: null, error: `HTTP ${res.status}` };
  const spec = await res.json();
  return { name: 'schema-hint', rows: spec.definitions || spec.components?.schemas || {}, error: null };
}

async function main() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = path.join(ROOT, 'backups', stamp);
  fs.mkdirSync(dir, { recursive: true });

  console.log(`Backing up ${new URL(SUPABASE_URL).hostname} → backups/${stamp}/\n`);

  const results = [
    ...(await Promise.all(TABLES.map(dumpTable))),
    await dumpAuthUsers(),
    await dumpStorage(dir),
  ];

  const manifest = { takenAt: new Date().toISOString(), project: SUPABASE_URL, counts: {}, errors: {} };

  for (const { name, rows, error } of results) {
    if (error) {
      manifest.errors[name] = error;
      console.log(`  ✖ ${name.padEnd(22)} ${error}`);
      continue;
    }
    const file = `${name.replace(/[.:]/g, '_')}.json`;
    fs.writeFileSync(path.join(dir, file), JSON.stringify(rows, null, 2));
    manifest.counts[name] = rows.length;
    console.log(`  ✔ ${name.padEnd(22)} ${String(rows.length).padStart(5)} rows → ${file}`);
  }

  const schema = await dumpSchemaHint();
  if (schema.error) {
    manifest.errors['schema-hint'] = schema.error;
    console.log(`  ✖ ${'schema-hint'.padEnd(22)} ${schema.error}`);
  } else {
    fs.writeFileSync(path.join(dir, 'schema-hint.json'), JSON.stringify(schema.rows, null, 2));
    const tables = Object.keys(schema.rows).length;
    console.log(`  ✔ ${'schema-hint'.padEnd(22)} ${String(tables).padStart(5)} tables → schema-hint.json`);
  }

  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  const failed = Object.keys(manifest.errors).length;
  console.log(`\n${failed ? '⚠' : '✔'} Backup written to backups/${stamp}/`);
  if (failed) {
    console.log('  Some sources failed — read the errors above before running reset.js.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('✖ Backup failed:', err.message);
  process.exit(1);
});
