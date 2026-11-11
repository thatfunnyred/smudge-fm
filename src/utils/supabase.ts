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
            console.error("Error uploading file:", error);
            return { data: null, error };
        }

        return { data, error: null };

    } catch (error) {
        console.error("Upload failed:", error);
        return { data: null, error };
    }
}

async function deleteSong(filePath: string) {
    try {
        const { data, error } = await supabase.storage
            .from("user-saved-songs")
            .remove([filePath]);

        if (error) {
            console.error("Supabase deletion error:", error.message);
            return { data: null, error };
        }

        console.log("Supabase deletion response:", data);

        return { data, error: null };

    } catch (error) {
        console.error("Delete failed:", error);
        return { data: null, error };
    }
}

function getSongPublicURL(filePath: string): string {
    const { data } = supabase.storage
        .from("user-saved-songs")
        .getPublicUrl(filePath);

    return data.publicUrl;
}

export {supabaseInitialize, uploadSong, deleteSong, getSongPublicURL} 