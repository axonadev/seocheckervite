const useEnv = () => {
  const SERVERAPI = "https://apis.axonasrl.com";
  const AZIENDA = "02546790185";
  const SERVERWEB = "https://evet.axonasrl.com";
  const SERVERPATH = "evet.axonasrl.com";
  const nameUrl = window.location.href;

  const TokenGuest =
    "bb5NaErBEi7pNe6hu4R_s_FxbtGJKIFeCwEfolwJbFLo3zA_p_D26ssezez1wfTCf64a1_s_zdLsZ4Y_p_yO_p_auQVjUPiBslCZLiBN3l5up_p_IWWLg6XIGWIHh6WOdbjwKfO378yY";

  const MessaggioPromoApp =
    "Scarica l'app per rimanere sempre connesso con Puravidafarm per acquistare biglietti, avere tutte le informazioni utili (orari di apertura e servizi) e ricevere comunicazioni, notifiche, variazioni di programma e sconti in tempo reale.";

  if (nameUrl.includes("localhost")) {
    return {
      SERVERAPI: "http://localhost:44387", // O l'endpoint corretto per localhost se diverso//SERVERAPI: "https://apit.axonasrl.com", // O l'endpoint corretto per localhost se diverso
      AZIENDA: "06087680960",
      SERVERWEB: "http://localhost:5173",
      SERVERPATH: "svil.axonasrl.com",
      MessaggioPromoApp,
      TokenGuest,
    };
  } else if (nameUrl.includes("seot.")) {
    return {
      SERVERAPI: "https://apit.axonasrl.com",
      AZIENDA: "06087680960",
      SERVERWEB: "https://seot.axonasrl.com",
      SERVERPATH: "seot.axonasrl.com",
      MessaggioPromoApp,
      TokenGuest,
    };
  } else {
    // Assicurati che questo sia l'endpoint di produzione corretto
    return {
      SERVERAPI: "https://api.axonasrl.com",
      AZIENDA: "06087680960",
      SERVERWEB: "https://seo.axonasrl.com",
      SERVERPATH: "seo.axonasrl.com",
      MessaggioPromoApp,
      TokenGuest,
    };
  }
};

export default useEnv;
