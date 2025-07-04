import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { scrivi } from "./fRest.mjs";
import { SERVERAPI, AZIENDA } from "./env.mjs"; // Importa le variabili di ambiente
import { getAuthToken } from "./auth.mjs"; // Importa la funzione di login

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
    //    country=it&tld=.it"
    const countryMap = {
      Italia: "&country=it&tld=.it",
      Spagna: "&country=es&tld=.es",
      Germania: "&country=de&tld=.de",
      Francia: "&country=fr&tld=.fr",
      Portogallo: "&country=pt&tld=.pt",
    };
    return countryMap[googleRegione] || "";
  }

  // Metodo per costruire l'URL per la richiesta a ZenRows
  costruisciUrl(queryR, startR, googleRegione) {
    const proxyCountry = this.getProxyCountry(googleRegione);

    const urlRicerca = `${this.urlDestinazione}?q=${queryR}&start=${startR}`;

    const apiZenrows = `https://serp.api.zenrows.com/v1/targets/google/search/?apikey=${this.apiKey}&url=${this.normalizzaUrl(
      urlRicerca
    )}${proxyCountry}`;

    return apiZenrows;
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
    dns = "",
    id_kw = 0,
    googleRegione = "Italia"
  ) {
    // Imposta i valori predefiniti
    queryR = queryR || this.queryRicerca;
    startR = startR || this.startRicerca;
    queryR = queryR.replace(/ /g, "+");

    // Ottieni il token di autenticazione
    const Token = await getAuthToken(SERVERAPI, AZIENDA);

    // Costruisci l'URL di ricerca
    const fullUrl = this.costruisciUrl(queryR, startR, googleRegione);

    // Effettua fino a 5 tentativi per ottenere i dati
    for (let i = 0; i < 5; i++) {
      const data = await this.effettuaRichiesta(fullUrl, i + 1);
      if (data) {
        // Processa i risultati
        const organicResults = data.organic_results || [];
        console.log(
          `Trovati ${organicResults.length} risultati per la query: ${queryR}`
        );

        console.log(data);
        let y = 0;
        for (const result of organicResults) {
          y = y + 1;

          const link = String(result.link).replaceAll("/", "-S-") || "";
          const dominio = String(result.link)
            .replace("http://", "")
            .replace("https://", "")
            .split("/")[0]
            .replace("www.", "");

          if (dominio.includes(dns)) {
            const posizione = parseFloat(startR) + parseFloat(y);

            const jsonObj = {
              IDOBJ: 0,
              PIDOBJ: id_kw,
              AZIENDA: AZIENDA,
              ProgettiSerpReport_DataEstrazione: new Date().toISOString(),
              ProgettiSerpReport_Posizione: posizione,
              ProgettiSerpReport_URL: link,
            };

            const response = await scrivi(
              SERVERAPI,
              Token,
              0,
              "ProgettiSerpReport",
              "ProgettiSerpReportsel",
              jsonObj
            );

            console.log(response[0].Risposta);

            if (response.error) {
              console.error(
                `Errore durante la scrittura dei dati per ${link}: ${response.error}`
              );
            } else {
              console.log(
                `Salvato ${link} in ProgettiSerpReport con ID: ${response[0].Risposta}`
              );
            }
          }
        }

        return data;
      }
    }

    console.error("Errore: impossibile ottenere i dati dopo 5 tentativi.");
    return null;
  }

  // Metodo per controllare una parola chiave
  async ControllaParola(parola, start, dns, idkw, regione) {
    if (
      parola === undefined ||
      parola === "" ||
      parola === null ||
      parola.trim() === "null"
    ) {
      console.error("La parola chiave non può essere vuota.");
      return;
    }

    try {
      console.log(
        `Eseguo richiesta a ZenRows per la parola: ${parola}, pagina: ${start}`
      );
      const data = await this.leggi(parola, start, dns, idkw, regione);
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
