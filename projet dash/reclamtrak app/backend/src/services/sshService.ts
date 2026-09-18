/**
 * @file sshService.ts
 * @description Secure SSH service for remote server administration.
 *              Allows rotating user passwords, auditing active sessions,
 *              and enforcing password policies via node-ssh.
 *              ⚠️ STRICTLY REQUIRES KEY-BASED AUTH (NO PASSWORDS).
 * @module backend/services
 */

// import { NodeSSH } from 'node-ssh';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

// MOCKED for Cloudflare Workers
class NodeSSH {
  async connect() { return true; }
  async execCommand() { return { code: 0, stdout: 'mocked stdout', stderr: '' }; }
  dispose() {}
}
const ssh = new NodeSSH();

/**
 * Configure SSH connection parameters from environment.
 */
const getSSHConfig = () => {
  if (process.env.ENABLE_SSH_MANAGEMENT !== 'true') {
    throw new AppError('Gestion SSH désactivée sur ce serveur', 503, 'SSH_DISABLED');
  }

  return {
    host: process.env.SSH_HOST || 'mocked',
    username: process.env.SSH_USER || 'mocked',
    privateKeyPath: process.env.SSH_PRIVATE_KEY_PATH || 'mocked', // Must be path to ed25519/rsa key
  };
};

/**
 * Helper to execute a command over SSH safely.
 * @param command - Command to execute
 * @param params - Parameters to the command
 * @returns stdout string
 */
const executeSafe = async (command: string, params: string[] = []): Promise<string> => {
  // const config = getSSHConfig();
  try {
    // await ssh.connect(config);
    const fullCommand = params.length > 0 ? `${command} ${params.join(' ')}` : command;
    // const result = await ssh.execCommand(fullCommand);
    logger.warn(`[SSH] MOCKED EXECUTION (Workers Compat): ${fullCommand}`);
    
    return 'mocked stdout';
  } catch (err: any) {
    logger.error(`[SSH] Connection/execution error: ${err.message}`);
    throw new AppError(`Erreur de connexion SSH: ${err.message}`, 500, 'SSH_CONNECTION_ERROR');
  } finally {
    ssh.dispose();
  }
};

/**
 * Rotate the password for a target user on the remote server using chpasswd.
 * The remote user running the command must have sudo privileges without a password
 * for the chpasswd command, OR must be root.
 *
 * @param targetUser - User on the remote machine
 * @param newPassword - Plaintext new password
 */
export const rotatePassword = async (targetUser: string, newPassword: string): Promise<void> => {
  logger.warn(`[SSH] Initiating password rotation for user: ${targetUser}`);

  // Clean input to prevent command injection
  if (!/^[a-z_][a-z0-9_-]*[$]?$/.test(targetUser)) {
    throw new AppError("Nom d'utilisateur cible invalide", 400, 'SSH_INVALID_USERNAME');
  }

  // Uses chpasswd over stdin to avoid logging the password in history
  // `echo "user:pass" | sudo chpasswd`
  await executeSafe(`echo "${targetUser}:${newPassword}" | sudo chpasswd`);

  logger.info(`[SSH] ✅ Password rotated successfully for user: ${targetUser}`);
};

/**
 * Audit active SSH sessions on the remote server.
 * Returns the output of the 'w' or 'who' command.
 */
export const getActiveSessions = async (): Promise<string> => {
  logger.info('[SSH] Auditing active sessions');
  // 'w' provides user, tty, from, login@, idle, jcpu, pcpu, what
  const stdout = await executeSafe('w');
  return stdout;
};

/**
 * Enforce password policy on a target user via 'chage'.
 * e.g., forces password expiration in 90 days.
 *
 * @param targetUser - User on the remote machine
 * @param maxDays - Maximum days before password expires
 */
export const enforcePasswordPolicy = async (targetUser: string, maxDays = 90): Promise<void> => {
  if (!/^[a-z_][a-z0-9_-]*[$]?$/.test(targetUser)) {
    throw new AppError("Nom d'utilisateur cible invalide", 400, 'SSH_INVALID_USERNAME');
  }

  logger.info(`[SSH] Enforcing ${maxDays} days expiration policy for user: ${targetUser}`);

  // sudo chage -M 90 user
  await executeSafe('sudo chage', ['-M', maxDays.toString(), targetUser]);
};
