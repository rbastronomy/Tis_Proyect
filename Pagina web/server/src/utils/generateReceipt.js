import PDFDocument from 'pdfkit';
import fs from 'fs';
import { ReceiptModel } from '../models/ReceiptModel.js';

export function generateReceipt(receipt) {
    if (!(receipt instanceof ReceiptModel)) {
        throw new Error('Invalid receipt model');
    }

    const doc = new PDFDocument();
    const filePath = `./receipts/receipt_${receipt.codigo_boleta}.pdf`;

    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(25).text('Receipt', { align: 'center' });

    doc.fontSize(12).text(`Codigo Boleta: ${receipt.codigo_boleta}`, { align: 'left' });
    doc.text(`Total: ${receipt.total}`, { align: 'left' });
    doc.text(`Fecha Emision: ${receipt.fecha_emision}`, { align: 'left' });
    doc.text(`Metodo Pago: ${receipt.metodo_pago}`, { align: 'left' });
    doc.text(`Descripcion Boleta: ${receipt.descripcion_boleta}`, { align: 'left' });
    doc.text(`Estado Boleta: ${receipt.estado_boleta}`, { align: 'left' });
    doc.text(`Deleted At Boleta: ${receipt.deleted_at_boleta}`, { align: 'left' });

    doc.end();

    return filePath;
}