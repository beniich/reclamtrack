import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger.js';
import prisma from '../lib/prisma.js';

/**
 * Seed les comptes démo (admin + superadmin) au démarrage
 * Idempotent : ne crée que si les comptes n'existent pas déjà.
 */
export const seedDemoAccounts = async (): Promise<void> => {
    // With Prisma / Supabase we are always persisting data, but we can still seed demo accounts in dev.
    const isDev = process.env.NODE_ENV === 'development';
    const isDemoMode = process.env.DEMO_MODE === 'true';

    if (!isDev && !isDemoMode) return;

    logger.info('🌱 Seed comptes démo (Prisma/PostgreSQL)...');

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
            role: 'admin' as const,       
            orgName: 'ReclamTrack HQ',
            orgSlug: 'reclamtrack-hq',
        },
    ];

    for (const acc of accounts) {
        const exists = await prisma.user.findUnique({ where: { email: acc.email } });
        if (exists) {
            logger.info(`   ⏭️  ${acc.email} existe déjà`);
            continue;
        }

        const hashedPassword = await bcrypt.hash(acc.password, 10);

        // ── 1. Créer le user d'abord ───────────────────
        const user = await prisma.user.create({
            data: {
                email: acc.email,
                password: hashedPassword,
                name: acc.name,
                role: acc.role,
                isEmailVerified: true,
            }
        });

        // ── 2. Créer l'organisation avec ownerId ─────────────────────────────
        const org = await prisma.organization.create({
            data: {
                name: acc.orgName,
                slug: acc.orgSlug,
                ownerId: user.id,
                subscriptionPlan: 'ENTERPRISE',
                subscriptionStatus: 'ACTIVE',
                subscriptionMaxUsers: 100,
                subscriptionMaxTickets: 10000,
                subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            }
        });

        // ── 3. Lier user → org ───────────────────────────────────────────────
        // Not strictly needed on User model since memberships handles it, but if you have a field on user you can update it.
        // We removed organizationId from User in Prisma in favor of Memberships, but wait!
        // In schema.prisma, did I leave organizationId on User?
        // Let's check: "organizationId String?" yes it is there as a quick relation.
        await prisma.user.update({
            where: { id: user.id },
            data: { organizationId: org.id }
        });

        // ── 4. Créer le membership ───────────────────────────────────────────
        await prisma.membership.create({
            data: {
                userId: user.id,
                organizationId: org.id,
                roles: ['OWNER'],
                status: 'ACTIVE',
            }
        });

        logger.info(`   ✅ ${acc.email} créé (role: ${acc.role})`);
    }

    logger.info('🌱 Seed démo terminé.');
};
