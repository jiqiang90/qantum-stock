import { createClient } from "@supabase/supabase-js";

const url = requiredEnvironment("SUPABASE_URL");
const serviceRoleKey = requiredEnvironment("SUPABASE_SERVICE_ROLE_KEY");
const email = requiredEnvironment("E2E_TEAM_LEADER_EMAIL");
const password = requiredEnvironment("E2E_TEAM_LEADER_PASSWORD");
const hostname = new URL(url).hostname;

if (hostname !== "127.0.0.1" && hostname !== "localhost") {
  throw new Error("This command provisions local Supabase only.");
}

const client = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
const { data: users, error: listError } = await client.auth.admin.listUsers({
  page: 1,
  perPage: 1_000,
});

if (listError) {
  throw new Error("Unable to inspect local demo users.");
}

const existing = users.users.find((user) => user.email === email);
const result = existing
  ? await client.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    })
  : await client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

if (result.error) {
  throw new Error("Unable to provision the local Demo Team Leader.");
}

console.log("Local Demo Team Leader provisioned.");

function requiredEnvironment(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}
