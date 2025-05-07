import fs from "fs";
import path from "path";
import https from "https";
import cron from "node-cron";
import { getAuthToken } from "./auth.mjs"; // Importa la funzione di login
import { leggi } from "./fRest.mjs"; // Importa la funzione di lettura del DB
import { SERVERAPI, SITO } from "./env.mjs"; // Importa le variabili di ambiente

const ApiFlashEndpoint = "https://api.apiflash.com/v1/urltoimage";
const apiKey = "efa8ca8fc63c4ea1ae09f1c203ea93f8";
const imageDirectory = "C:/siti/" + SITO + "/personal/06087680960/img/";

// Funzione per scaricare un file utilizzando il modulo https
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    https
      .get(url, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on("finish", () => {
            file.close(resolve);
          });
        } else {
          reject(new Error(`Errore nel download: ${response.statusCode}`));
        }
      })
      .on("error", (err) => {
        fs.unlink(destination, () => reject(err));
      });
  });
}

async function getProjects() {
  const Token = await getAuthToken(); // Ottieni il token di autenticazione
  const DB = "ProgettiSERP";
  const Where = "WHERE AZIENDA='06087680960' AND ProgettiSerp_Stato=0";

  const json = await leggi(SERVERAPI, Token, DB, Where); // Leggi i progetti dal DB

  console.log("DEBUG json", json.Itemset.ProgettiSERP);

  return json.Itemset.ProgettiSERP;
}

// Funzione principale
async function updateImgSite() {
  try {
    const projects = await getProjects();

    for (const project of projects) {
      const imagePath = path.join(imageDirectory, `${project.IDOBJ}.jpeg`);

      console.log(`DEBUG project`, project);

      if (!fs.existsSync(imagePath)) {
        const url = `https://www.${project.ProgettiSerp_DNS}`;
        const apiUrl = `${ApiFlashEndpoint}?access_key=${apiKey}&url=${encodeURIComponent(url)}`;

        console.log(`Scaricando immagine per ${url}...`);

        await downloadFile(apiUrl, imagePath);

        console.log(`Immagine salvata in: ${imagePath}`);
      } else {
        console.log(`Immagine già esistente: ${imagePath}`);
      }
    }
  } catch (error) {
    console.error("Errore in updateImgSite:", error);
  }
}

// Pianifica ogni giorno alle 03:00
cron.schedule("0 3 * * *", () => {
  // Esegui la funzione
  const now = new Date().toLocaleString();
  console.log("AVVIO UPDIMG", `[${now}] \n`);
  updateImgSite();
});
