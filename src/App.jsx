/* import { useEffect } from "react"; */
import "./App.css";

import ProtectedRoutes from "./routes/ProtectedRoutes.jsx";
import InvisibleRoutesIfAuth from "./routes/InvisibleRoutesIfAuth.jsx";

//React router
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

//Pages
import LoginPage from "./pages/auth/Login.jsx";
import Homepage from "./pages/Homepage.jsx";
import Dashboard from "./pages/protected/Dashboard.jsx";
/* import useEnv from "./hooks/useEnv.js"; */
import ScrollToTop from "./components/ScrollToTop.jsx";

/* import PostRegistration from "./utility/PostRegistration"; */

/* const VAPID_PUBLIC_KEY_TEST =
  "BPc714ElxdcFcn1JI_hSg2uwbkNk1CYn0UwTmwfmOmHYR8vK2ppwxPK2-nqTxk_sxt8KgIdVyYlXytvGyq1DvUo";
const VAPID_PUBLIC_KEY_PROD =
  "BPc714ElxdcFcn1JI_hSg2uwbkNk1CYn0UwTmwfmOmHYR8vK2ppwxPK2-nqTxk_sxt8KgIdVyYlXytvGyq1DvUo";

const VAPID_PUBLIC_KEY =
  document.location.hostname.indexOf(".it") > -1
    ? VAPID_PUBLIC_KEY_PROD
    : VAPID_PUBLIC_KEY_TEST; */

/* const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}; */

function App() {
  /*   const Token = localStorage.getItem("axo_token");
  const { AZIENDA } = useEnv(); */

  /*  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker
        .register("/service-worker.js", {
          scope: "/",
          type: "classic",
        })
        .then(function (registration) {
          console.log("Service Worker registrato con successo:", registration);

          return registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
        })
        .then(function (subscription) {
          // Invia la sottoscrizione al backend

          localStorage.setItem(
            "axo_P256DH",
            JSON.parse(JSON.stringify(subscription))?.keys?.p256dh
          );
          localStorage.setItem(
            "axo_Auth",
            JSON.parse(JSON.stringify(subscription))?.keys?.auth
          );
          localStorage.setItem(
            "axo_endpoint",
            JSON.parse(JSON.stringify(subscription))?.endpoint
          );
        });
    }
  }, []); */

  /*   const { registraDispositivo } = PostRegistration(); */

  /*   useEffect(() => {
    registraDispositivo(
      localStorage.getItem("axo_endpoint"),
      localStorage.getItem("axo_P256DH"),
      localStorage.getItem("axo_Auth"),
      Token,
      26,
      AZIENDA
    );
  }, []); */

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path={"/"} element={<Homepage />}></Route>
        <Route element={<InvisibleRoutesIfAuth />}>
          <Route path={"/login"} element={<LoginPage />}></Route>
        </Route>
        <Route element={<ProtectedRoutes />}>
          <Route element={<Dashboard />} path={"/dashboard"} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
