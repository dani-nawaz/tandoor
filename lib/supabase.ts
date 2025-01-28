import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://xwbknjxvbocbcevedlrh.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

if (!supabaseKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_KEY environment variable")
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Verify the client is initialized
async function verifySupabaseConnection() {
  const { error } = await supabase.from("orders").select("count", { count: "exact", head: true })
  if (error) {
    console.error("Error connecting to Supabase:", error.message)
    throw new Error("Failed to connect to Supabase")
  }

  console.log("Successfully connected to Supabase")
}

export async function initSupabase() {
  await verifySupabaseConnection()
}

