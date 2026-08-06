import PDFDocument from 'pdfkit';

export interface ReportData {
  reportNumber: string;
  patientName: string;
  uhid: string;
  age: number;
  gender: string;
  doctorName: string;
  collectionDate: Date;
  reportingDate: Date;
  results: Array<{
    testName: string;
    value: string | number;
    unit: string;
    referenceRange: string;
    isAbnormal: boolean;
    isCritical: boolean;
    isPanic: boolean;
    classification: string;
  }>;
}

export async function generatePdfReport(data: ReportData): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(`data:application/pdf;base64,${pdfData.toString('base64')}`);
      });
      doc.on('error', reject);

      // --- Header ---
      doc
        .fontSize(20)
        .text('HOSPITAL LABORATORY REPORT', { align: 'center' })
        .moveDown();

      // --- Patient & Report Info ---
      doc.fontSize(12);
      
      const leftCol = 50;
      const rightCol = 350;
      const startY = doc.y;

      doc.text(`Report Number: ${data.reportNumber}`, leftCol, startY);
      doc.text(`Patient Name: ${data.patientName}`, leftCol, startY + 15);
      doc.text(`UHID: ${data.uhid}`, leftCol, startY + 30);
      doc.text(`Age/Gender: ${data.age} / ${data.gender}`, leftCol, startY + 45);

      doc.text(`Doctor: ${data.doctorName}`, rightCol, startY);
      doc.text(`Collected: ${data.collectionDate.toLocaleDateString()}`, rightCol, startY + 15);
      doc.text(`Reported: ${data.reportingDate.toLocaleDateString()}`, rightCol, startY + 30);

      doc.moveDown(3);

      // --- Results Table Header ---
      doc.font('Helvetica-Bold');
      const tableTop = doc.y;
      
      doc.text('Investigation', 50, tableTop);
      doc.text('Result', 250, tableTop);
      doc.text('Unit', 350, tableTop);
      doc.text('Reference Range', 450, tableTop);

      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      doc.font('Helvetica');
      let y = tableTop + 25;

      // --- Results Rows ---
      for (const result of data.results) {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        doc.text(result.testName, 50, y);
        
        let resultText = String(result.value);
        
        // Highlight abnormal results
        if (result.isPanic) {
          doc.font('Helvetica-Bold').fillColor('red');
          resultText += ' ***';
        } else if (result.isCritical) {
          doc.font('Helvetica-Bold').fillColor('red');
          resultText += ' **';
        } else if (result.isAbnormal) {
          doc.font('Helvetica-Bold').fillColor('black');
          resultText += ' *';
        }
        
        doc.text(resultText, 250, y);
        
        // Reset font
        doc.font('Helvetica').fillColor('black');
        
        doc.text(result.unit || '-', 350, y);
        doc.text(result.referenceRange || '-', 450, y);

        y += 20;
      }

      // --- Footer ---
      doc.font('Helvetica-Oblique').fontSize(10);
      doc.text('*** End of Report ***', 50, y + 20, { align: 'center' });
      doc.text('This is a computer-generated report and does not require a physical signature.', 50, y + 40, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
