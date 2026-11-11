import { lazy, Suspense, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { subscribe } from "../utils/events";
import { LoaderHost } from "../components/MusicLoader.tsx";

const HomePage = lazy(() => import("../pages/HomePage.tsx"));
const SignInPopUp = lazy(() => import("../components/SignIn.tsx"));

export default function AppRouter() {

  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const signInUnsubscribe = subscribe("onsignin", () => setSignedIn(true));
    const signOutUnsubscribe = subscribe("onsignout", () => setSignedIn(false));

    return () => {
      signInUnsubscribe();
      signOutUnsubscribe();
    }
  }, [])
  

  return (
    <>
      <LoaderHost />

      <Suspense
        fallback={
          <div className="route-loading" role="status">
            Loading page…
          </div>
        }
        >

        {/* check if signed in */}
        {!signedIn && <SignInPopUp />}
        
        <Routes>

          <Route path="/" element={<HomePage />} />

          <Route path="*" element={<div>Not found</div>} />
        </Routes>
      </Suspense>
    </>
  );
}
