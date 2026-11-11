import { onAuthStateChanged, setPersistence, signInWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithPopup, browserLocalPersistence, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp, collection, deleteDoc, getDocs, getDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { publish } from "./events";
import { deleteSong, fileExists, getSongPublicURL, uploadSong } from "./supabase";
import { AudioExistsInLocalStorage, deleteAudioFromLocalStorage, saveAudioToLocalStorage } from "./utils";
import { loader } from "../components/MusicLoader";

// firebase setup
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// important params
let db: any;
let auth: any;
const provider = new GoogleAuthProvider();

// param @user
let user: any = null;

// param @initialized
let initialized: boolean = false;

// param @storage
let playlists: any = [];
let userData: any = [];
let savedSongs: object[] = [];
let likedSongs: any = [];

// func to initialize firebase
async function firebaseInitialize() {
    
    // return if already initialized
    if(initialized) return;

    initialized = true;

    //inner init func with promise for login wait
    await init();
}

// inner init func
function init() {
    return new Promise((resolve) => {
        
        //initialize firebase app
        const app = initializeApp(firebaseConfig);

        // assign variables
        auth = getAuth(app);
        db = getFirestore(app);

        // keep login persistent
        setPersistence(auth, browserLocalPersistence);

        loader.show();

        // add onsignin and onsignout as events
        onAuthStateChanged(auth, (u) => {
            user = u;

            if (u != null) {
                // publish sign in event
                publish("onsignin", null);
                
                resolve(true);
            } else {
                // publish sign out event
                publish("onsignout", null);

                console.log("No existing session");
                resolve(false);
            }

            loader.hide();

            playlists = JSON.parse(localStorage.getItem("playlists") ?? "[]");
            savedSongs = JSON.parse(localStorage.getItem("savedSongs") ?? "[]");
            likedSongs = JSON.parse(localStorage.getItem("likedSongs") ?? "[]");

            // console.log(playlists);
            // console.log(savedSongs)
            // console.log(likedSongs)

            // update all stored variables
            updateUserData();
            updateUserPlaylists("update", null);
            updateUserSongs("update", null);
            updateUserLikedSongs("update", null);
        });
    });
}

//signup with email and password
async function signUpWithPassword(email: string, password: string) {
    try {

        //try creating an account with the email
        await createUserWithEmailAndPassword(auth, email, password);

        // save default data
        saveDefaultUserData();
        
        console.log("Login successful");

        return true;

    } catch (error: any) {

        //log and return error
        console.log("Login failed");
        console.log(error.code);
        console.log(error.message);

        return error.code;
    }
}

async function signInWithPassword(email: string, password: string) {
    try {
        
        //try signing in with the email
        await signInWithEmailAndPassword(auth, email, password);

        console.log("Login successful");

        return true;

    } catch (error: any) {

        // log and return error code
        console.log("Login failed");
        console.log(error.code);
        console.log(error.message);

        return error.code;
    }
}

async function signInWithGoogle() {
    try {

        // try login using google Oauth provider
        await signInWithPopup(auth, provider);

        // save default data if doesn't exist
        let userData = await getUserData();
        if(userData == null) saveDefaultUserData;

        console.log("Login successful");

        return true;

    } catch (error: any) {

        // log and return error
        console.log("Login failed");
        console.log(error.code);
        console.log(error.message);
        
        return error.code;
    }
}

async function logout() {
    signOut(auth)
        .then(() => {
            return true;
        })
        .catch((error) => {
           return error;
        });
}

// func to check if the user is signed in
function isSignedIn() {
    return user != null;
}

// func to load default user data
async function saveDefaultUserData() {

    // reference to user uid doc
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
        createdAt: serverTimestamp()
    }, { merge: true });

    await updateUserData();
    
    // reference to playlist doc
    await updateUserPlaylists("add",{
        name: "my playlist",
        songIds: [],
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
    });
    
    // // reference to saved songs doc
    // const savedSongsRef = doc(collection(db, "users", user.uid, "savedSongs"));
    // await setDoc(savedSongsRef, {});
    
    // // reference to liked songs doc
    const likedSongsRef = doc(collection(db, "users", user.uid, "likedSongs"));
    await setDoc(likedSongsRef, {});
}

// func retrieve user data from local storage
function getUserData() {
    return userData;
}

// func to retrieve playlists from local storage
function getUserPlaylists() {
    return playlists;
}

// func to retrieve saved songs from local storage
function getUserSavedSongs() {
    return savedSongs;
}

// func to retrieve liked songs from local storage
function getUserLikedSongs() {
    return likedSongs;
}

// func to add new playlist
async function addPlaylist(playlistName: string) {
    // write playlist data
    const playlist = {name: playlistName};

    // save data to firestore
    await updateUserPlaylists("add", playlist);
}

// func to remove a playlist
async function removePlaylist(playlistKey: number) {
    // playlist to be removed
    const playlist = playlists[playlistKey];

    // save data to firestore
    await updateUserPlaylists("remove", playlist);
}

async function editPlaylistName(playlist: any) {
    await updateUserPlaylists("edit", playlist);
}

async function addSongToPlaylist(playlist: any, song: any) {
    const data: any = {id: playlist.id, song: song};
    await updateUserPlaylists("add-song", data);
}

async function removeSongFromPlaylist(playlist: any, song: any) {
    const data: any = {id: playlist.id, song: song};
    await updateUserPlaylists("remove-song", data);
}

async function addLikedSong(data: any) {
    await updateUserLikedSongs("add", data);
}

async function removeLikedSong(data: any) {
    await updateUserLikedSongs("remove", data);
}

//func to update firebase user data
async function updateUserData() {
    // return if not signed in
    if(!isSignedIn()) return;

    // reference to user uid doc
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
        email: user.email
    }, { merge: true });
}

//func to update firebase playlist data
async function updateUserPlaylists(process: string, playlist: any) {
    // return if not signed in
    if(!isSignedIn()) return null;

    switch (process) {
        case "add":
            // reference to playlist doc
            const playlistRef = doc(collection(db, "users", user.uid, "playlists"));

            const addedPlaylist = {
                name: playlist.name,
                duration: 0,
                songIds: [],
                updatedAt: serverTimestamp(),
                createdAt: serverTimestamp()
            };

            await setDoc(playlistRef, addedPlaylist);

            // update local playlists
            playlists = [
                ...playlists,
                {
                    id: playlistRef.id,
                    ...addedPlaylist
                }
            ];

            break;

        case "remove":
            // reference to playlist doc
            const uniquePlaylistRef = doc(db, "users", user.uid, "playlists", playlist.id);
            await deleteDoc(uniquePlaylistRef);

            playlist.songIds.forEach((songId: string) => {
                const song = savedSongs.find((song: any) => song.id == songId);
                updateUserSongs("remove", song);
            });

            // update local playlists
            playlists = playlists.filter(
                (pl: any) => pl.id !== playlist.id
            );
            break;
        case "edit":
            // reference to playlist doc
            const  uniqueEditPlaylistRef = doc(db, "users", user.uid, "playlists", playlist.id);
            await setDoc(uniqueEditPlaylistRef, {
                name: playlist.name
            }, { merge: true })

            playlists = playlists.filter(
                (pl: any) => {
                    if(pl.id == playlist.id)
                    {
                        pl.name = playlist.name;
                        return pl;
                    }else{
                        return pl;
                    }
                }
            )
            break;
        case "add-song":
            // reference to playlist doc
            const uniqueAddSongPlaylistRef = doc(db, "users", user.uid, "playlists", playlist.id);

            const songId = await updateUserSongs("add", playlist.song);
            
            
            // retrieve song Ids from playlist
            let AddingSongIds: any;
            for(let i = 0; i < playlists.length; i++) {
                if(playlists[i].id == playlist.id)
                {
                    playlists[i].songIds.push(songId);
                    AddingSongIds = playlists[i].songIds;
                }
            }

            // update song ids in firestore
            await setDoc(uniqueAddSongPlaylistRef, {
                songIds: AddingSongIds
            }, { merge: true });
            break;
        case "remove-song":
            // reference to playlist doc
            const uniqueRemoveSongPlaylistRef = doc(db, "users", user.uid, "playlists", playlist.id);
            
            // retrieve song Ids from playlist
            let removingSongIds: any;
            for(let i = 0; i < playlists.length; i++) {
                if(playlists[i].id == playlist.id)
                {
                    playlists[i].songIds = playlists[i].songIds.filter((s: string) => s != playlist.song.id);
                    removingSongIds = playlists[i].songIds;
                }
            }

            // update song ids in firestore
            await setDoc(uniqueRemoveSongPlaylistRef, {
                songIds: removingSongIds
            }, { merge: true });

            updateUserSongs("remove", playlist.song);
            break;
        case "update":
            // reference to playlist doc
            const playlistsRef = await collection(db, "users", user.uid, "playlists");
            const snapshot = await getDocs(playlistsRef);

            // update local playlists
            playlists = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            playlists.forEach((p: any) => {
                p.songIds.forEach(async (s: string) => {
                    if(!(await fileExists(`${user.uid}/${s}.mp3`))) {
                        removeSongFromPlaylist(p, {id: s});
                    }
                });               
            });
            break;
    }

    localStorage.setItem("playlists", JSON.stringify(playlists));
    publish("onplaylistupdate", [...playlists]);

    return true;
}

//func to update firebase playlist data
async function updateUserSongs(process: string, song: any) {
    // return if not signed in
    if(!isSignedIn()) return null;

    switch (process) {
        case "remove":
            if(!(await fileExists(song.storagePath))) {

                // delete song from supabase
                const deletionResult = await deleteSong(song.storagePath);

                if (!deletionResult || deletionResult.error) {
                    console.error("Song delete failed:", deletionResult?.error);
                    return null;
                }
            }

            // reference to unique song doc
            const uniqueSongRef = doc(db, "users", user.uid, "savedSongs", song.id);
            await deleteDoc(uniqueSongRef);

            // update local saved songs
            savedSongs = savedSongs.filter(
                (s: any) => s.id !== song.id
            );

            deleteAudioFromLocalStorage(song.id);
            break;
        case "update":
            // reference to songs doc
            const songsRef = await collection(db, "users", user.uid, "savedSongs");
            const snapshot = await getDocs(songsRef);

            // update local saved songs
            savedSongs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            savedSongs.forEach(async (s: any) => {
                if(!(await fileExists(s.storagePath))) {
                    updateUserSongs("remove", s);
                }else{
                    if(await AudioExistsInLocalStorage(s.id)) return;

                    const PUBLIC_SONG_URL: any = getSongPublicURL(s.storagePath);
                    saveAudioToLocalStorage(PUBLIC_SONG_URL, s.id);
                }                
            });
            break;
        case "add":
            const songRef = doc(collection(db, "users", user.uid, "savedSongs"));
            const songId = songRef.id;
            const songPath = `${user.uid}/${songId}.mp3`;

            // Upload song to supabase
            const result = await uploadSong(songPath, song.file);

            if (!result || result.error) {
                console.error("Song upload failed:", result?.error);
                return null;
            }
            
            // reference to songs doc
            const addedSong = {
                name: song.name,
                duration: song.duration,
                storagePath: songPath,
                createdAt: serverTimestamp()
            };
            
            await setDoc(songRef, addedSong);
            
            // update local saved songs
            savedSongs = [
                ...savedSongs,
                {
                    id: songRef.id,
                    ...addedSong
                }
            ];

            const PUBLIC_SONG_URL: any = getSongPublicURL(songPath);
            saveAudioToLocalStorage(PUBLIC_SONG_URL, songId);
            
            return songId;
    }
        
    localStorage.setItem("savedSongs", JSON.stringify(savedSongs));
    publish("onplaylistupdate", [...playlists]);

    return true;
}

//func to update firebase liked song data

async function updateUserLikedSongs(process: string, song?: any) {
    // Return if not signed in
    if (!isSignedIn()) return null;

    const likedSongRef = doc(db, "users", user.uid, "likedSongs", "songs");

    switch (process) {
        case "remove": {
            likedSongs = likedSongs.filter(
                (ls: any) => ls.id !== song
            );

            await setDoc(likedSongRef, {
                songs: likedSongs
            });
            break;
        }

        case "update": {
            const snapshot = await getDoc(likedSongRef);

            if (snapshot.exists()) {
                likedSongs = snapshot.data().songs ?? [];
            } else {
                likedSongs = [];
            }

            break;
        }

        case "add": {
            if (!likedSongs.some(
                (ls: any) => ls.id === song
            )) {
                likedSongs.push(song);
            }

            await setDoc(likedSongRef, {
                songs: likedSongs
            });
            break;
        }
    }

    localStorage.setItem("likedSongs", JSON.stringify(likedSongs));

    return true;
}


// export all funcs
export {
    firebaseInitialize, 
    signUpWithPassword, 
    signInWithPassword, 
    signInWithGoogle, 
    logout,
    isSignedIn, 
    getUserData, 
    getUserPlaylists, 
    getUserSavedSongs,
    getUserLikedSongs, 
    addPlaylist, 
    removePlaylist,
    addSongToPlaylist,
    editPlaylistName,
    removeSongFromPlaylist,
    addLikedSong,
    removeLikedSong,
    updateUserSongs,
    updateUserData
}