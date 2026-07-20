/**
 * @file envValidator.ts
 * @description Validates all required environment variables at server startup.
 *              Fails fast if any required var is missing.
 * @module backend/config
 */

import { config } from 'dotenv';
config();

/** Variables always required regardless of mode */
const ALWAYS_REQUIRED: string[] = ['PORT', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'ALLOWED_ORIGINS'];

/** Required only when not in demo mode */
const REQUIRED_IN_PRODUCTION: string[] = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
];

/** Required only when Stripe is enabled */
const STRIPE_REQUIRED: string[] = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'];

/** Required only when SSH management is enabled */
const SSH_REQUIRED: string[] = ['SSH_HOST', 'SSH_USER', 'SSH_PRIVATE_KEY_PATH'];

export const envValidator = (): void => {
  const missing: string[] = [];

  // Always required
  for (const key of ALWAYS_REQUIRED) {
    if (!process.env[key]) missing.push(key);
  }

  // Production-only vars
  if (process.env.ENABLE_DEMO !== 'true') {
    for (const key of REQUIRED_IN_PRODUCTION) {
      if (!process.env[key]) missing.push(key);
    }
  }

  // Stripe vars — only if Stripe is not explicitly disabled
  if (process.env.DISABLE_STRIPE !== 'true') {
    for (const key of STRIPE_REQUIRED) {
      if (!process.env[key]) {
        console.warn(`⚠️  Variable Stripe manquante (billing désactivé): ${key}`);
      }
    }
  }

  // SSH vars — only if SSH management is enabled
  if (process.env.ENABLE_SSH_MANAGEMENT === 'true') {
    for (const key of SSH_REQUIRED) {
      if (!process.env[key]) missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error(`❌ Variables d'environnement manquantes : ${missing.join(', ')}`);
    console.error('Vérifiez votre fichier .env (voir .env.example pour la liste complète)');
    process.exit(1);
  }

  console.log("✅ Variables d'environnement validées");
};
