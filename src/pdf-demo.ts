import fs from "fs";
import PDFTableDocument from "pdfkit-table";
import { createSimplePdf, createTablePdf } from "./createPdfs";
import path from "path";

const fontsDirPath = `node-static-assets/fonts/`;
const registerFonts = (doc: PDFTableDocument) => {
  doc.registerFont("Roboto", `${fontsDirPath}/Roboto-Medium.ttf`);
  doc.registerFont(
    "Helvetica",
    `${path.join(
      __dirname,
      "../node_modules",
      "pdfkit-table",
      "node_modules",
      "pdfkit",
      "js",
      "data",
      "Helvetica.afm"
    )}`
  );
};

const testImageUrl = path.join(__dirname, "lazy-assets", "test.jpeg");
console.log(testImageUrl);
const fetchFile = (url: string): Promise<Buffer> => {
  return new Promise((res, rej) => {
    fs.readFile(testImageUrl, (err, data) => {
      if (err) {
        return rej(err);
      }
      return res(data);
    });
  });
};

const main = async () => {
  const doc = await createSimplePdf(
    testImageUrl,
    fetchFile,
    registerFonts,
    (_doc) => _doc.image("node-static-assets/images/bee.png"),
    (_doc) =>
      _doc.image("images/test.jpeg", _doc.page.width - 160, 90, {
        width: 96,
        height: 36,
      })
  );

  doc.pipe(fs.createWriteStream("simple.pdf"));
  doc.end();

  const tableDoc = await createTablePdf(
    testImageUrl,
    fetchFile,
    registerFonts,
    (_doc) => _doc.image("node-static-assets/images/bee.png"),
    (_doc) =>
      _doc.image("images/test.jpeg", _doc.page.width - 160, 90, {
        width: 96,
        height: 36,
      })
  );
  tableDoc.pipe(fs.createWriteStream("table.pdf"));
  tableDoc.end();
};

main();
