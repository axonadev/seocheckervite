import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../store/storeLogin";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import useEnv from "../../hooks/useEnv";

const DEFAULT_EMAIL = "marco@ampartners.info";
const DEFAULT_PASSWORD = "06087680960";
const IMAGE_URL =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80";

function LoginForm() {
  const { SERVERAPI } = useEnv();
  const [user, setUser] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`${SERVERAPI}/api/axo_login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ azienda: "06087680960", user, password }),
      });
      const data = await response.json();
      if (response.ok && data.Token) {
        localStorage.setItem("axo_token", data.Token);
        sessionStorage.setItem("axo_token", data.Token);
        localStorage.setItem("axo_nomeLocale", data?.Itemset?.LoginSoggetto[0]?.Soggetti_Nome1 + " " + data?.Itemset?.LoginSoggetto[0]?.Soggetti_Nome2);

        dispatch(login(data));
        navigate("/projects"); // Changed from "/dashboard" to "/projects"
      } else {
        setError(data?.Errore || "Credenziali non valide");
      }
    } catch (err) {
      setError("Errore di connessione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: 350,
          p: 0,
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: 140,
            background: `url(${IMAGE_URL}) center/cover no-repeat`,
          }}
        />
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            label="Email"
            type="email"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            required
            autoFocus
            autoComplete="username"
          />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleShowPassword}
                    edge="end"
                    tabIndex={-1}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {error && (
            <Typography
              color="error"
              fontSize={14}
              sx={{ mt: 1 }}
            >{error}</Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            sx={{
              mt: 2,
              borderRadius: 10,
              fontWeight: 600,
              fontSize: 16,
              py: 1,
            }}
            disabled={loading}
            fullWidth
          >
            {loading ? "Attendi..." : "Accedi"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default LoginForm;
