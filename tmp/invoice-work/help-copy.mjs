import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const workbookPath = String.raw`C:\Users\kjm12\OneDrive\바탕 화면\Paint Buddy & Co\Progress Invoice\Timbaworx\inv2911_Timbaworx-9 Clarence Street Balgowlah_quote3210\inv2911_Timbaworx-9 Clarence Street Balgowlah_quote3210.xlsx`;
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
console.log(workbook.help("worksheet copy", { include: "index,examples,notes", maxChars: 8000 }).ndjson);
