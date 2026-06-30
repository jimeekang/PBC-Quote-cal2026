import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const workbookPath = String.raw`C:\Users\kjm12\OneDrive\바탕 화면\Paint Buddy & Co\Progress Invoice\Timbaworx\inv2911_Timbaworx-9 Clarence Street Balgowlah_quote3210\inv2911_Timbaworx-9 Clarence Street Balgowlah_quote3210.xlsx`;
const outDir = String.raw`C:\Users\kjm12\OneDrive\바탕 화면\Project\PBC-Quote-cal\tmp\invoice-work\inspect`;

await fs.mkdir(outDir, { recursive: true });

const input = await FileBlob.load(workbookPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const summary = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 12000,
  tableMaxRows: 8,
  tableMaxCols: 12,
  tableMaxCellChars: 120,
});
console.log("=== SUMMARY ===");
console.log(summary.ndjson);

const sheets = await workbook.inspect({ kind: "sheet", include: "id,name" });
console.log("=== SHEETS ===");
console.log(sheets.ndjson);

for (const sheet of workbook.worksheets.items) {
  const name = sheet.name;
  console.log(`=== REGION ${name} A1:K45 ===`);
  const region = await workbook.inspect({
    kind: "region",
    sheetId: name,
    range: "A1:K45",
    maxChars: 10000,
  });
  console.log(region.ndjson);

  console.log(`=== FORMULAS ${name} A1:K80 ===`);
  const formulas = await workbook.inspect({
    kind: "formula",
    sheetId: name,
    range: "A1:K80",
    maxChars: 8000,
    options: { maxResults: 100 },
  });
  console.log(formulas.ndjson);

  console.log(`=== STYLES ${name} A1:K20 ===`);
  const styles = await workbook.inspect({
    kind: "computedStyle",
    sheetId: name,
    range: "A1:K20",
    maxChars: 6000,
  });
  console.log(styles.ndjson);

  try {
    const preview = await workbook.render({
      sheetName: name,
      autoCrop: "all",
      scale: 1,
      format: "png",
    });
    const bytes = new Uint8Array(await preview.arrayBuffer());
    await fs.writeFile(path.join(outDir, `${name.replace(/[\\/:*?"<>|]/g, "_")}.png`), bytes);
    console.log(`rendered ${name}`);
  } catch (error) {
    console.log(`render failed ${name}: ${error?.message ?? error}`);
  }
}

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "formula error scan",
});
console.log("=== ERRORS ===");
console.log(errors.ndjson);
