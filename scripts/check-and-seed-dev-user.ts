import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Parse .env directly
const envContent = fs.readFileSync('.env', 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = (match[2] || '').trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[match[1]] = val;
  }
});

const url = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing Supabase URL or Service Role Key in .env');
  process.exit(1);
}

const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const targetEmail = env.VITE_DEV_USER_EMAIL || 'test@example.com';
  const targetPassword = env.VITE_DEV_USER_PASSWORD || 'password123';

  console.log(`Checking user: ${targetEmail}`);
  const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();

  if (listError) {
    console.error('Failed to list users:', listError);
    process.exit(1);
  }

  console.log(`Total users found: ${usersData.users.length}`);
  const existingUser = usersData.users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());

  if (existingUser) {
    console.log(`User ${targetEmail} exists (${existingUser.id}). Updating password to confirmed: ${targetPassword}`);
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
      password: targetPassword,
      email_confirm: true,
    });
    if (updateError) {
      console.error('Failed to update password:', updateError);
    } else {
      console.log(`Password for ${targetEmail} updated successfully to '${targetPassword}'!`);
    }
  } else {
    console.log(`User ${targetEmail} does not exist. Creating user...`);
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: targetEmail,
      password: targetPassword,
      email_confirm: true,
      user_metadata: { full_name: 'Dev Test Learner' },
    });

    if (createError) {
      console.error('Failed to create user:', createError);
      process.exit(1);
    }
    console.log(`User ${targetEmail} created successfully (${newUser.user.id}) with password '${targetPassword}'!`);

    // Ensure active track enrollment so login immediately routes to /app!
    console.log('Enrolling into active track fullstack-ts...');
    const { error: enrollError } = await supabaseAdmin
      .from('user_active_track')
      .upsert({ user_id: newUser.user.id, track_id: 'fullstack-ts' });

    if (enrollError) {
      console.warn('Track enrollment warning:', enrollError);
    } else {
      console.log('Enrolled into fullstack-ts!');
    }
  }

  // Also test signing in with anon client to verify password works:
  const anonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
  const anonClient = createClient(url, anonKey);
  const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
    email: targetEmail,
    password: targetPassword,
  });

  if (signInError) {
    console.error('Test login with anon client FAILED:', signInError.message);
  } else {
    console.log('Test login with anon client SUCCESSFUL! User ID:', signInData.user.id);
  }
}

main().catch(console.error);
