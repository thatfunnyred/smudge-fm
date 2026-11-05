import { lazy, Suspense, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { subscribe } from "../utils/events";

const HomePage = lazy(() => import("../pages/HomePage.tsx"));
const SignInPopUp = lazy(() => import("../components/SignIn.tsx"));

export default function AppRouter() {

  const [signedIn, setSignedIn] = useState(false);

  subscribe("onsignin", () => setSignedIn(true));
  subscribe("onsignout", () => setSignedIn(false));

  return (
    <>
      <Suspense
        fallback={
          <div className="route-loading" role="status">
            Loading page…
          </div>
        }
        >

        {/* check if signed in */}
        {!signedIn ? <SignInPopUp /> : ""}
        
        <Routes>

          <Route path="/" element={<HomePage />} />

          <Route path="*" element={<div>Not found</div>} />
        </Routes>
      </Suspense>
    </>
  );
}
