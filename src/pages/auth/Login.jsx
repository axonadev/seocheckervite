import React, { useState } from "react";

import { useNavigate } from "react-router-dom";
import { login } from "../../store/storeLogin";
import { useDispatch } from "react-redux";
import { Box, Button, TextField } from "@mui/material";

import useEnv from "../../hooks/useEnv";

function LoginForm() {
  const { SERVERAPI, AZIENDA } = useEnv();

  const [azienda, setAzienda] = useState(AZIENDA);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /**
   * Login call
   * @param event
   * @returns {Promise<Response>}
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); // Start Loading

    // Compile options
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        azienda,
        user,
        password,
      }),
    };

    // Call
    try {
      const response = await fetch(SERVERAPI + "/api/axo_login", options);
      const data = await response.json();

      if (response.ok) {
        if (data.Errore) {
          setError(data?.Errore || "Login failed");
          setLoading(false); // Stop Loading
        } else {
          localStorage.setItem("axo_token", data.Token); // Salva il token in locale
          dispatch(login(data)); // Invia i dati utente allo store
          navigate("/dashboard"); // Redirect alla dashboard
        }
      } else {
        setError(data?.Errore || "Login failed");
        setLoading(false); // Stop Loading
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      setLoading(false); // Stop Loading
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {" "}
      <TextField
        label="Piva azienda"
        placeholder="01234567890"
        required
        value={azienda}
        onChange={(e) => setAzienda(e.currentTarget.value)}
        margin="normal"
      />
      <TextField
        label="User/Mail"
        placeholder="user@mail.com"
        required
        value={user}
        onChange={(e) => setUser(e.currentTarget.value)}
        margin="normal"
      />
      <TextField
        label="Password"
        placeholder="password"
        required
        mt="md"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        margin="normal"
      />
      <Button
        variant="contained"
        onClick={handleSubmit}
        sx={{ fontSize: "0.7rem" }}
      >
        Login
      </Button>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          float: "left",
          marginTop: "12px",
        }}
      >
        <Button
          variant="contained"
          onClick={() => {
            setPagina("registra");
          }}
        >
          non sei ancora registrato?
        </Button>
        <Button
          variant="text"
          onClick={() => {
            setPagina("recupero");
          }}
          sx={{ fontSize: "0.7rem" }}
        >
          hai perso le credenziali?
        </Button>
      </Box>
    </Box>
  );
}
export default LoginForm;
