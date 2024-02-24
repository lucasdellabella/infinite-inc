import { Database } from "@/supabase"
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  try {
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  } catch (e) {
    console.log(e)
  }
}

export function dbNormalizeStr(x: string) {
  return x.replaceAll(" ", "_").replace(/\W/g, "").toLowerCase()
}
