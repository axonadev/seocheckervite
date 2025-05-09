import "./App.css";
import { useState } from "react";
import ProtectedRoutes from "./routes/ProtectedRoutes.jsx";
import InvisibleRoutesIfAuth from "./routes/InvisibleRoutesIfAuth.jsx";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import LoginPage from "./pages/auth/Login.jsx";
import Homepage from "./pages/Homepage.jsx";
import Dashboard from "./pages/protected/Dashboard.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";
import AllNotesPage from "./pages/AllNotesPage.jsx";
import ClientProductsArchive from "./pages/protected/ClientProductsArchive";
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/theme';
import Archive from "./pages/protected/Archive.jsx";
import Loader from "./components/Loader.jsx";

// Wrapper component to handle route transitions
const RouteTransition = () => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  return (
    <>
      <Routes>
        <Route element={<InvisibleRoutesIfAuth />}>
          <Route path={"/login"} element={<LoginPage />} />
        </Route>
        <Route element={<ProtectedRoutes />}>
          <Route path={"/"} element={<Homepage onLoadStart={() => setIsLoading(true)} onLoadComplete={() => setIsLoading(false)} />} />
          <Route path={"/projects"} element={<Homepage onLoadStart={() => setIsLoading(true)} onLoadComplete={() => setIsLoading(false)} />} />
          <Route path={"/archive"} element={<Archive />} />
          <Route path={"/projects/:id"} element={<ProjectDetail />} />
          <Route path={"/all-notes"} element={<AllNotesPage token={localStorage.getItem("axo_token")} />} />
          <Route path={"/client-products-archive"} element={<ClientProductsArchive />} />
          <Route element={<Dashboard />} path={"/dashboard"} />
        </Route>
      </Routes>
      {isLoading && (location.pathname === "/" || location.pathname === "/projects") ? <Loader /> : null}
    </>
  );
};

function App() {
  
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <ScrollToTop />
        <RouteTransition />
      </Router>
    </ThemeProvider>
  );
}

export default App;
