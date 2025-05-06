import { aggiornaPosizioneProgetto } from "./aggiornaposizioneProgetto.mjs";

// Leggi i parametri dalla riga di comando
const IDOBJ = process.argv[3]; // Primo parametro: IDOBJ
const idStato = process.argv[4]; // Secondo parametro: idStato
const pathFile = process.argv[5] || "C:/Axona/fileimport/" + idStato; // Terzo parametro: pathFile (opzionale)

if (!IDOBJ || !idStato) {
  console.error("Errore: Devi specificare IDOBJ e idStato come parametri.");
  process.exit(1);
}

// Richiama la funzione principale
aggiornaPosizioneProgetto(IDOBJ, idStato, pathFile);
