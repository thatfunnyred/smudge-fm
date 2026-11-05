import { onAuthStateChanged, setPersistence, signInWithEmailAndPassword, getAuth, GoogleAuthProvider, signInWithPopup, browserLocalPersistence } from "firebase/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";

import { initializeApp } from "firebase/app";

import { publish } from "./events";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const provider = new GoogleAuthProvider();

let auth: any;
let user: any = null;

function firebaseInitialize() {
    const app = initializeApp(firebaseConfig);

    auth = getAuth(app);
    
    setPersistence(auth, browserLocalPersistence);
    onAuthStateChanged(auth, (u) => {
        user = u;

        if(u != null) publish("onsignin", null);
        if(u == null) publish("onsignout", null);
    });
}

async function signUpWithPassword(email: string, password: string) {
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        
        console.log("Login successful");

        return true;

    } catch (error: any) {
        console.log("Login failed");
        console.log(error.code);
        console.log(error.message);

        return false;
    }
}

async function signInWithPassword(email: string, password: string) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        
        console.log("Login successful");

        return true;

    } catch (error: any) {
        console.log("Login failed");
        console.log(error.code);
        console.log(error.message);

        return false;
    }
}

async function signInWithGoogle() {
    try {
        await signInWithPopup(auth, provider);
        
        console.log("Login successful");

        return true;

    } catch (error: any) {
        
        console.log("Login failed");
        console.log(error.code);
        console.log(error.message);
        return false;
    }
}

async function isSignedIn() {
    return user != null;
}

export {firebaseInitialize, signUpWithPassword, signInWithPassword, signInWithGoogle, isSignedIn}