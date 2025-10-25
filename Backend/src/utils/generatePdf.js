import PDFDocument from "pdfkit";
import fs from "fs";

function currency(n, symbol = "$") {
  return `${symbol}${Number(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function drawLabelValue(doc, x, y, label, value, width = 240) {
  doc.fillColor("#35689A").font("Helvetica-Bold").fontSize(10).text(label, x, y, { width });
  doc.fillColor("#000000").font("Helvetica").fontSize(11).text(value, x, y + 14, { width });
  return Math.max(doc.y, y + 30);
}

function hRule(doc, x1, x2, y, color = "#DBE2EA") {
  doc.save().strokeColor(color).lineWidth(1).moveTo(x1, y).lineTo(x2, y).stroke().restore();
}

function roundedPanel(doc, x, y, w, h, fill = "#F5F8FC", stroke = "#C9D6E6", r = 6) {
  doc.save();
  doc.fillColor(fill).strokeColor(stroke).lineWidth(1);
  doc.roundedRect(x, y, w, h, r).fillAndStroke();
  doc.restore();
}

function generateMedicalBillingInvoice(data, outPath) {
  const {
    hospital,
    patient,
    physician,
    invoice,
    items,
    notes,
  } = data;

  const blue = "#1F4E79";
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.pipe(fs.createWriteStream(outPath));

  // Top bar
  doc.save().rect(0, 0, doc.page.width, 24).fill(blue).restore();

  // Title
  doc.fillColor("#000000").font("Helvetica-Bold").fontSize(22).text("MEDICAL BILLING INVOICE", 50, 38);

  // Patient and Physician headers
  const colTop = 80;
  const colGap = 40;
  const colWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right - colGap) / 2;

  doc.fillColor("#35689A").font("Helvetica-Bold").fontSize(11).text("PATIENT INFORMATION", 50, colTop);
  doc.fillColor("#35689A").font("Helvetica-Bold").fontSize(11).text(
    "PERSCRIBING PHYSICIAN'S INFORMATION",
    50 + colWidth + colGap,
    colTop
  );

  // Patient block
  let y = colTop + 18;
  y = drawLabelValue(doc, 50, y, "", `${patient.name}\n${patient.email}\n${patient?.address || physician.address}`, colWidth);

  // Physician block
  let y2 = colTop + 18;
  y2 = drawLabelValue(
    doc,
    50 + colWidth + colGap,
    y2,
    "",
    `${physician.name}\n${physician.phone}\n${physician.address}`,
    colWidth
  );

  // Divider
  const rowTop = Math.max(y, y2) + 16;
  hRule(doc, 50, doc.page.width - 50, rowTop, "#E3EAF2");

  // Invoice meta (3 columns: Number, Date, Paid By)
  const metaY = rowTop + 22;
  const pageW = doc.page.width - 100; // left+right margins
  const metaGap = 16;
  const metaW = (pageW - 2 * metaGap) / 3;

  const x1 = 50;
  const x2 = x1 + metaW + metaGap;
  const x3 = x2 + metaW + metaGap;

  doc.fillColor("#000000").font("Helvetica-Bold").fontSize(10).text("INVOICE NUMBER", x1, metaY);
  doc.font("Helvetica").fontSize(12).text(String(invoice.number), x1, metaY + 14, { width: metaW });

  doc.font("Helvetica-Bold").fontSize(10).text("DATE", x2, metaY);
  doc.font("Helvetica").fontSize(12).text(invoice.date, x2, metaY + 14, { width: metaW });

  doc.font("Helvetica-Bold").fontSize(10).text("PAID BY", x3, metaY);
  doc.font("Helvetica").fontSize(12).text(invoice.paidBy, x3, metaY + 14, { width: metaW, align: "left" });

  // Table header
  const tableTop = metaY + 48;
  const col1 = 50;
  const col2 = 230; // Description
  const col3 = 535; // Amount right-aligned
  hRule(doc, 50, 545, tableTop - 8, "#D7E1EC");
  doc.fillColor("#35689A").font("Helvetica-Bold").fontSize(11).text("ITEM", col1, tableTop);
  doc.text("DESCRIPTION", col2, tableTop);
  doc.text("AMOUNT", col3 - 80, tableTop, { width: 80, align: "right" });
  hRule(doc, 50, 545, tableTop + 16, "#35689A");

  // Table rows
  let ty = tableTop + 26;
  doc.font("Helvetica").fontSize(11).fillColor("#000000");
  items.forEach((row) => {
    doc.text(row.item, col1, ty, { width: col2 - col1 - 12 });
    doc.text(row.description, col2, ty, { width: col3 - col2 - 100 });
    doc.text(currency(row.amount, "$"), col3 - 80, ty, { width: 80, align: "right" }); // right align
    ty += 22;
    hRule(doc, 50, 545, ty - 6, "#EFF3F7");
  });

  // Notes
  const notesTop = ty + 12;
  doc.font("Helvetica").fontSize(10).fillColor("#6A7B8C").text("NOTES", 50, notesTop);
  doc.fillColor("#000000").font("Helvetica").fontSize(10).text(notes, 50, notesTop + 12, { width: 360 });

  // Total box only
  const totalsX = 380;
  const totalsW = 165;
  const bigTotalY = ty + 6;
  roundedPanel(doc, totalsX, bigTotalY, totalsW, 40, "#F2F7FF", "#C7D7F0", 6);
  doc.fillColor("#35689A").font("Helvetica-Bold").fontSize(11).text("TOTAL", totalsX + 10, bigTotalY + 6, { width: 60 });
  doc.fillColor("#000000").font("Helvetica-Bold").fontSize(16).text(currency(invoice.total, "$"), totalsX + 70, bigTotalY + 4, {
    width: 85,
    align: "right",
  });

  // Bottom separator
  hRule(doc, 50, 545, 760, "#D7E1EC");

  // Footer
  doc.font("Helvetica-Bold").fontSize(11).fillColor("#35689A").text(hospital.name, 50, 770);
  doc.font("Helvetica").fontSize(10).fillColor("#35689A").text(hospital.url, 50, 786);
  doc.text(`For more information or any issues or concerns, email us at ${hospital.email}`, 200, 770, {
    width: 345,
    align: "right",
  });

  doc.end();
}

// ---------- Example ----------
const data = {
  hospital: {
    name: "Concordia Hill Hospital",
    url: "www.concordiahill.com",
    email: "invoices@concordiahill.com",
  },
  patient: {
    name: "Kemba Harris",
    phone: "(555) 595-5999",
    address: "11 Rosewood Drive,\nCollingwood, NY 33580",
  },
  physician: {
    name: "Dr. Alanah Gomez",
    phone: "(555) 505-5000",
    address: "102 Trope Street,\nNew York, NY 45568",
  },
  invoice: {
    number: 12245,
    date: "07/01/23",
    total: 1902.05,
    paidBy: "UPI", 
  },
  items: [
    { item: "Full Check Up", description: "Full body check up", amount: 745.0 },
    { item: "Ear & Throat Examination", description: "Infection check due to inflammation", amount: 1000.0 },
  ],
  notes: "A prescription has been written out for patient,\nfor an acute throat infection.",
};

generateMedicalBillingInvoice(data, "./Medical_Billing_Invoice.pdf");
console.log("Invoice PDF generated: Medical_Billing_Invoice.pdf");
