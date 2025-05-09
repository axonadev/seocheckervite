import React, { useState, useEffect } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Loader from "../components/Loader";
import { LoginByToken } from "../utility/CallLogin";
import { login as loginAction, logout as logoutAction } from "../store/storeLogin";

const ProtectedRoutes = () => {
  const { logged, guest, token } = useSelector((state) => state.auth.value);
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Import and use navigate for redirection

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const sessionToken = localStorage.getItem("axo_token");
      if (!sessionToken) {
        dispatch(logoutAction());
        setLoading(false);
        // navigate("/login"); // Redirect if no token found
        return;
      }
      try {
        // Assuming LoginByToken returns the user object similar to the login API response
        const userData = await LoginByToken(sessionToken);
        dispatch(loginAction(userData)); // Dispatch login with the full user data
      } catch (error) {
        console.error("Token validation failed:", error);
        localStorage.removeItem("axo_token");
        dispatch(logoutAction());
        // navigate("/login"); // Redirect on error
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [dispatch]); // Removed navigate from dependencies to prevent potential loops if navigate itself causes re-renders

  if (loading) {
    return <Loader />;
  }

  // Use logged status from Redux store, which is updated by verifyAuth
  if (token && logged && !guest) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoutes;
