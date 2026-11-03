import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const HomePage = lazy(() => import("../pages/HomePage.tsx"));

export default function AppRouter() {
//   const navigate = useNavigate();

  return (
    <>
      <Suspense
        fallback={
          <div className="route-loading" role="status">
            Loading page…
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="*" element={<div>Not found</div>} />
        </Routes>
      </Suspense>
    </>
  );
}
