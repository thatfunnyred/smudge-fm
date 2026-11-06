import { useState } from "react";
import "../styles/signin-style.css";
import { signUpWithPassword, signInWithPassword, signInWithGoogle } from "../utils/firebase";

export default function SignInPopUp() {

    const [currentWindow, setCurrentWindow] = useState("signup");

    const changeCurrentWindow = (window: string) => {
        if(window == currentWindow) return;
        
        setCurrentWindow(window);

        const signUpBtn = document.getElementById("signup-btn");
        const signInBtn = document.getElementById("signin-btn");

        signUpBtn?.classList.toggle("signin-btn-active");
        signInBtn?.classList.toggle("signin-btn-active");
    }

    const handleSubmit = async () => {
        const email: string = (document.getElementById("email-input") as HTMLInputElement).value;
        const password: string = (document.getElementById("password-input") as HTMLInputElement).value;

        if(currentWindow == "signup") await signUpWithPassword(email, password);
        if(currentWindow == "signin") await signInWithPassword(email, password);
    };

    const handleGoogleSignIn = () => {
        signInWithGoogle();
    }

    return (
        <div id="background-blur">
            <div id="signin-container">
                <h1 id="signin-title">{currentWindow == "signup" ? "JOIN THE FM!" : "HELLO, THERE!"}</h1>
                <p id="signin-subtitle">{currentWindow == "signup" ? "save your tunes, make a mess of playlists" : "your playlists missed you"}</p>

                <div id="signin-page-btn-container">
                    <button id="signup-btn" className="signin-btn signin-btn-active" onClick={() => changeCurrentWindow("signup")}>SIGN UP</button>
                    <button id="signin-btn" className="signin-btn" onClick={() => changeCurrentWindow("signin")}>SIGN IN</button>
                </div>

                <div id="email-field" className="signin-input-fields">
                    <label id="email-label" htmlFor="email-input">email</label>
                    <input type="email" id="email-input" placeholder="example@gmail.com"></input>
                </div>
                <div id="password-field" className="signin-input-fields">
                    <label id="password-label" htmlFor="password-input">password</label>
                    <input type="password" id="password-input" placeholder="strong password"></input>
                </div>
                <button id="submit-btn" onClick={handleSubmit}>{currentWindow == "signup" ? "MAKE MY ACCOUNT" : "LET ME IN"}</button>
                <div id="signin-separator">----------------------- or -----------------------</div>
                <button id="google-btn" onClick={handleGoogleSignIn}>Google</button>
            </div>
        </div>
    );
}