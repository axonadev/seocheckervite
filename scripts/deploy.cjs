const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const fsp = fs.promises;

const args = require("minimist")(process.argv.slice(2));

const site = args.site;
const favicon = args.favicon;
const logo = args.logo;

if (!site || !favicon || !logo) {
  console.error("Errore: Devi specificare --site, --favicon e --logo.");
  process.exit(1);
}

async function clearFolder(folderPath) {
  try {
    if (fs.existsSync(folderPath)) {
      const files = await fsp.readdir(folderPath);
      for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stats = await fsp.stat(filePath);
        if (stats.isDirectory()) {
          await clearFolder(filePath);
          await fsp.rmdir(filePath);
        } else {
          await fsp.unlink(filePath);
        }
      }
    }
  } catch (err) {
    console.error(
      `Errore durante la pulizia della cartella ${folderPath}:`,
      err
    );
    throw err;
  }
}

(async () => {
  try {
    const publicPath = path.resolve("public");
    const distPath = path.resolve("dist");
    const networkPath = `\\\\192.168.50.51\\siti\\${site}.axonasrl.com`;
    const runCopyPath = `\\\\192.168.50.51\\siti\\runcopy`;

    // Pulisci la cartella di destinazione
    console.log(`Pulizia della cartella di destinazione: ${networkPath}`);
    await clearFolder(networkPath);

    // Copia file
    fs.copyFileSync(
      `${publicPath}\\${favicon}.svg`,
      `${publicPath}\\favicon.svg`
    );
    fs.copyFileSync(
      `${publicPath}\\icon\\${logo}.png`,
      `${publicPath}\\icon\\logo.png`
    );
    fs.copyFileSync(
      `${publicPath}\\icon\\${logo}.png`,
      `${publicPath}\\icon\\badge.png`
    );

    // Genera asset PWA
    execSync(`pwa-assets-generator --preset minimal-2023 public/favicon.svg`, {
      stdio: "inherit",
    });

    // Build e copia sul server
    execSync(`vite build`, { stdio: "inherit" });
    execSync(`xcopy "${distPath}" "${networkPath}" /h /e /y /i`, {
      stdio: "inherit",
    });

    // Copia il contenuto di runcopy nella cartella di destinazione
    console.log(
      `Copia del contenuto di ${runCopyPath} nella cartella di destinazione: ${networkPath}`
    );
    execSync(`xcopy "${runCopyPath}\\*" "${networkPath}" /h /e /y /i`, {
      stdio: "inherit",
    });

    console.log(`Deploy completato per ${site}`);
  } catch (err) {
    console.error("Errore durante il deploy:", err);
    process.exit(1);
  }
})();
