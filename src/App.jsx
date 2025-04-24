import "./App.css";

import ProtectedRoutes from "./routes/ProtectedRoutes.jsx";
import InvisibleRoutesIfAuth from "./routes/InvisibleRoutesIfAuth.jsx";

//React router
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

//Pages
import LoginPage from "./pages/auth/Login.jsx";
import Homepage from "./pages/Homepage.jsx";
import Dashboard from "./pages/protected/Dashboard.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx"; // Import the new page
import AllNotesPage from "./pages/AllNotesPage.jsx"; // Import the new page

import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/theme';
import Archive from "./pages/protected/Archive.jsx";

function App() {

  localStorage.setItem("axo_token", "QRAjF0GHIbrQKZ1VH1pJBxfz2T4cd8FSKvbCtks1HdfLJttHDI_s_NzRfCsorSwawjBM2XxrTbPuzHWNVP6T7QkNaMCX_p_UUby6ZfcJkhwuvYFoMkRc7ma3Nn5zKY49jeO3");
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <ScrollToTop />
        <header>
          {/* Add your header content here */}
        </header>
        <Routes>
          <Route path={"/"} element={<Homepage />}></Route>
          <Route path={"/projects"} element={<Homepage />}></Route>
          <Route path={"/archive"} element={<Archive />}></Route>
          <Route path={"/projects/:id"} element={<ProjectDetail />}></Route>
          <Route path={"/all-notes"} element={<AllNotesPage token={localStorage.getItem("axo_token")} />} />
          <Route element={<InvisibleRoutesIfAuth />}>
            <Route path={"/login"} element={<LoginPage />}></Route>
          </Route>
          <Route element={<ProtectedRoutes />}>
            <Route element={<Dashboard />} path={"/dashboard"} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
