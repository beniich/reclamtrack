import ExcelJS from 'exceljs';
import { complianceService } from './complianceService.js';

export class AuditReportService {
    async generateExcelReport(organizationId?: string): Promise<Buffer> {
        const reportData = await complianceService.generateReport(organizationId);
        
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'ReclamTrack AI Audit Bot';
        workbook.lastModifiedBy = 'ReclamTrack';
        workbook.created = new Date();

        // 1. Executive Summary Sheet
        const summarySheet = workbook.addWorksheet('Synthèse Exécutive');
        summarySheet.columns = [
            { header: 'Indicateur', key: 'name', width: 30 },
            { header: 'Valeur', key: 'value', width: 50 },
        ];

        summarySheet.addRow({ name: 'Date de l\'audit', value: reportData.timestamp });
        summarySheet.addRow({ name: 'Score Global de Conformité', value: `${reportData.score}%` });
        summarySheet.addRow({ name: 'Statut du Logging', value: reportData.details.audit.health });
        summarySheet.addRow({ name: 'Taux Adoption MFA', value: `${reportData.details.iam.mfaAdoptionRate.toFixed(2)}%` });

        // 2. Controls Maturity Sheet
        const controlsSheet = workbook.addWorksheet('Maturité des Contrôles');
        controlsSheet.columns = [
            { header: 'ID Contrôle', key: 'id', width: 20 },
            { header: 'Référentiel', key: 'framework', width: 20 },
            { header: 'Nom du Contrôle', key: 'name', width: 40 },
            { header: 'Statut', key: 'status', width: 15 },
            { header: 'Détails Techniques', key: 'details', width: 60 },
        ];

        reportData.controls.forEach(control => {
            const row = controlsSheet.addRow(control);
            // Apply conditional formatting for status
            const statusCell = row.getCell('status');
            if (control.status === 'PASS') {
                statusCell.font = { color: { argb: 'FF006400' }, bold: true };
            } else if (control.status === 'FAIL') {
                statusCell.font = { color: { argb: 'FFFF0000' }, bold: true };
            }
        });

        // 3. Raw Stats Sheet
        const statsSheet = workbook.addWorksheet('Statistiques Brutes');
        statsSheet.addRow(['Secteur', 'Clé', 'Valeur']);
        Object.entries(reportData.details).forEach(([sector, data]) => {
            Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
                statsSheet.addRow([sector, key, JSON.stringify(value)]);
            });
        });

        const buffer = await workbook.xlsx.writeBuffer() as unknown as Buffer;
        return buffer;
    }
}

export const auditReportService = new AuditReportService();
