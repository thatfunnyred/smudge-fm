import { createClient } from "@supabase/supabase-js";
// import { publish } from "./events";

const supabaseUrl = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: any;

function supabaseInitialize() {
    supabase = createClient(supabaseUrl, supabaseAnonKey);

    if(supabase) return;
}

async function uploadSong(filePath: string, file: File) {
    try {
        const { data, error } = await supabase.storage
            .from("user-saved-songs")
            .upload(filePath, file);

        if (error) {
            return { data: null, error };
        }

        return { data, error: null };

    } catch (error) {
        return { data: null, error };
    }
}

async function deleteSong(filePath: string) {
    try {
        const { data, error } = await supabase.storage
            .from("user-saved-songs")
            .remove([filePath]);

        if (error) {
            return { data: null, error };
        }


        return { data, error: null };

    } catch (error) {
        return { data: null, error };
    }
}

function getSongPublicURL(filePath: string): string {
    const { data } = supabase.storage
        .from("user-saved-songs")
        .getPublicUrl(filePath);

    return data.publicUrl;
}

async function fileExists(filePath: string) {
    const { data } = await supabase.storage.from('user-saved-songs').exists(filePath);
    return data;
}

export {supabaseInitialize, uploadSong, deleteSong, getSongPublicURL, fileExists} 