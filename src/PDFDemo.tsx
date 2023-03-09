import { Buffer } from "buffer";
import PDFTableDocument from "pdfkit-table";
import { useLayoutEffect, useRef } from "react";
import testImageUrl from "./lazy-assets/test.jpeg";
import { createSimplePdf, createTablePdf } from "./createPdfs";

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

const createSimplePdfWeb = async (iframe: HTMLIFrameElement) => {
  const doc = await createSimplePdf(
    testImageUrl,
    fetchFile,
    (_doc) => _doc.registerFont("Roboto", "fonts/Roboto-Regular.ttf"),
    (_doc) => _doc.image("images/bee.png"),
    (_doc) =>
      _doc.image("images/test.jpeg", _doc.page.width - 160, 90, {
        width: 96,
        height: 36,
      })
  );
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

const createTablePdfWeb = async (iframe: HTMLIFrameElement) => {
  const doc = await createTablePdf(
    testImageUrl,
    fetchFile,
    (_doc) => _doc.registerFont("Roboto", "fonts/Roboto-Regular.ttf"),
    (_doc) => _doc.image("images/bee.png"),
    (_doc) =>
      _doc.image("images/test.jpeg", _doc.page.width - 160, 90, {
        width: 96,
        height: 36,
      })
  );
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
      createSimplePdfWeb(pdfRootRef.current);
    }
    if (pdfTableRootRef.current) {
      createTablePdfWeb(pdfTableRootRef.current);
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
