import { createClient } from "@supabase/supabase-js";
import { publish } from "./events";

const supabaseUrl = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: any;

function supabaseInitialize() {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export {supabaseInitialize}