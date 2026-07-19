import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger.js';
import { User } from '../models/User.js';
import { Organization } from '../models/Organization.js';
import { Membership } from '../models/Membership.js';

/**
 * Seed les comptes démo (admin + superadmin) au démarrage en mode mémoire.
 * Idempotent : ne crée que si les comptes n'existent pas déjà.
 */
export const seedDemoAccounts = async (): Promise<void> => {
    // Only seed in memory DB mode (dev/demo) or when explicitly requested
    const isMemoryDB = (global as any).IS_MEMORY_DB;
    const isDev = process.env.NODE_ENV === 'development';
    const isDemoMode = process.env.DEMO_MODE === 'true' || process.env.USE_MEMORY_DB === 'true';

    if (!isMemoryDB && !isDev && !isDemoMode) return;
    if (!isMemoryDB) return;


    logger.info('🌱 Seed comptes démo (mode mémoire)...');

    const accounts = [
        {
            email: 'admin@reclamtrack.com',
            password: 'Admin123!',
            name: 'Admin Demo',
            role: 'admin' as const,
            orgName: 'ReclamTrack Demo',
            orgSlug: 'reclamtrack-demo',
        },
        {
            email: 'superadmin@reclamtrack.com',
            password: 'SuperAdmin123!',
            name: 'Super Admin',
            role: 'admin' as const,       // superadmin n'existe pas dans l'enum User
            orgName: 'ReclamTrack HQ',
            orgSlug: 'reclamtrack-hq',
        },
    ];


    for (const acc of accounts) {
        const exists = await User.findOne({ email: acc.email });
        if (exists) {
            logger.info(`   ⏭️  ${acc.email} existe déjà`);
            continue;
        }

        // ── 1. Créer le user d'abord (pour avoir son _id) ───────────────────
        const user = await User.create({
            email: acc.email,
            password: acc.password,
            name: acc.name,
            role: acc.role,
            isEmailVerified: true,
        });

        // ── 2. Créer l'organisation avec ownerId ─────────────────────────────
        const org = await Organization.create({
            name: acc.orgName,
            slug: acc.orgSlug,
            ownerId: user._id,
            subscription: {
                plan: 'ENTERPRISE',
                status: 'ACTIVE',
                maxUsers: 100,
                maxTickets: 10000,
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
        });

        // ── 3. Lier user → org ───────────────────────────────────────────────
        user.organizationId = org._id as any;
        await user.save();

        // ── 4. Créer le membership ───────────────────────────────────────────
        await Membership.create({
            userId: user._id,
            organizationId: org._id,
            roles: ['OWNER'],
            status: 'ACTIVE',
        });

        logger.info(`   ✅ ${acc.email} créé (role: ${acc.role})`);
    }

    logger.info('🌱 Seed démo terminé.');
};
