import fetch from "node-fetch";
import { SERVERAPI, AZIENDA, USER, PASSWORD } from "./env.mjs";

export async function getAuthToken() {
  const urlLogin = SERVERAPI + "/api/axo_login";

  const myHeaderslog = new Headers();
  myHeaderslog.append("Content-Type", "application/json");

  const rawlog = JSON.stringify({
    AZIENDA: AZIENDA,
    USER: USER,
    PASSWORD: PASSWORD,
  });

  const requestOptionslog = {
    method: "POST",
    headers: myHeaderslog,
    body: rawlog,
    redirect: "follow",
  };

  const responselog = await fetch(urlLogin, requestOptionslog);
  if (!responselog.ok) {
    throw new Error(`Response status: ${responselog.status}`);
  }

  const jsonlog = await responselog.json();

  console.log("DEBUG jsonlog", jsonlog);

  return jsonlog?.Token;
}
