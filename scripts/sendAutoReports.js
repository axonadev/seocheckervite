// Script per invio automatico report PDF via Resend
// Da pianificare ogni 25 del mese
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// INSERISCI QUI LA TUA API KEY RESEND
const resend = new Resend('re_8TTB2zGr_FhEp4Sgn4iLq6p6C8PLb3m5H');

// TODO: Sostituisci questa funzione con la tua logica reale (API, DB, ecc)
async function getProjectsWithAutoSend() {
  // Esempio statico, sostituisci con fetch da API o DB
  return [
    {
      IDOBJ: 123,
      azienda: '06087680960',
      email: 'cioppi222@gmail.com',
      ProgettiSerp_Nome: 'Nome Progetto'
    }
    // ...altri progetti
  ];
}

async function sendReportEmail({ to, subject, text }) {
  const response = await resend.emails.send({
    from: 'test@axonamail.net',
    to,
    subject,
    text
    // attachments: [] // Nessun allegato per test
  });
  return response;
}

async function sendAllAutoReports() {
  const projects = await getProjectsWithAutoSend();
  for (const project of projects) {
   const response =  await sendReportEmail({
      to: project.email,
      subject: `Report SEO ${project.ProgettiSerp_Nome}`,
      text: 'Test invio automatico: questa è una mail senza allegato PDF.',
    });
    console.log(`Inviata mail di test a ${project.email}`);
    console.log('Response:', response); // Log della risposta per debug
  }
}

// Esegui lo script
sendAllAutoReports();
