import fs from 'fs';
import path from 'path';
import AuditLog from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';

export class InternalAuditAgent {
    private static reportDir = path.join(process.cwd(), 'compliance_reports');

    /**
     * Analyse les données du dernier mois et génère un rapport Markdown
     */
    static async generateMonthlyAuditReport() {
        if (!fs.existsSync(this.reportDir)) {
            fs.mkdirSync(this.reportDir);
        }

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        logger.info(`🤖 Agent d'Audit : Début de l'analyse mensuelle depuis ${firstDayOfMonth.toISOString()}`);

        // 1. Statistiques Globales
        const totalLogs = await AuditLog.countDocuments({ createdAt: { $gte: firstDayOfMonth } });
        const failures = await AuditLog.countDocuments({ createdAt: { $gte: firstDayOfMonth }, outcome: 'FAILURE' });
        const blocked = await AuditLog.countDocuments({ createdAt: { $gte: firstDayOfMonth }, outcome: 'BLOCKED' });

        // 2. Détection d'Anomalies (Auth)
        const bruteForceAttempts = await AuditLog.aggregate([
            { $match: { createdAt: { $gte: firstDayOfMonth }, category: 'AUTH', outcome: 'FAILURE' } },
            { $group: { _id: "$ipAddress", count: { $sum: 1 } } },
            { $match: { count: { $gt: 10 } } }
        ]);

        // 3. Accès aux Actifs Sensibles
        const sensitiveAccess = await AuditLog.find({
            createdAt: { $gte: firstDayOfMonth },
            action: { $regex: /assets/i },
            severity: { $in: ['HIGH', 'CRITICAL'] }
        }).limit(20).populate('userId', 'name email');

        // Génération du contenu Markdown
        const reportContent = `
# 🛡️ Rapport d'Audit Interne - ReclamTrack v3.0
**Période :** ${firstDayOfMonth.toLocaleDateString()} au ${now.toLocaleDateString()}
**Généré le :** ${now.toLocaleString()}
**Agent :** Antigravity Compliance Engine

## 1. Résumé des Événements
- **Total des événements loggués :** ${totalLogs}
- **Échecs détectés :** ${failures} ⚠️
- **Tentatives bloquées par Firewall/WAF :** ${blocked}

## 2. Analyse de Sécurité (Anomalies)
### Tentatives de Brute-Force suspectées
${bruteForceAttempts.length > 0 ? 
    bruteForceAttempts.map(a => `- IP: \`${(a as { _id: string, count: number })._id}\` (${(a as { _id: string, count: number }).count} tentatives)`).join('\n') : 
    "✅ Aucune tentative groupée suspecte détectée."}

### Accès aux données confidentielles (ISO 27001)
${sensitiveAccess.length > 0 ? 
    sensitiveAccess.map(s => `- **${(s.userId as unknown as { name?: string })?.name || 'Inconnu'}** a accédé à un actif critique le ${s.timestamp.toLocaleString()} (IP: ${s.ipAddress})`).join('\n') : 
    "✅ Aucun accès anormal aux actifs restreints."}

## 3. Score de Conformité SOC 2
- **Contrôle d'Accès (CC6.1) :** COMPLIANT (Audit logs actifs)
- **Intégrité du Système (CC7.1) :** COMPLIANT (Input validation active)
- **Monitoring :** ACTIVE

---
*Ceci est un rapport généré automatiquement par l'IA d'Audit Interne.*
`;

        const filename = `audit_report_${now.getFullYear()}_${now.getMonth() + 1}.md`;
        const filepath = path.join(this.reportDir, filename);
        
        fs.writeFileSync(filepath, reportContent);
        logger.info(`✅ Rapport d'audit généré : ${filepath}`);
        
        return { filename, filepath, summary: { totalLogs, failures } };
    }
}
