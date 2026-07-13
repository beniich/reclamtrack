import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { Client } from 'ssh2';
import dotenv from 'dotenv';

// Charger les variables de cpanel.env
dotenv.config({ path: 'cpanel.env' });

const {
    CPANEL_HOST,
    CPANEL_PORT = '22',
    CPANEL_USER,
    CPANEL_PASSWORD,
    CPANEL_PATH = 'api'
} = process.env;

if (!CPANEL_HOST || !CPANEL_USER || !CPANEL_PASSWORD) {
    console.error("❌ Erreur : Variables manquantes dans cpanel.env");
    console.error("   Attendu : CPANEL_HOST, CPANEL_USER, CPANEL_PASSWORD");
    process.exit(1);
}

const buildDir = path.resolve('cpanel-build');
const zipPath = path.resolve('cpanel-build.zip');

// Étape 1 : Compresser le dossier cpanel-build
function zipBuild() {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(buildDir)) {
            return reject(new Error("❌ Le dossier cpanel-build n'existe pas. Lancez d'abord : node scripts/prepare-cpanel.mjs"));
        }

        console.log("📦 Étape 1 : Compression du dossier cpanel-build via tar système...");
        if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath); // Supprimer s'il existe déjà

        exec(`tar -a -c -f "${zipPath}" -C "${buildDir}" .`, (error, stdout, stderr) => {
            if (error) {
                console.error("❌ Erreur de compression tar :", stderr);
                return reject(error);
            }
            const sizeMb = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(2);
            console.log(`✅ Compression terminée : ${sizeMb} MB -> cpanel-build.zip`);
            resolve();
        });
    });
}

// Étape 2 : Connexion SSH/SFTP, transfert + extraction
function transferAndDeploy() {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        console.log(`\n🔌 Étape 2 : Connexion SSH à ${CPANEL_HOST}:${CPANEL_PORT}...`);

        conn.on('ready', () => {
            console.log("✅ Connexion SSH établie !");

            conn.sftp((err, sftp) => {
                if (err) { conn.end(); return reject(err); }

                console.log(`\n✈️  Étape 3 : Upload de cpanel-build.zip vers le serveur...`);
                const readStream = fs.createReadStream(zipPath);
                const remoteZip = 'cpanel-build.zip';
                const writeStream = sftp.createWriteStream(remoteZip);

                // Afficher une progression d'upload
                let uploaded = 0;
                const totalSize = fs.statSync(zipPath).size;
                readStream.on('data', (chunk) => {
                    uploaded += chunk.length;
                    const pct = Math.round((uploaded / totalSize) * 100);
                    process.stdout.write(`   Upload : ${pct}%\r`);
                });

                writeStream.on('close', () => {
                    console.log(`\n✅ Upload terminé !`);

                    // Extraction et nettoyage sur le serveur
                    const remotePath = CPANEL_PATH;
                    const cmd = `mkdir -p ~/${remotePath} && cd ~ && unzip -o cpanel-build.zip -d ${remotePath} && rm cpanel-build.zip && echo "DONE"`;

                    console.log(`\n💻 Étape 4 : Extraction dans ~/${remotePath} sur le serveur...`);
                    conn.exec(cmd, (err, stream) => {
                        if (err) { conn.end(); return reject(err); }

                        stream.on('close', (code) => {
                            conn.end();
                            if (code === 0) {
                                console.log(`\n🚀 Déploiement réussi ! Les fichiers sont dans ~/${remotePath}`);
                                console.log("\n📋 Prochaines étapes sur votre cPanel :");
                                console.log("   1. Allez dans Setup Node.js App");
                                console.log(`   2. Application root : ${remotePath}`);
                                console.log("   3. Application startup file : dist/index.js");
                                console.log("   4. Cliquez sur Run NPM Install puis Restart");
                                resolve();
                            } else {
                                reject(new Error(`Extraction échouée avec le code: ${code}`));
                            }
                        })
                        .on('data', (data) => process.stdout.write(`   [SSH] ${data}`))
                        .stderr.on('data', (data) => process.stderr.write(`   [ERR] ${data}`));
                    });
                });

                writeStream.on('error', (err) => { conn.end(); reject(err); });
                readStream.pipe(writeStream);
            });
        });

        conn.on('error', (err) => reject(new Error(`Erreur SSH: ${err.message}`)));

        conn.connect({
            host: CPANEL_HOST,
            port: parseInt(CPANEL_PORT),
            username: CPANEL_USER,
            password: CPANEL_PASSWORD,
            readyTimeout: 30000
        });
    });
}

// Main
async function main() {
    console.log("🚀 ReclamTrack - Script de Déploiement cPanel");
    console.log("==============================================");
    console.log(`   Hôte    : ${CPANEL_HOST}:${CPANEL_PORT}`);
    console.log(`   User    : ${CPANEL_USER}`);
    console.log(`   Cible   : ~/${CPANEL_PATH}`);
    console.log("==============================================\n");

    try {
        await zipBuild();
        await transferAndDeploy();

        // Nettoyage local
        if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
        console.log("\n✨ Déploiement terminé avec succès !");

    } catch (error) {
        if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
        console.error("\n❌ Erreur de déploiement :", error.message);
        process.exit(1);
    }
}

main();
