
import { createClient } from '@supabase/supabase-js';

// Mock env vars if not present (this script is run in node, so it might not pick up .env files automatically if not configured)
// In a real scenario, we'd ensure these are set. I will try to read them or just check if the client can be initialized.
// For this environment, I'll rely on the fact that `lib/supabase.ts` uses `process.env`.
// I will import the client from lib/supabase.ts but I need to mock AsyncStorage since it's React Native specific.

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Error: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY must be set.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyDb() {
  console.log("Verifying Database Connection...");

  try {
    // Check services table (public read)
    const { data: services, error: servicesError } = await supabase.from('services').select('*').limit(1);

    if (servicesError) {
      console.error("Error fetching services:", servicesError);
      process.exit(1);
    }

    console.log("✅ Services table accessible. Found", services.length, "services.");

    // Check barbers table (public read)
    const { data: barbers, error: barbersError } = await supabase.from('barbers').select('*').limit(1);

    if (barbersError) {
      console.error("Error fetching barbers:", barbersError);
      process.exit(1);
    }

    console.log("✅ Barbers table accessible. Found", barbers.length, "barbers.");

    console.log("Database verification successful!");
  } catch (err) {
    console.error("Unexpected error:", err);
    process.exit(1);
  }
}

verifyDb();
