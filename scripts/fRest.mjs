import fetch from "node-fetch";

export async function leggi(SERVERAPI, Token, DB, Where) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    Token: Token,
    DB: DB,
    Funzione: "Leggi",
    Classe: Where,
  });

  const option = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  console.log("DEBUG option", option);
  const response = await fetch(SERVERAPI + "/api/axo_general", option);
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  const json = await response.json();

  return json;
}

export const fai = async (
  SERVERAPI,
  Token,
  Classe,
  Funzione,
  jsonParametri,
  idobj = 0,
  DB = ""
) => {
  const formData = {
    Token: Token,
    Idobj: idobj,
    Modulo: "modulofai",
    Classe: Classe,
    DB: DB,
    Funzione: Funzione,
    Parametri: "[" + JSON.stringify(jsonParametri) + "]",
  };

  try {
    const response = await fetch(SERVERAPI + "/api/axo_sel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const data = await response.json();
      return { data: data, error: "" };
    } else {
      const errorData = await response.json();
      console.error(errorData.message);
      return { data: "", error: errorData.message };
    }
  } catch (error) {
    console.error("Dati errati o utente non registrato", error);
  }
};
