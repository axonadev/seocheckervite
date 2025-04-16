import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import Layout from "../layout/Layout";

const Homepage = () => {
  const Token = localStorage.getItem("axo_token");

  const naviga = useNavigate();
  return (
    <>
      <Layout>
        <div></div>
      </Layout>
    </>
  );
};
export default Homepage;
