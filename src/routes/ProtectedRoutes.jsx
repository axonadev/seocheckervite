import React, { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../components/Loader";
import { LoginByToken } from "../utility/CallLogin";

const ProtectedRoutes = () => {
  const user = useSelector((state) => state.auth.value.token);
  const isGuest = useSelector((state) => state.auth.value.guest);

  const sessionToken = localStorage.getItem("axo_token");

  const [loading, setLoading] = useState(true);

  const getLogin = async () => {
    if (!sessionToken) {
      setLoading(false);
    } else {
      const valToken = await LoginByToken(sessionToken);
      localStorage.setItem("axo_token", valToken.token);
      setLoading(false);
    }
  };

  useEffect(() => {
    getLogin();
  }, []);

  return loading ? <Loader /> : !isGuest ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoutes;
