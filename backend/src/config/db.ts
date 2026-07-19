import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';
import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';
import os from 'os';

let mongod: MongoMemoryServer | null = null;

/** Nettoie les lock files laissés par un crash précédent de mongod */
function cleanMongoLocks(): void {
    const lockPaths = [
        path.join(os.tmpdir(), 'mongo-memory-server', 'mongod.lock'),
        path.join(process.cwd(), 'data', 'mongod.lock'),
    ];
    for (const lockPath of lockPaths) {
        try {
            if (fs.existsSync(lockPath)) {
                fs.unlinkSync(lockPath);
                logger.info(`🧹 Lock file supprimé : ${lockPath}`);
            }
        } catch {
            // ignorer
        }
    }
}

export const connectDB = async () => {
    try {
        let mongoUri = process.env.MONGODB_URI;

        const useMemory = !mongoUri
            || mongoUri.includes('username:password')
            || process.env.USE_MEMORY_DB === 'true';

        if (useMemory) {
            cleanMongoLocks();
            logger.info('🧠 Initialisation de MongoDB en mémoire...');
            mongod = await MongoMemoryServer.create();
            mongoUri = mongod.getUri();
            (global as any).IS_MEMORY_DB = true;
        }

        await mongoose.connect(mongoUri!);
        logger.info(`✅ MongoDB connecté (${(global as any).IS_MEMORY_DB ? 'MÉMOIRE' : 'PERSISTANT'})`);
    } catch (err) {
        (global as any).IS_DEMO_MODE = true;
        logger.warn('⚠️  Impossible de se connecter à MongoDB — Mode DÉMO activé');
        logger.warn('💡 Erreur:', err instanceof Error ? err.message : String(err));
    }
};

export const disconnectDB = async () => {
    await mongoose.disconnect();
    if (mongod) {
        await mongod.stop();
        mongod = null;
    }
};



