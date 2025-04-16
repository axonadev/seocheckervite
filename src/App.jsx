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
import SearchBar from "./components/SearchBar";

import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <ScrollToTop />
        <header>
          {/* Add your header content here */}
        </header>
        <SearchBar />
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
    </ThemeProvider>
  );
}

export default App;
