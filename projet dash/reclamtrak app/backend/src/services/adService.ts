// import ActiveDirectory from 'activedirectory2';
import ADSyncLog from '../models/ADSyncLog.js';
import { Membership } from '../models/Membership.js';
import { User } from '../models/User.js';

interface ADConfig {
  url: string;
  baseDN: string;
  username: string;
  password: string;
}

interface ADUser {
  dn: string;
  cn: string;
  sAMAccountName: string;
  userPrincipalName?: string;
  givenName?: string;
  sn?: string;
  mail?: string;
  telephoneNumber?: string;
  memberOf?: string[] | string;
}

export class ActiveDirectoryService {
  private ad: any;
  private ldapClient: any;
  private config: ADConfig;

  constructor(config: ADConfig) {
    this.config = config;

    // MOCKED FOR CLOUDFLARE WORKERS
    console.warn('[ActiveDirectoryService] initialized in MOCK mode for Cloudflare Workers');
  }

  // Check connection
  async checkConnection(): Promise<boolean> {
    return true; // Mocked success
  }

  // Authenticate user
  async authenticateUser(username: string, password: string): Promise<boolean> {
    console.warn(`[AD] MOCKED authenticateUser for ${username}`);
    return true; // Mocked
  }

  // Get all users
  async getAllUsers(): Promise<ADUser[]> {
    console.warn(`[AD] MOCKED getAllUsers`);
    return []; // Mocked
  }

  // Get user by username
  async getUserByUsername(username: string): Promise<ADUser | null> {
    console.warn(`[AD] MOCKED getUserByUsername for ${username}`);
    return null; // Mocked
  }

  // Get user groups
  async getUserGroups(username: string): Promise<string[]> {
    console.warn(`[AD] MOCKED getUserGroups for ${username}`);
    return []; // Mocked
  }

  // Sync users to MongoDB
  async syncToMongoDB(organizationId: string): Promise<{
    imported: number;
    updated: number;
    errors: any[];
  }> {
    const results = { imported: 0, updated: 0, errors: [] as any[] };
    let users: ADUser[] = [];

    try {
      users = await this.getAllUsers();
    } catch (error: any) {
      console.error('Failed to fetch users from AD:', error);
      throw new Error('Failed to fetch users from AD: ' + error.message);
    }

    const startTime = Date.now();

    for (const adUser of users) {
      try {
        if (!adUser.sAMAccountName) continue;

        const groups = await this.getUserGroups(adUser.sAMAccountName);
        const role = this.mapGroupsToRole(groups);

        // Ensure email exists or create a fake one based on usage
        const email = adUser.mail || `${adUser.sAMAccountName}@reclamtrack.local`.toLowerCase();

        // Check if user exists
        const existingUser = await User.findOne({
          $or: [{ email: email }, { adUsername: adUser.sAMAccountName }],
        });

        if (existingUser) {
          // Update
          await User.findByIdAndUpdate(existingUser._id, {
            firstName: adUser.givenName || adUser.cn.split(' ')[0],
            lastName: adUser.sn || adUser.cn.split(' ').slice(1).join(' '),
            phone: adUser.telephoneNumber,
            adSyncedAt: new Date(),
            adGroups: groups,
          });

          // Ensure membership exists
          const membership = await Membership.findOne({
            userId: existingUser._id,
            organizationId,
          });

          if (!membership) {
            await Membership.create({
              userId: existingUser._id,
              organizationId,
              roles: [role],
              status: 'active',
            });
          } else if (!membership.roles || !membership.roles.includes(role)) {
            // Update role if changed in AD
            // Note: Usually we might want to manually manage keys, but let's sync for now
            // await Membership.findByIdAndUpdate(membership._id, { roles: [role] });
          }

          results.updated++;
        } else {
          // Create new User
          const newUser = await User.create({
            email,
            password: 'AD_AUTH_USER', // Placeholder, they authenticate against AD
            firstName: adUser.givenName || adUser.cn.split(' ')[0],
            lastName: adUser.sn || adUser.cn.split(' ').slice(1).join(' ') || 'User',
            phone: adUser.telephoneNumber,
            role,
            adUsername: adUser.sAMAccountName,
            adSyncedAt: new Date(),
            adGroups: groups,
            authMethod: 'ad',
            isVerified: true,
          });

          // Create membership
          await Membership.create({
            userId: newUser._id,
            organizationId,
            roles: [role],
            status: 'active',
          });
          results.imported++;
        }
      } catch (error: any) {
        results.errors.push({
          username: adUser.sAMAccountName,
          error: error.message,
        });
      }
    }

    // Log sync
    await ADSyncLog.create({
      organizationId,
      syncType: 'manual',
      action: results.errors.length > 0 ? 'error' : 'imported',
      totalProcessed: users.length,
      successful: results.imported + results.updated,
      failed: results.errors.length,
      changes: {
        imported: results.imported,
        updated: results.updated,
        disabled: 0,
      },
      duration: Date.now() - startTime,
      syncErrors: results.errors,
    });

    return results;
  }

  // Map AD groups to ReclamTrack roles
  private mapGroupsToRole(groups: string[]): string {
    const normalizedGroups = groups.map((g) => g.toLowerCase());

    if (normalizedGroups.some((g) => g.includes('admin') || g.includes('domain admins'))) {
      return 'admin';
    } else if (normalizedGroups.some((g) => g.includes('manager'))) {
      return 'manager';
    } else if (normalizedGroups.some((g) => g.includes('support') || g.includes('agent'))) {
      return 'agent';
    } else {
      return 'citizen'; // default role
    }
  }
}

export default ActiveDirectoryService;
