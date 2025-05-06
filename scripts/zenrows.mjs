import fs from "fs";
import path from "path";
import fetch from "node-fetch";

class ZenRowsConnection {
  constructor(apiKey, axoSys) {
    this.apiKey = apiKey;
    this.urlDestinazione = "https://www.google.com/search";
    this.queryRicerca = "";
    this.startRicerca = 0;
    this.idStato = 3;
    this.axoSettings = axoSys; // Oggetto placeholder, puoi gestirlo secondo necessità
  }

  // Metodo per normalizzare un URL
  normalizzaUrl(url) {
    return encodeURIComponent(url);
  }

  // Mappa delle regioni per il proxy
  getProxyCountry(googleRegione) {
    const countryMap = {
      Italia: "it",
      Spagna: "es",
      Germania: "de",
      Francia: "fr",
      Portogallo: "pt",
    };
    return countryMap[googleRegione] || "";
  }

  // Metodo per costruire l'URL per la richiesta a ZenRows
  costruisciUrl(queryR, startR, googleRegione) {
    const proxyCountry = this.getProxyCountry(googleRegione);
    const jsRender =
      "&js_render=true&json_response=true&js_instructions=%255B%257B%2522wait%2522%253A500%257D%252C%257B%2522wait_for%2522%253A%2522.slow_selector%2522%257D%255D";
    const parse = "&autoparse=true";

    const urlRicerca = `${this.urlDestinazione}?q=${queryR}&start=${startR}`;
    return `https://api.zenrows.com/v1/?apikey=${this.apiKey}&url=${this.normalizzaUrl(
      urlRicerca
    )}${jsRender}&premium_proxy=true&proxy_country=${proxyCountry}${parse}`;
  }

  // Metodo per creare directory se non esistono
  creaDirectory(baseDir) {
    try {
      fs.mkdirSync(baseDir, { recursive: true });
    } catch (err) {
      console.error("Errore nella creazione della directory:", err.message);
    }
  }

  // Metodo per salvare i risultati in un file
  salvaRisultati(pathFile, idobj_pj, testoElaborato) {
    const finalPath = path.join(pathFile, `${idobj_pj}.txt`);
    try {
      fs.writeFileSync(
        finalPath,
        `[ZenRows] [PARM] [JSON]${testoElaborato}[JSON]\n`,
        { flag: "a" }
      );
      fs.writeFileSync(
        finalPath,
        `[ZenRows] [PARM] ------------------------------------------------------------------------------------------\n`,
        { flag: "a" }
      );
      console.log(`Risultati salvati in: ${finalPath}`);
    } catch (err) {
      console.error(
        "Errore durante il salvataggio dei risultati:",
        err.message
      );
    }
  }

  // Metodo per effettuare una richiesta a ZenRows
  async effettuaRichiesta(fullUrl, tentativo) {
    try {
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`Errore nella richiesta a ZenRows: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(
        `[Tentativo ${tentativo}] Errore nella chiamata a ZenRows: ${err.message}`
      );
      await new Promise((res) => setTimeout(res, 500)); // Ritenta dopo un breve delay
      return null;
    }
  }

  // Metodo principale per leggere i dati
  async leggi(
    queryR = "",
    startR = 0,
    idobj_pj = 0,
    googleRegione = "Italia",
    pathFile = ""
  ) {
    // Imposta i valori predefiniti
    queryR = queryR || this.queryRicerca;
    startR = startR || this.startRicerca;
    queryR = queryR.replace(/ /g, "+");

    // Costruisci l'URL di ricerca
    const fullUrl = this.costruisciUrl(queryR, startR, googleRegione);

    // Crea la directory per i file
    const baseDir = path.join(pathFile, this.idStato.toString());
    this.creaDirectory(baseDir);

    // Placeholder per il testo elaborato
    let testoElaborato = `{"approximate_results":"0","local_results":[],"organic_results":[`;
    const commJSONC = `{"date":"","description":"","displayed_link":"","domain":"#DOMINIO","link":"#LINK","ratings":null,"summary_points":"","title":""},`;
    const commJSONF = `],"paid_products":[],"paid_results":[],"people_also_ask":[],"related_searches":[],"title":""}`;

    // Effettua fino a 5 tentativi per ottenere i dati
    for (let i = 0; i < 5; i++) {
      const data = await this.effettuaRichiesta(fullUrl, i + 1);
      if (data) {
        // Processa i risultati
        const organicResults = data.organic_results || [];
        for (const result of organicResults) {
          const link = result.link || "";
          const dominio = link
            .replace("http://", "")
            .replace("https://", "")
            .split("/")[0];
          let entry = commJSONC
            .replace("#LINK", link)
            .replace("#DOMINIO", dominio);
          testoElaborato += entry;
        }

        testoElaborato += commJSONF;

        // Salva i risultati
        this.salvaRisultati(pathFile, idobj_pj, testoElaborato);
        return data;
      }
    }

    console.error("Errore: impossibile ottenere i dati dopo 5 tentativi.");
    return null;
  }

  // Metodo per controllare una parola chiave
  async ControllaParola(
    parola,
    start,
    dns,
    idKeyw,
    idProgetto,
    regione,
    pathFile
  ) {
    try {
      console.log(
        `Eseguo richiesta a ZenRows per la parola: ${parola}, pagina: ${start}`
      );
      const data = await this.leggi(
        parola,
        start,
        idProgetto,
        regione,
        pathFile
      );
      console.log(`Risultati salvati per la parola: ${parola}`);
      return data;
    } catch (error) {
      console.error(
        `Errore durante ControllaParola per ${parola}:`,
        error.message
      );
    }
  }
}

export default ZenRowsConnection;
