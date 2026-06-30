import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbookPath = String.raw`C:\Users\kjm12\OneDrive\바탕 화면\Paint Buddy & Co\Progress Invoice\Timbaworx\inv2911_Timbaworx-9 Clarence Street Balgowlah_quote3210\inv2911_Timbaworx-9 Clarence Street Balgowlah_quote3210.xlsx`;
const outputDir = String.raw`C:\Users\kjm12\OneDrive\바탕 화면\Project\PBC-Quote-cal\outputs\invoice-work`;
const previewDir = String.raw`C:\Users\kjm12\OneDrive\바탕 화면\Project\PBC-Quote-cal\tmp\invoice-work\final-preview`;

const money = "$#,##0.00";

const invoices = [
  {
    sheetName: "PBCinv2911 - 02.Mar",
    title: "Progress",
    issueDate: "02.03.2026",
    dueDate: "16.03.2026",
    progressLabel: "Progress payment",
    progressAmount: 14258.27,
    lines: [
      ["Paint buddy & co quote paper 3210", 41588.44],
      ["No Limewash", -4348.62],
      ["Variation", null],
      ["1. Bathroom\n2. Laundry\n3. Bedroom ceiling only", 1130.0],
      ["4. Interior metal handrails + side timber", 2465.0],
      ["5. Pool shed + timber slats", 1160.79],
      ["Fascia rebate", -2081.63],
    ],
    paidLines: [["Paid", 20866.03]],
  },
  {
    sheetName: "PBCinv2911 - 30.Apr",
    title: "Progress",
    issueDate: "30.04.2026",
    dueDate: "14.05.2026",
    progressLabel: "Progress payment",
    progressAmount: 10554.24,
    lines: [
      ["Paint buddy & co quote paper 3210", 41588.44],
      ["No Limewash", -4348.62],
      ["Variation", null],
      ["1. Bathroom\n2. Laundry\n3. Bedroom ceiling only", 1130.0],
      ["4. Interior metal handrails + side timber", 2465.0],
      ["5. Pool shed + timber slats", 1160.79],
      ["6. Exterior handrails", 3205.16],
      ["7. Additional interior work (confirmed by Jon/ patching etc)", 100.0],
      ["Fascia rebate", -2081.63],
    ],
    paidLines: [
      ["Paid on 23rd Dec", 20866.03],
      ["Paid on 17th Mar", 14258.27],
    ],
  },
  {
    sheetName: "PBCinv2911 - Balance",
    title: "Balance Invoice",
    issueDate: "30.06.2026",
    dueDate: "14.07.2026",
    progressLabel: "Balance payment",
    progressAmount: 1862.51,
    lines: [
      ["Paint buddy & co quote paper 3210", 41588.44],
      ["No Limewash", -4348.62],
      ["Variation", null],
      ["1. Bathroom\n2. Laundry\n3. Bedroom ceiling only", 1130.0],
      ["4. Interior metal handrails + side timber", 2465.0],
      ["5. Pool shed + timber slats", 1160.79],
      ["6. Exterior handrails", 3205.16],
      ["7. Additional interior work (confirmed by Jon/ patching etc)", 100.0],
      ["Fascia rebate", -2081.63],
    ],
    paidLines: [
      ["Paid on 23rd Dec", 20866.03],
      ["Paid on 17th Mar", 14258.27],
      ["Paid on 30th Apr", 10554.24],
    ],
  },
];

function writeCell(sheet, address, value) {
  sheet.getRange(address).values = [[value]];
}

function writeFormula(sheet, address, formula) {
  sheet.getRange(address).formulas = [[formula]];
}

function applyCommonFormatting(sheet, finalRow) {
  sheet.getRange("A:A").format.columnWidth = 18;
  sheet.getRange("B:B").format.columnWidth = 34;
  sheet.getRange("C:C").format.columnWidth = 12;
  sheet.getRange("D:D").format.columnWidth = 15;
  sheet.getRange("E:E").format.columnWidth = 20;
  sheet.getRange("F:F").format.columnWidth = 18;
  sheet.getRange("A15:C16").format = {
    font: { bold: true, color: "#FF0000", fontSize: 20 },
    horizontalAlignment: "center",
    wrapText: true,
  };
  sheet.getRange("E15:F16").format = {
    font: { bold: true, color: "#FF0000", fontSize: 20 },
    horizontalAlignment: "right",
    numberFormat: money,
  };
  sheet.getRange("F21:F37").format = {
    horizontalAlignment: "right",
    numberFormat: money,
  };
  sheet.getRange(`E${finalRow - 2}:F${finalRow - 2}`).format = {
    font: { bold: true },
    numberFormat: money,
  };
  sheet.getRange(`E${finalRow - 1}:F${finalRow - 1}`).format = {
    font: { bold: true, color: "#FF0000" },
    numberFormat: money,
  };
  sheet.getRange(`E${finalRow}:F${finalRow}`).format = {
    font: { bold: true },
    numberFormat: money,
  };
  sheet.getRange("A21:B38").format = { wrapText: true };
  sheet.getRange("A20:F45").format.autofitRows();
}

function buildInvoiceSheet(workbook, templateSheet, config) {
  const sheet =
    workbook.worksheets.items.find((worksheet) => worksheet.name === config.sheetName) ??
    workbook.worksheets.add(config.sheetName);
  try {
    sheet.deleteAllDrawings();
  } catch {
    // No drawings in the source workbook.
  }
  const existing = sheet.getUsedRange();
  if (existing) existing.clear({ applyTo: "all" });

  sheet.getRange("A1:F42").copyFrom(templateSheet.getRange("A1:F42"), "all");
  sheet.getRange("A20:F37").clear({ applyTo: "contents" });
  sheet.getRange("A38:B42").clear({ applyTo: "contents" });
  sheet.getRange("A41:B45").copyFrom(templateSheet.getRange("A38:B42"), "all");

  writeCell(sheet, "F10", config.issueDate);
  writeCell(sheet, "F11", config.dueDate);
  writeCell(sheet, "A15", config.title);

  writeCell(sheet, "A20", "As per");

  let row = 21;
  const amountRows = [];
  for (const [description, amount] of config.lines) {
    if (description === "Variation") {
      writeCell(sheet, `A${row}`, description);
    } else if (description.startsWith("1. ")) {
      writeCell(sheet, `B${row}`, description);
    } else if (description.startsWith("4. ") || description.startsWith("5. ") || description.startsWith("6. ") || description.startsWith("7. ")) {
      writeCell(sheet, `B${row}`, description);
    } else {
      writeCell(sheet, `A${row}`, description);
    }

    if (typeof amount === "number") {
      writeCell(sheet, `F${row}`, amount);
      amountRows.push(row);
    }
    row += 1;
  }

  const subtotalRow = Math.max(29, row + 1);
  const totalRow = subtotalRow + 2;
  const paidStartRow = totalRow + 1;
  const paymentRow = paidStartRow + config.paidLines.length;
  const balanceRow = paymentRow + 1;
  const actualGstRow = subtotalRow + 1;

  writeFormula(sheet, "E15", `=F${paymentRow}`);

  writeCell(sheet, `E${subtotalRow}`, "Subtotal");
  writeFormula(sheet, `F${subtotalRow}`, `=ROUND(SUM(${amountRows.map((r) => `F${r}`).join(",")}),2)`);
  writeCell(sheet, `E${actualGstRow}`, "GST");
  writeFormula(sheet, `F${actualGstRow}`, `=ROUND(F${subtotalRow}*0.1,2)`);
  writeCell(sheet, `E${totalRow}`, "Total");
  writeFormula(sheet, `F${totalRow}`, `=ROUND(F${subtotalRow}+F${actualGstRow},2)`);

  config.paidLines.forEach(([label, amount], index) => {
    const paidRow = paidStartRow + index;
    writeCell(sheet, `E${paidRow}`, label);
    writeCell(sheet, `F${paidRow}`, amount);
  });

  writeCell(sheet, `E${paymentRow}`, config.progressLabel);
  writeCell(sheet, `F${paymentRow}`, config.progressAmount);
  writeCell(sheet, `E${balanceRow}`, "Balance");
  const paidRefs = [];
  for (let r = paidStartRow; r <= paymentRow; r += 1) paidRefs.push(`F${r}`);
  writeFormula(sheet, `F${balanceRow}`, `=ROUND(F${totalRow}-SUM(${paidRefs.join(",")}),2)`);

  applyCommonFormatting(sheet, balanceRow);
}

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const workbookDir = path.dirname(workbookPath);
const workbookName = path.basename(workbookPath);
const backupPrefix = workbookName.replace(/\.xlsx$/i, ".backup-before-balance-");
const existingBackups = (await fs.readdir(workbookDir)).filter((name) => name.startsWith(backupPrefix));
const backupPath = workbookPath.replace(/\.xlsx$/i, `.backup-before-balance-${new Date().toISOString().replace(/[:.]/g, "-")}.xlsx`);
if (existingBackups.length === 0) {
  await fs.copyFile(workbookPath, backupPath);
}

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
const templateSheet = workbook.worksheets.getItemAt(0);

for (const invoice of invoices) {
  buildInvoiceSheet(workbook, templateSheet, invoice);
}

for (const sheet of workbook.worksheets.items) {
  const preview = await workbook.render({
    sheetName: sheet.name,
    autoCrop: "all",
    scale: 1,
    format: "png",
  });
  const bytes = new Uint8Array(await preview.arrayBuffer());
  await fs.writeFile(path.join(previewDir, `${sheet.name.replace(/[\\/:*?"<>|]/g, "_")}.png`), bytes);
}

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
console.log("=== ERRORS ===");
console.log(errors.ndjson);

for (const name of invoices.map((invoice) => invoice.sheetName)) {
  const table = await workbook.inspect({
    kind: "region",
    sheetId: name,
    range: "A15:F37",
    maxChars: 6000,
  });
  console.log(`=== CHECK ${name} ===`);
  console.log(table.ndjson);
}

const exported = await SpreadsheetFile.exportXlsx(workbook);
await exported.save(workbookPath);
await exported.save(path.join(outputDir, "inv2911_Timbaworx-9 Clarence Street Balgowlah_quote3210.updated.xlsx"));

console.log(`backup=${backupPath}`);
console.log(`saved=${workbookPath}`);
console.log(`copy=${path.join(outputDir, "inv2911_Timbaworx-9 Clarence Street Balgowlah_quote3210.updated.xlsx")}`);
