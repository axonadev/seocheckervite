import useEnv from "../hooks/useEnv";

const PostRegistration = () => {
  const { SERVERAPI } = useEnv();

  const registraDispositivo = (
    endpoint,
    P256DH,
    Auth,
    Token,
    idSoggetto,
    Azienda
  ) => {
    console.log(
      "registraDispositivo",
      endpoint,
      P256DH,
      Auth,
      Token,
      idSoggetto,
      Azienda
    );

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      subscription: {
        endpoint: endpoint,
        keys: {
          P256DH: P256DH,
          Auth: Auth,
        },
      },
      value: {
        Token: Token,
        DB: "",
        Classe: "axo_funzioni",
        Funzione: "RegistraDispositivo",
        Parametri: "idSoggetto:'" + idSoggetto + "',Azienda:'" + Azienda + "'",
      },
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(SERVERAPI + "/api/axo_subscription", requestOptions)
      .then((response) => response.text())
      .then((result) => {})
      .catch((error) => console.error(error));
  };

  return { registraDispositivo };
};
export default PostRegistration;
