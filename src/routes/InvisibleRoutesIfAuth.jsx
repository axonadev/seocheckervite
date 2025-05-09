import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const InvisibleRoutesIfAuth = () => {
  const user = useSelector((state) => state.auth.value.token);

  return user ? <Navigate to="/projects" /> : <Outlet />;
};

export default InvisibleRoutesIfAuth;
