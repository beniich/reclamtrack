import { connectDB } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

console.log("🚀 Lancement du test DB...");
connectDB().then(() => {
    console.log("🎉 Test de connexion réussi !");
    process.exit(0);
}).catch((err) => {
    console.error("❌ Test de connexion échoué :", err);
    process.exit(1);
});
