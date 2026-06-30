import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbookPath = String.raw`C:\Users\kjm12\OneDrive\바탕 화면\Paint Buddy & Co\Progress Invoice\Timbaworx\inv2911_Timbaworx-9 Clarence Street Balgowlah_quote3210\inv2911_Timbaworx-9 Clarence Street Balgowlah_quote3210.xlsx`;
const previewDir = String.raw`C:\Users\kjm12\OneDrive\바탕 화면\Project\PBC-Quote-cal\tmp\invoice-work\saved-preview`;

await fs.mkdir(previewDir, { recursive: true });

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
console.log("=== SHEETS ===");
for (const sheet of workbook.worksheets.items) console.log(sheet.name);

const checks = [
  ["PBCinv2911 - 02.Mar", "E29:F34"],
  ["PBCinv2911 - 30.Apr", "E31:F37"],
  ["PBCinv2911 - Balance", "E31:F38"],
];

for (const [sheetName, range] of checks) {
  const sheet = workbook.worksheets.getItem(sheetName);
  console.log(`=== ${sheetName} ${range} VALUES ===`);
  console.log(JSON.stringify(sheet.getRange(range).values));
  console.log(`=== ${sheetName} ${range} FORMULAS ===`);
  console.log(JSON.stringify(sheet.getRange(range).formulas));
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(
    path.join(previewDir, `${sheetName.replace(/[\\/:*?"<>|]/g, "_")}.png`),
    new Uint8Array(await preview.arrayBuffer()),
  );
}

const errorPattern = /#REF!|#DIV\/0!|#VALUE!|#NAME\?|#N\/A/;
const matches = [];
for (const sheet of workbook.worksheets.items) {
  const values = sheet.getRange("A1:F45").values;
  const formulas = sheet.getRange("A1:F45").formulas;
  values.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      if (typeof value === "string" && errorPattern.test(value)) {
        matches.push(`${sheet.name}!${rowIndex + 1},${colIndex + 1}: ${value}`);
      }
    });
  });
  formulas.forEach((row, rowIndex) => {
    row.forEach((formula, colIndex) => {
      if (typeof formula === "string" && errorPattern.test(formula)) {
        matches.push(`${sheet.name}!${rowIndex + 1},${colIndex + 1}: ${formula}`);
      }
    });
  });
}
console.log("=== ERROR_MATCHES ===");
console.log(JSON.stringify(matches));
if (matches.length > 0) process.exitCode = 1;
