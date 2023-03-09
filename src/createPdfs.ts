import { Buffer } from "buffer";
import fs from "fs";
import PDFTableDocument from "pdfkit-table";
export const waitForData = async (doc: PDFTableDocument): Promise<string> => {
  return new Promise((resolve, reject) => {
    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);
      const pdfBase64 = pdfBuffer.toString("base64");
      resolve(`data:application/pdf;base64,${pdfBase64}`);
    });
    doc.on("error", reject);
  });
};

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in suscipit purus. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus nec hendrerit felis. Morbi aliquam facilisis risus eu lacinia. Sed eu leo in turpis fringilla hendrerit. Ut nec accumsan nisl. Suspendisse rhoncus nisl posuere tortor tempus et dapibus elit porta. Cras leo neque, elementum a rhoncus ut, vestibulum non nibh. Phasellus pretium justo turpis. Etiam vulputate, odio vitae tincidunt ultricies, eros odio dapibus nisi, ut tincidunt lacus arcu eu elit. Aenean velit erat, vehicula eget lacinia ut, dignissim non tellus. Aliquam nec lacus mi, sed vestibulum nunc. Suspendisse potenti. Curabitur vitae sem turpis. Vestibulum sed neque eget dolor dapibus porttitor at sit amet sem. Fusce a turpis lorem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;\nMauris at ante tellus. Vestibulum a metus lectus. Praesent tempor purus a lacus blandit eget gravida ante hendrerit. Cras et eros metus. Sed commodo malesuada eros, vitae interdum augue semper quis. Fusce id magna nunc. Curabitur sollicitudin placerat semper. Cras et mi neque, a dignissim risus. Nulla venenatis porta lacus, vel rhoncus lectus tempor vitae. Duis sagittis venenatis rutrum. Curabitur tempor massa tortor.";

export const createSimplePdf = async (
  testImageUrl: string,
  fetchFile: (url: string) => Promise<Buffer>,
  registerFonts: (doc: PDFTableDocument) => void,
  registerImage: (doc: PDFTableDocument) => void,
  registerLazyImage: (doc: PDFTableDocument) => void
) => {
  await fetchFile(testImageUrl)
    .then((testImageData) => {
      return fs.writeFileSync("images/test.jpeg", testImageData);
    })
    .catch((error) => {
      console.error(error);
    });
  const doc = new PDFTableDocument();

  registerFonts(doc);

  doc.fontSize(25).text("Here is some vector graphics...", 100, 80);

  doc.save().moveTo(100, 150).lineTo(100, 250).lineTo(200, 250).fill("#FF3300");
  doc.circle(280, 200, 50).fill("#6600FF");
  doc
    .scale(0.6)
    .translate(470, 130)
    .path("M 250,75 L 323,301 131,161 369,161 177,301 z")
    .fill("red", "even-odd")
    .restore();
  doc
    .font("Roboto")
    .text("And here is some wrapped text...", 100, 300)
    .fontSize(13)
    .moveDown()
    .text(lorem, {
      width: 412,
      align: "justify",
      indent: 30,
      columns: 2,
      height: 300,
      ellipsis: true,
    });

  doc.addPage();

  registerImage(doc.fontSize(25).font("Courier").text("And an image..."));

  doc.font("Courier-Bold").moveDown(5).text("Finish...");

  doc.addPage();

  doc
    .font("Roboto")
    .fontSize(18)
    .text("Not yet. Lets try to show an image lazy loaded");

  try {
    registerLazyImage(doc);
  } catch (error) {
    doc.moveDown().text(`\${error}`);
    doc.text("Image not loaded. Try again later.");
  }
  return doc;
};

export const createTablePdf = async (
  testImageUrl: string,
  fetchFile: (url: string) => Promise<Buffer>,
  registerFonts: (doc: PDFTableDocument) => void,
  registerImage: (doc: PDFTableDocument) => void,
  registerLazyImage: (doc: PDFTableDocument) => void
) => {
  await fetchFile(testImageUrl)
    .then((testImageData) => {
      return fs.writeFileSync("images/test.jpeg", testImageData);
    })
    .catch((error) => {
      console.error(error);
    });
  const doc = new PDFTableDocument({ size: "A4" });

  registerFonts(doc);

  const pageWidth = doc.page.width - 80;

  doc
    .rect(40, 40, pageWidth, 126)
    .fill("#EDECE5")
    .fontSize(24)
    .fill("black")
    .text("Title", 64, 76);

  doc
    .fontSize(14)
    .fillColor("#0B0C0C")
    .text("https://reallylonglinktosomething.com/123456789", 64, 114, {
      link: "https://google.com",
      underline: true,
    });
  try {
    registerLazyImage(doc);
  } catch (error) {
    doc.moveDown().text(`\${error}`);
    doc.text("Image not loaded. Try again later.");
  }

  doc.moveDown(3);
  const firstColumnWidth = pageWidth * 0.4;
  const table = {
    headers: [
      { width: firstColumnWidth, property: "name" },
      {
        width: pageWidth - firstColumnWidth,
        property: "description",
      },
    ],
    datas: [
      {
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean mattis ante in laoreet egestas. ",
        name: "Name 1",
      },
      {
        name: "bold:Name 2",
        description: "bold:Lorem ipsum dolor.",

        options: { fontSize: 10 },
      },
      {
        name: "Name 3",
        description: "Lorem ipsum dolor.",
      },
    ],
  };

  //@ts-ignore
  await doc.table(table, {
    hideHeader: true,
    x: 40,
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
    prepareRow: (row, indexColumn, indexRow, rectRow) => {
      doc.font("Helvetica").fontSize(8);
    },
  });
  doc.moveDown(2);

  doc.fontSize(19).fill("black").text("Next Title");

  doc.moveDown(1);

  //@ts-ignore
  await doc.table(table, {
    hideHeader: true,
    x: 40,
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
    prepareRow: (row, indexColumn, indexRow, rectRow) => {
      doc.font("Helvetica").fontSize(8);
    },
  });

  return doc;
};
