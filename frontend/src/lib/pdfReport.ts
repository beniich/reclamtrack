/**
 * @file usePDFReport.ts
 * @description Hook to generate a KPI PDF report using jsPDF + autoTable
 */

export async function generateKPIPDF(data: {
    title: string;
    period: string;
    kpis: { label: string; value: string | number; unit?: string }[];
    tableRows?: string[][];
    tableHeaders?: string[];
}) {
    // Dynamic import to avoid SSR issues
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Brand Colors
    const PRIMARY = [59, 130, 246] as [number, number, number]; // blue-500
    const DARK    = [15, 23, 42]   as [number, number, number]; // slate-900
    const LIGHT   = [248, 250, 252] as [number, number, number]; // slate-50

    // --- Header Banner ---
    doc.setFillColor(...PRIMARY);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ReclamTrack', 14, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(data.title, 14, 23);
    doc.text(`Period: ${data.period}`, 14, 30);

    // Generated date (right side)
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 195, 15, { align: 'right' });

    // --- KPI Summary Grid ---
    doc.setTextColor(...DARK);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Performance Indicators', 14, 48);

    const kpiPerRow = 3;
    const boxW = 55;
    const boxH = 22;
    const startX = 14;
    const startY = 54;
    const gapX = 10;

    data.kpis.forEach((kpi, i) => {
        const col = i % kpiPerRow;
        const row = Math.floor(i / kpiPerRow);
        const x = startX + col * (boxW + gapX);
        const y = startY + row * (boxH + 4);

        // Box background
        doc.setFillColor(...LIGHT);
        doc.roundedRect(x, y, boxW, boxH, 3, 3, 'F');
        doc.setDrawColor(220, 220, 220);
        doc.roundedRect(x, y, boxW, boxH, 3, 3, 'S');

        // Value
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...PRIMARY);
        doc.text(`${kpi.value}${kpi.unit || ''}`, x + boxW / 2, y + 11, { align: 'center' });

        // Label
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(kpi.label, x + boxW / 2, y + 18, { align: 'center' });
    });

    // --- Data Table ---
    if (data.tableRows && data.tableHeaders && data.tableRows.length > 0) {
        const tableStartY = startY + Math.ceil(data.kpis.length / kpiPerRow) * (boxH + 4) + 14;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...DARK);
        doc.text('Detailed Report', 14, tableStartY - 4);

        autoTable(doc, {
            head: [data.tableHeaders],
            body: data.tableRows,
            startY: tableStartY,
            headStyles: {
                fillColor: PRIMARY,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 8,
            },
            bodyStyles: { fontSize: 8, textColor: DARK },
            alternateRowStyles: { fillColor: LIGHT },
            margin: { left: 14, right: 14 },
        });
    }

    // --- Footer ---
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`ReclamTrack — Confidential | Page ${i} of ${pageCount}`, 14, 290);
        doc.text('www.reclamtrack.com', 195, 290, { align: 'right' });
    }

    doc.save(`ReclamTrack_${data.title.replace(/\s+/g, '_')}_${data.period}.pdf`);
}
