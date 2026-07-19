import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendMail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    // Si les credentials SMTP ne sont pas configurés (placeholder par défaut) ou en mode mémoire
    const isSimulated = process.env.SMTP_USER === 'your_user'
      || !process.env.SMTP_USER
      || process.env.USE_MEMORY_DB === 'true'
      || (global as any).IS_MEMORY_DB;

    if (isSimulated) {
        logger.warn(`⚠️ Mode DEV/DEMO: Email simulé pour ${to} (Sujet: ${subject})`);
        return { messageId: 'simulated-id' };
    }

    const info = await transporter.sendMail({
      from: `"ReclamTrack" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    logger.info(`✉️ Email envoyé : ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`❌ Échec envoi email à ${to}:`, error);
    // En développement, on ne veut pas bloquer l'inscription si SMTP plante
    if (process.env.NODE_ENV === 'development') {
        logger.warn(`⚠️ Erreur ignorée en développement. L'inscription continue.`);
        return { messageId: 'failed-but-ignored' };
    }
    throw error;
  }
};

/**
 * Envoie un email de réinitialisation de mot de passe
 */
export const sendPasswordResetEmail = async (to: string, token: string) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const html = `
        <h1>Réinitialisation de votre mot de passe</h1>
        <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte ReclamTrack.</p>
        <p>Veuillez cliquer sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a>
        <p>Ce lien expirera dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
    `;

  return sendMail({
    to,
    subject: 'Réinitialisation de votre mot de passe - ReclamTrack',
    html,
  });
};

/**
 * Envoie un email de bienvenue et de vérification
 */
export const sendEmailVerification = async (to: string, token: string) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const html = `
        <h1>Bienvenue sur ReclamTrack !</h1>
        <p>Merci de vous être inscrit. Pour commencer à utiliser votre compte, veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :</p>
        <a href="${verificationUrl}" style="padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px;">Vérifier mon compte</a>
        <p>Si vous n'avez pas créé de compte sur ReclamTrack, vous pouvez ignorer cet email.</p>
    `;

  return sendMail({
    to,
    subject: 'Vérifiez votre compte ReclamTrack',
    html,
  });
};

/**
 * Envoie un email de bienvenue après vérification
 */
export const sendWelcomeEmail = async (to: string, name?: string) => {
  const html = `
        <h1>Email vérifié avec succès !</h1>
        <p>Bonjour ${name || 'cher utilisateur'},</p>
        <p>Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités de ReclamTrack.</p>
        <p>À bientôt sur votre tableau de bord !</p>
    `;

  return sendMail({
    to,
    subject: 'Bienvenue sur ReclamTrack',
    html,
  });
};
/**
 * Envoie une alerte de sécurité critique
 */
export const sendSecurityAlert = async (type: string, severity: string, description: string, evidence: any) => {
    const adminEmail = process.env.SECURITY_ADMIN_EMAIL || process.env.SMTP_USER;
    if (!adminEmail) return;

    const html = `
        <div style="font-family: sans-serif; border: 2px solid #ef4444; padding: 20px; border-radius: 10px;">
            <h1 style="color: #ef4444;">🚨 ALERTE SÉCURITÉ CRITIQUE - ReclamTrack</h1>
            <p><strong>Type d'incident :</strong> ${type}</p>
            <p><strong>Sévérité :</strong> <span style="padding: 2px 8px; background-color: #ef4444; color: white; border-radius: 4px;">${severity}</span></p>
            <p><strong>Description :</strong> ${description}</p>
            <hr />
            <h3>Preuves / Détails :</h3>
            <pre style="background-color: #f1f5f9; padding: 10px; border-radius: 5px;">${JSON.stringify(evidence, null, 2)}</pre>
            <p style="margin-top: 20px;">
                <a href="${process.env.FRONTEND_URL}/compliance" style="padding: 10px 20px; background-color: #0f172a; color: white; text-decoration: none; border-radius: 5px;">Accéder au Compliance Center</a>
            </p>
        </div>
    `;

    return sendMail({
        to: adminEmail,
        subject: `[ALERTE ${severity}] Incident de sécurité détecté : ${type}`,
        html,
    });
};
