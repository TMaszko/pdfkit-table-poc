import fs from "fs";
import { Buffer } from "buffer";
import PDFTableDocument from "pdfkit-table";
import { useLayoutEffect, useRef } from "react";
import testImageURL from "./lazy-assets/test.jpeg";

const fetchFile = (fileURL: string) => {
  return fetch(fileURL)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      return Buffer.from(arrayBuffer);
    });
};

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

const createSimplePdf = async (iframe: HTMLIFrameElement) => {
  await fetchFile(testImageURL)
    .then((testImageData) => {
      return fs.writeFileSync("images/test.jpg", testImageData);
    })
    .catch((error) => {
      console.error(error);
    });
  const doc = new PDFTableDocument();

  doc.registerFont("Roboto", "fonts/Roboto-Regular.ttf");

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

  doc
    .fontSize(25)
    .font("Courier")
    .text("And an image...")
    .image("images/bee.png");
  doc.font("Courier-Bold").moveDown(5).text("Finish...");

  doc.addPage();

  doc
    .font("Roboto")
    .fontSize(18)
    .text("Not yet. Lets try to show an image lazy loaded");

  try {
    doc.image("images/test.jpg");
  } catch (error) {
    doc.moveDown().text(`\${error}`);
    doc.text("Image not loaded. Try again later.");
  }
  waitForData(doc)
    .then((dataUrl) => {
      // display the document in the iframe to the right
      iframe.src = dataUrl;
    })
    .catch((error) => {
      console.log(error);
    });
  doc.end();
};

const createTablePdf = async (iframe: HTMLIFrameElement) => {
  const doc = new PDFTableDocument();
  const table = {
    title: "Title",
    subtitle: "Subtitle",
    headers: ["Country", "Conversion rate", "Trend"],
    rows: [
      ["Switzerland", "12%", "+1.12%"],
      ["France", "67%", "-0.98%"],
      ["England", "33%", "+4.44%"],
    ],
  };
  await doc.table(table, {
    columnsSize: [200, 100, 100],
  });
  waitForData(doc)
    .then((dataUrl) => {
      // display the document in the iframe to the right
      iframe.src = dataUrl;
    })
    .catch((error) => {
      console.log(error);
    });
  // done!
  doc.end();
};

export const PDFDemo = () => {
  const pdfRootRef = useRef<HTMLIFrameElement>(null);
  const pdfTableRootRef = useRef<HTMLIFrameElement>(null);

  useLayoutEffect(() => {
    if (pdfRootRef.current) {
      createSimplePdf(pdfRootRef.current);
    }
    if (pdfTableRootRef.current) {
      createTablePdf(pdfTableRootRef.current);
    }
  }, []);
  return (
    <>
      <iframe
        style={{ marginBottom: 20 }}
        width="600"
        height="775"
        title="pdf root"
        ref={pdfRootRef}
      />
      <iframe
        width="600"
        height="775"
        title="pdf table root"
        ref={pdfTableRootRef}
      />
    </>
  );
};
