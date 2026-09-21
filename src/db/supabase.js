import {createClient} from "@supabase/supabase-js";
import {mockSupabase} from "./mockClient";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Check if the configured URL is missing, invalid, or the expired tutorial URL
const isDeadTutorialUrl =
  !supabaseUrl || supabaseUrl.includes("ykygqfljwketdjfxanoh");

export const isMockMode =
  import.meta.env.VITE_USE_MOCK === "true" || isDeadTutorialUrl;

const supabase = isMockMode
  ? mockSupabase
  : createClient(supabaseUrl, supabaseKey);

export default supabase;
