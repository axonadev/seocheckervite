import useEnv from "../hooks/useEnv";

const CallLogin = async (azienda = "", user = "", password = "") => {
  const { SERVERAPI } = useEnv;
  const urlLogin = SERVERAPI + "/api/axo_login";

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    AZIENDA: azienda,
    USER: user,
    PASSWORD: password,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  const response = await fetch(urlLogin, requestOptions);
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  const json = await response.json();

  sessionStorage.setItem("axo_token", json?.Token);
  localStorage.setItem("axo_token", json?.Token);

  const authL =
    json?.Itemset?.LoginSoggetto[0]?.SoggettiCredenziali_LivelloAutorizzazione;

  const valLogin = {
    logged: true,
    token: json?.Token,
    guest: user == "GUEST" ? true : false,
    authLevel: authL,
    nomesoggetto: json?.Itemset?.LoginSoggetto[0]?.Soggetti_Nome1,
    cognomesoggetto: json?.Itemset?.LoginSoggetto[0]?.Soggetti_Nome2,
  };

  return valLogin;
};
export default CallLogin;

export const LoginByToken = async (token = "") => {
  const { SERVERAPI } = useEnv();
  const urlLogin = SERVERAPI + "/api/axo_login/" + token;

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  const response = await fetch(urlLogin, requestOptions);
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }

  const json = await response.json();

  const authL = json?.Item[0]?.SoggettiCredenziali_LivelloAutorizzazione;
  const valLogin = {
    logged: true,
    token: token,
    guest: json?.Item[0]?.utente == "GUEST" ? true : false,
    authLevel: authL ? authL : 0,
    nomesoggetto: json?.Item[0]?.Soggetti_Nome1,
    cognomesoggetto: json?.Item[0]?.Soggetti_Nome2,
  };

  return valLogin;
};
