// import * as pdfjs from "pdfjs-dist";

// export interface BoundingBox {
//     x: number;
//     y: number;
//     width: number;
//     height: number;
//     pageNumber: number;
//     text: string;
// }

// export interface ProcessedPDF {
//     text: string;
//     pages: number;
//     wordCoordinates: Record<string, BoundingBox[]>;
// }

// // Initialize pdfjs worker
// if (!pdfjs.GlobalWorkerOptions.workerSrc) {
//     pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//         "pdfjs-dist/build/pdf.worker.mjs",
//         import.meta.url
//     ).href;
// }

// interface QueryResponse {
//     response: string;
//     highlights: BoundingBox[];
//     targetPage?: number;
// }

// export const pdfService = {
//     async processPdf(file: File): Promise<ProcessedPDF> {
//         const formData = new FormData();
//         formData.append("pdf", file);

//         try {
//             // Load PDF to get page dimensions
//             const arrayBuffer = await file.arrayBuffer();
//             const pdfDocument = await pdfjs.getDocument({ data: arrayBuffer })
//                 .promise;

//             // Fetch OCR data from backend
//             const response = await fetch("http://localhost:3000/process-pdf", {
//                 method: "POST",
//                 body: formData,
//             });

//             if (!response.ok) {
//                 throw new Error("Failed to process PDF");
//             }

//             const ocrData = await response.json();

//             // Process OCR data into ProcessedPDF format
//             let fullText = "";
//             const wordCoordinates: Record<string, BoundingBox[]> = {};
//             const pages = ocrData.length;

//             for (let i = 0; i < pages; i++) {
//                 const pageNum = i + 1;
//                 const page = await pdfDocument.getPage(pageNum);
//                 const viewport = page.getViewport({ scale: 1.0 }); // Default scale

//                 const ocrPage = ocrData.find(
//                     (p: { page: number }) => p.page === pageNum
//                 );
//                 if (!ocrPage) continue;

//                 ocrPage.words.forEach(
//                     (word: { text: string; bbox: number[][] }) => {
//                         const cleanText = word.text.toLowerCase().trim();
//                         if (!cleanText) return;

//                         // Concatenate text for full document text
//                         fullText += word.text + " ";

//                         // Original OCR coordinates (from Tesseract)
//                         const ocrX = word.bbox[0][0];
//                         const ocrY = word.bbox[0][1];
//                         const ocrWidth = word.bbox[1][0] - word.bbox[0][0];
//                         const ocrHeight = word.bbox[2][1] - word.bbox[0][1];

//                         // Assume OCR image resolution (e.g., 300 DPI, adjust as needed)
//                         const ocrDpi = 300;
//                         const pdfDpi = 72; // PDF standard DPI
//                         const scaleFactor = pdfDpi / ocrDpi;

//                         // Transform coordinates to PDF viewport
//                         const x = ocrX * scaleFactor;
//                         const y =
//                             viewport.height - (ocrY + ocrHeight) * scaleFactor; // Flip Y-axis
//                         const width = ocrWidth * scaleFactor;
//                         const height = ocrHeight * scaleFactor;

//                         const boundingBox: BoundingBox = {
//                             x,
//                             y,
//                             width,
//                             height,
//                             pageNumber: pageNum,
//                             text: word.text,
//                         };

//                         // Group by word (case-insensitive Após a transformação de coordenadas
//                         if (!wordCoordinates[cleanText]) {
//                             wordCoordinates[cleanText] = [];
//                         }
//                         wordCoordinates[cleanText].push(boundingBox);
//                     }
//                 );
//             }

//             // Clean up
//             pdfDocument.destroy();

//             return {
//                 text: fullText.trim(),
//                 pages,
//                 wordCoordinates,
//             };
//         } catch (error) {
//             console.error("Error processing PDF:", error);
//             throw new Error("Failed to process PDF");
//         }
//     },

//     async queryDocument(
//         query: string,
//         processedDocument: ProcessedPDF
//     ): Promise<QueryResponse> {
//         const lowerQuery = query.toLowerCase().trim();
//         const words = lowerQuery.split(/\s+/);
//         let highlights: BoundingBox[] = [];
//         let response = "";
//         let targetPage = 1;

//         // Search for query words in the document
//         words.forEach((word) => {
//             const cleanWord = word.toLowerCase();
//             if (processedDocument.wordCoordinates[cleanWord]) {
//                 highlights = highlights.concat(
//                     processedDocument.wordCoordinates[cleanWord]
//                 );
//             }
//         });

//         // Sort highlights by page number to determine target page
//         if (highlights.length > 0) {
//             highlights.sort((a, b) => a.pageNumber - b.pageNumber);
//             targetPage = highlights[0].pageNumber;

//             // Generate response based on found words
//             const foundWords = [
//                 ...new Set(highlights.map((h) => h.text.toLowerCase())),
//             ];
//             response = `Found ${
//                 foundWords.length
//             } relevant term(s): ${foundWords.join(
//                 ", "
//             )}. The primary occurrence is on page ${targetPage}.`;
//         } else {
//             response =
//                 "No exact matches found for your query. Showing the first page of the document.";
//             // Show some context from the first page as a fallback
//             const firstPageWords = Object.values(
//                 processedDocument.wordCoordinates
//             )
//                 .flat()
//                 .filter((box) => box.pageNumber === 1)
//                 .slice(0, 5); // Limit to 5 highlights
//             highlights = firstPageWords;
//         }

//         return {
//             response,
//             highlights,
//             targetPage,
//         };
//     },
// };

// import * as pdfjs from "pdfjs-dist";

// export interface BoundingBox {
//     x: number;
//     y: number;
//     width: number;
//     height: number;
//     pageNumber: number;
//     text: string;
// }

// export interface ProcessedPDF {
//     text: string;
//     pages: number;
//     wordCoordinates: Record<string, BoundingBox[]>;
// }

// if (!pdfjs.GlobalWorkerOptions.workerSrc) {
//     pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//         "pdfjs-dist/build/pdf.worker.mjs",
//         import.meta.url
//     ).href;
// }

// interface QueryResponse {
//     response: string;
//     highlights: BoundingBox[];
//     targetPage?: number;
// }

// export const pdfService = {
//     async processPdf(file: File): Promise<ProcessedPDF> {
//         try {
//             const arrayBuffer = await file.arrayBuffer();
//             const pdfDocument = await pdfjs.getDocument({ data: arrayBuffer })
//                 .promise;

//             let fullText = "";
//             const wordCoordinates: Record<string, BoundingBox[]> = {};
//             const pages = pdfDocument.numPages;

//             for (let pageNum = 1; pageNum <= pages; pageNum++) {
//                 const page = await pdfDocument.getPage(pageNum);
//                 const viewport = page.getViewport({ scale: 1.0 });
//                 const textContent = await page.getTextContent();

//                 textContent.items.forEach((item: any) => {
//                     if (typeof item.str !== "string" || !item.str.trim())
//                         return;

//                     const cleanText = item.str.toLowerCase().trim();
//                     fullText += item.str + " ";

//                     const [x, y, width, height] = [
//                         item.transform[4], // x
//                         viewport.height - item.transform[5] - item.height, // y (flip Y-axis)
//                         item.width,
//                         item.height,
//                     ];

//                     const boundingBox: BoundingBox = {
//                         x,
//                         y,
//                         width,
//                         height,
//                         pageNumber: pageNum,
//                         text: item.str,
//                     };

//                     console.log(
//                         `Word: ${item.str}, Page: ${pageNum}, BBox:`,
//                         boundingBox
//                     );

//                     if (!wordCoordinates[cleanText]) {
//                         wordCoordinates[cleanText] = [];
//                     }
//                     console.log(boundingBox);
//                     wordCoordinates[cleanText].push(boundingBox);
//                 });
//             }

//             pdfDocument.destroy();

//             return {
//                 text: fullText.trim(),
//                 pages,
//                 wordCoordinates,
//             };
//         } catch (error) {
//             console.error("Error processing PDF:", error);
//             throw new Error("Failed to process PDF");
//         }
//     },

//     async queryDocument(
//         query: string,
//         processedDocument: ProcessedPDF
//     ): Promise<QueryResponse> {
//         const lowerQuery = query.toLowerCase().trim();
//         const words = lowerQuery.split(/\s+/);
//         let highlights: BoundingBox[] = [];
//         let response = "";
//         let targetPage = 1;

//         words.forEach((word) => {
//             const cleanWord = word.toLowerCase();
//             if (processedDocument.wordCoordinates[cleanWord]) {
//                 highlights = highlights.concat(
//                     processedDocument.wordCoordinates[cleanWord]
//                 );
//             }
//         });

//         if (highlights.length > 0) {
//             highlights.sort((a, b) => a.pageNumber - b.pageNumber);
//             targetPage = highlights[0].pageNumber;

//             const foundWords = [
//                 ...new Set(highlights.map((h) => h.text.toLowerCase())),
//             ];
//             response = `Found ${
//                 foundWords.length
//             } relevant term(s): ${foundWords.join(
//                 ", "
//             )}. The primary occurrence is on page ${targetPage}.`;
//         } else {
//             response =
//                 "No exact matches found for your query. Showing the first page of the document.";
//             const firstPageWords = Object.values(
//                 processedDocument.wordCoordinates
//             )
//                 .flat()
//                 .filter((box) => box.pageNumber === 1)
//                 .slice(0, 5);
//             highlights = firstPageWords;
//         }

//         return {
//             response,
//             highlights,
//             targetPage,
//         };
//     },
// };
// import * as pdfjs from "pdfjs-dist";

// export interface BoundingBox {
//     x: number;
//     y: number;
//     width: number;
//     height: number;
//     pageNumber: number;
//     text: string;
//     insights?: { explanation: string; relevance: string };
// }

// export interface ProcessedPDF {
//     text: string;
//     pages: number;
//     wordCoordinates: Record<string, BoundingBox[]>;
// }

// if (!pdfjs.GlobalWorkerOptions.workerSrc) {
//     pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//         "pdfjs-dist/build/pdf.worker.mjs",
//         import.meta.url
//     ).href;
// }

// interface QueryResponse {
//     response: string;
//     highlights: BoundingBox[];
//     targetPage?: number;
// }

// interface OCRWord {
//     text: string;
//     bbox: number[][];
// }

// interface OCRPage {
//     page: number;
//     words: OCRWord[];
// }

// export const pdfService = {
//     async processPdf(file: File): Promise<ProcessedPDF> {
//         try {
//             const formData = new FormData();
//             formData.append("pdf", file);
//             const response = await fetch("http://localhost:3000/process-pdf", {
//                 method: "POST",
//                 body: formData,
//             });

//             if (!response.ok) {
//                 throw new Error("Failed to process PDF");
//             }

//             const ocrData: OCRPage[] = await response.json();
//             let fullText = "";
//             const wordCoordinates: Record<string, BoundingBox[]> = {};
//             const pages = ocrData.length;

//             ocrData.forEach((page) => {
//                 page.words.forEach((word) => {
//                     if (!word.text.trim()) return;

//                     const cleanText = word.text.toLowerCase().trim();
//                     fullText += word.text + " ";

//                     const [[x1, y1], [x2, _1], [_2, y3], [_3, _4]] = word.bbox;
//                     const boundingBox: BoundingBox = {
//                         x: x1,
//                         y: y1,
//                         width: x2 - x1,
//                         height: y3 - y1,
//                         pageNumber: page.page,
//                         text: word.text,
//                     };

//                     console.log(
//                         `Word: ${word.text}, Page: ${page.page}, BBox:`,
//                         boundingBox
//                     );

//                     if (!wordCoordinates[cleanText]) {
//                         wordCoordinates[cleanText] = [];
//                     }
//                     wordCoordinates[cleanText].push(boundingBox);
//                 });
//             });

//             return {
//                 text: fullText.trim(),
//                 pages,
//                 wordCoordinates,
//             };
//         } catch (error) {
//             console.error("Error processing PDF:", error);
//             throw new Error("Failed to process PDF");
//         }
//     },

//     async queryDocument(
//         query: string,
//         processedDocument: ProcessedPDF
//     ): Promise<QueryResponse> {
//         const lowerQuery = query.toLowerCase().trim();
//         const words = lowerQuery.split(/\s+/);
//         let highlights: BoundingBox[] = [];
//         let response = "";
//         let targetPage = 1;

//         words.forEach((word) => {
//             const cleanWord = word.toLowerCase();
//             if (processedDocument.wordCoordinates[cleanWord]) {
//                 highlights = highlights.concat(
//                     processedDocument.wordCoordinates[cleanWord]
//                 );
//             }
//         });

//         if (highlights.length > 0) {
//             highlights.sort((a, b) => a.pageNumber - b.pageNumber);
//             targetPage = highlights[0].pageNumber;

//             const foundWords = [
//                 ...new Set(highlights.map((h) => h.text.toLowerCase())),
//             ];
//             response = `Found ${
//                 foundWords.length
//             } relevant term(s): ${foundWords.join(
//                 ", "
//             )}. The primary occurrence is on page ${targetPage}.`;
//         } else {
//             response =
//                 "No exact matches found for your query. Showing the first page of the document.";
//             const firstPageWords = Object.values(
//                 processedDocument.wordCoordinates
//             )
//                 .flat()
//                 .filter((box) => box.pageNumber === 1)
//                 .slice(0, 5);
//             highlights = firstPageWords;
//         }

//         if (highlights.length > 0) {
//             const context = highlights.map((h) => h.text).join(" ");
//             try {
//                 const sonarResponse = await fetch(
//                     "http://localhost:8000/api/query",
//                     {
//                         method: "POST",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify({
//                             query,
//                             pdf_id: "processed_pdf",
//                             context_window: 5,
//                         }),
//                     }
//                 );
//                 const sonarData = await sonarResponse.json();
//                 highlights = highlights.map((h, i) => ({
//                     ...h,
//                     insights: sonarData[i]?.insights,
//                 }));
//             } catch (error) {
//                 console.error("Error fetching Sonar insights:", error);
//             }
//         }

//         return {
//             response,
//             highlights,
//             targetPage,
//         };
//     },
// };

// import * as pdfjs from "pdfjs-dist";

// export interface BoundingBox {
//     x: number;
//     y: number;
//     width: number;
//     height: number;
//     pageNumber: number;
//     text: string;
//     insights?: { explanation: string; relevance: string };
// }

// export interface ProcessedPDF {
//     text: string;
//     pages: number;
//     wordCoordinates: Record<string, BoundingBox[]>;
// }

// if (!pdfjs.GlobalWorkerOptions.workerSrc) {
//     pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//         "pdfjs-dist/build/pdf.worker.mjs",
//         import.meta.url
//     ).href;
// }

// interface QueryResponse {
//     response: string;
//     highlights: BoundingBox[];
//     targetPage?: number;
// }

// interface OCRWord {
//     text: string;
//     bbox: number[][];
//     y_flipped?: number;
// }

// interface OCRPage {
//     page: number;
//     page_width: number;
//     page_height: number;
//     dpi: number;
//     words: OCRWord[];
// }

// export const pdfService = {
//     async processPdf(file: File): Promise<ProcessedPDF> {
//         try {
//             const arrayBuffer = await file.arrayBuffer();
//             const pdfDocument = await pdfjs.getDocument({ data: arrayBuffer })
//                 .promise;

//             const formData = new FormData();
//             formData.append("pdf", file);
//             const response = await fetch("http://localhost:3000/process-pdf", {
//                 method: "POST",
//                 body: formData,
//             });

//             if (!response.ok) {
//                 throw new Error("Failed to process PDF");
//             }

//             const ocrData: OCRPage[] = await response.json();
//             let fullText = "";
//             const wordCoordinates: Record<string, BoundingBox[]> = {};
//             const pages = ocrData.length;

//             for (let i = 0; i < pages; i++) {
//                 const pageNum = i + 1;
//                 const ocrPage = ocrData.find((p) => p.page === pageNum);
//                 if (!ocrPage) continue;

//                 const page = await pdfDocument.getPage(pageNum);
//                 const viewport = page.getViewport({ scale: 1.0 });
//                 const pdfWidth = viewport.width;
//                 const pdfHeight = viewport.height;

//                 const ocrDpi = ocrPage.dpi || 300;
//                 const scaleFactor = 72 / ocrDpi;

//                 ocrPage.words.forEach((word) => {
//                     if (!word.text.trim()) return;

//                     const cleanText = word.text.toLowerCase().trim();
//                     fullText += word.text + " ";

//                     const [[x1, y1], [x2, _1], [_2, y3], [_3, _4]] = word.bbox;
//                     const ocrWidth = x2 - x1;
//                     const ocrHeight = y3 - y1;

//                     const x = x1 * scaleFactor;
//                     const y = pdfHeight - y3 * scaleFactor;
//                     const width = ocrWidth * scaleFactor;
//                     const height = ocrHeight * scaleFactor;

//                     const boundingBox: BoundingBox = {
//                         x,
//                         y,
//                         width,
//                         height,
//                         pageNumber: pageNum,
//                         text: word.text,
//                     };

//                     console.log(
//                         `Word: ${word.text}, Page: ${pageNum}, BBox:`,
//                         boundingBox
//                     );

//                     if (!wordCoordinates[cleanText]) {
//                         wordCoordinates[cleanText] = [];
//                     }
//                     wordCoordinates[cleanText].push(boundingBox);
//                 });
//             }

//             pdfDocument.destroy();

//             return {
//                 text: fullText.trim(),
//                 pages,
//                 wordCoordinates,
//             };
//         } catch (error) {
//             console.error("Error processing PDF:", error);
//             throw new Error("Failed to process PDF");
//         }
//     },

//     async queryDocument(
//         query: string,
//         processedDocument: ProcessedPDF
//     ): Promise<QueryResponse> {
//         const lowerQuery = query.toLowerCase().trim();
//         const words = lowerQuery.split(/\s+/);
//         let highlights: BoundingBox[] = [];
//         let response = "";
//         let targetPage = 1;

//         words.forEach((word) => {
//             const cleanWord = word.toLowerCase();
//             if (processedDocument.wordCoordinates[cleanWord]) {
//                 highlights = highlights.concat(
//                     processedDocument.wordCoordinates[cleanWord]
//                 );
//             }
//         });

//         if (highlights.length > 0) {
//             highlights.sort((a, b) => a.pageNumber - b.pageNumber);
//             targetPage = highlights[0].pageNumber;

//             const foundWords = [
//                 ...new Set(highlights.map((h) => h.text.toLowerCase())),
//             ];
//             response = `Found ${
//                 foundWords.length
//             } relevant term(s): ${foundWords.join(
//                 ", "
//             )}. The primary occurrence is on page ${targetPage}.`;
//         } else {
//             response =
//                 "No exact matches found for your query. Showing the first page of the document.";
//             const firstPageWords = Object.values(
//                 processedDocument.wordCoordinates
//             )
//                 .flat()
//                 .filter((box) => box.pageNumber === 1)
//                 .slice(0, 5);
//             highlights = firstPageWords;
//         }

//         if (highlights.length > 0) {
//             const context = highlights.map((h) => h.text).join(" ");
//             try {
//                 const sonarResponse = await fetch(
//                     "http://localhost:8000/api/query",
//                     {
//                         method: "POST",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify({
//                             query,
//                             pdf_id: "processed_pdf",
//                             context_window: 5,
//                         }),
//                     }
//                 );
//                 const sonarData = await sonarResponse.json();
//                 highlights = highlights.map((h, i) => ({
//                     ...h,
//                     insights: sonarData[i]?.insights,
//                 }));
//             } catch (error) {
//                 console.error("Error fetching Sonar insights:", error);
//             }
//         }

//         return {
//             response,
//             highlights,
//             targetPage,
//         };
//     },
// };
import * as pdfjs from "pdfjs-dist";

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
    pageNumber: number;
    text: string;
    insights?: { explanation: string; relevance: string };
}

export interface ProcessedPDF {
    text: string;
    pages: number;
    wordCoordinates: Record<string, BoundingBox[]>;
}

if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.mjs",
        import.meta.url
    ).href;
}

interface QueryResponse {
    response: string;
    highlights: BoundingBox[];
    targetPage?: number;
}

interface OCRWord {
    text: string;
    bbox: number[][];
    y_flipped?: number;
}

interface OCRPage {
    page: number;
    page_width: number;
    page_height: number;
    dpi: number;
    words: OCRWord[];
}

export const pdfService = {
    // async processPdf(file: File): Promise<ProcessedPDF> {
    //     try {
    //         // Load PDF to get page dimensions
    //         const arrayBuffer = await file.arrayBuffer();
    //         const pdfDocument = await pdfjs.getDocument({ data: arrayBuffer })
    //             .promise;

    //         // Upload PDF to backend
    //         const formData = new FormData();
    //         formData.append("pdf", file);
    //         const response = await fetch("http://localhost:3000/process-pdf", {
    //             method: "POST",
    //             body: formData,
    //         });

    //         if (!response.ok) {
    //             throw new Error("Failed to process PDF");
    //         }

    //         const ocrData: OCRPage[] = await response.json();
    //         let fullText = "";
    //         const wordCoordinates: Record<string, BoundingBox[]> = {};
    //         const pages = ocrData.length;

    //         for (let i = 0; i < pages; i++) {
    //             const pageNum = i + 1;
    //             const ocrPage = ocrData.find((p) => p.page === pageNum);
    //             if (!ocrPage) continue;

    //             // Get PDF page dimensions
    //             const page = await pdfDocument.getPage(pageNum);
    //             const viewport = page.getViewport({ scale: 1.0 });
    //             const pdfWidth = viewport.width; // In points (72 DPI)
    //             const pdfHeight = viewport.height;

    //             // Compute scaling factor: OCR pixels to PDF points
    //             const ocrDpi = ocrPage.dpi || 300;
    //             const scaleFactor = 72 / ocrDpi;

    //             ocrPage.words.forEach((word) => {
    //                 if (!word.text.trim()) return;

    //                 const cleanText = word.text.toLowerCase().trim();
    //                 fullText += word.text + " ";

    //                 // Extract OCR coordinates
    //                 const [[x1, y1], [x2, _1], [_2, y3], [_3, _4]] = word.bbox;
    //                 const ocrWidth = x2 - x1;
    //                 const ocrHeight = y3 - y1;

    //                 // Transform to PDF coordinates
    //                 const x = x1 * scaleFactor;
    //                 const y = y3 * scaleFactor;
    //                 const width = ocrWidth * scaleFactor;
    //                 const height = ocrHeight * scaleFactor;

    //                 // Clamp coordinates to page bounds
    //                 const boundingBox: BoundingBox = {
    //                     x: Math.max(0, Math.min(x, pdfWidth)),
    //                     y: Math.max(0, Math.min(y, pdfHeight)),
    //                     width: Math.max(0, Math.min(width, pdfWidth - x)),
    //                     height: Math.max(0, Math.min(height, pdfHeight - y)),
    //                     pageNumber: pageNum,
    //                     text: word.text,
    //                 };

    //                 console.log(
    //                     `Word: ${word.text}, Page: ${pageNum}, BBox:`,
    //                     boundingBox
    //                 );

    //                 if (!wordCoordinates[cleanText]) {
    //                     wordCoordinates[cleanText] = [];
    //                 }
    //                 wordCoordinates[cleanText].push(boundingBox);
    //             });
    //         }

    //         pdfDocument.destroy();

    //         return {
    //             text: fullText.trim(),
    //             pages,
    //             wordCoordinates,
    //         };
    //     } catch (error) {
    //         console.error("Error processing PDF:", error);
    //         throw new Error("Failed to process PDF");
    //     }
    // },
    //   async processPdf(file: File): Promise<ProcessedPDF> {
    //   try {
    //       // Load PDF to get page dimensions
    //       const arrayBuffer = await file.arrayBuffer();
    //       const pdfDocument = await pdfjs.getDocument({ data: arrayBuffer }).promise;

    //       // Upload PDF to backend
    //       const formData = new FormData();
    //       formData.append("pdf", file);
    //       const response = await fetch("http://localhost:3000/process-pdf", {
    //           method: "POST",
    //           body: formData,
    //       });

    //       if (!response.ok) {
    //           throw new Error("Failed to process PDF");
    //       }

    //       const ocrData: OCRPage[] = await response.json();
    //       let fullText = "";
    //       const wordCoordinates: Record<string, BoundingBox[]> = {};
    //       const pages = ocrData.length;

    //       for (let i = 0; i < pages; i++) {
    //           const pageNum = i + 1;
    //           const ocrPage = ocrData.find((p) => p.page === pageNum);
    //           if (!ocrPage) continue;

    //           // Get PDF page dimensions
    //           const page = await pdfDocument.getPage(pageNum);
    //           const viewport = page.getViewport({ scale: 1.0 });
    //           const pdfWidth = viewport.width; // In points (72 DPI)
    //           const pdfHeight = viewport.height;

    //           // Compute scaling factor: OCR pixels to PDF points
    //           const ocrDpi = ocrPage.dpi || 300;
    //           const scaleFactor = 72 / ocrDpi;

    //           ocrPage.words.forEach((word) => {
    //               if (!word.text.trim()) return;

    //               const cleanText = word.text.toLowerCase().trim();
    //               fullText += word.text + " ";

    //               // Extract OCR coordinates
    //               const [[x1, y1], [x2, _1], [_2, y3], [_3, _4]] = word.bbox;
    //               const ocrWidth = x2 - x1;
    //               const ocrHeight = y3 - y1;

    //               // Transform to PDF coordinates, using top of text (y1)
    //               const x = x1 * scaleFactor;
    //               const y = pdfHeight - (y1 * scaleFactor); // Flip Y using y1 (top)
    //               const width = ocrWidth * scaleFactor;
    //               const height = ocrHeight * scaleFactor;

    //               // Clamp coordinates to page bounds
    //               const boundingBox: BoundingBox = {
    //                   x: Math.max(0, Math.min(x, pdfWidth)),
    //                   y: Math.max(0, Math.min(y, pdfHeight)),
    //                   width: Math.max(0, Math.min(width, pdfWidth - x)),
    //                   height: Math.max(0, Math.min(height, pdfHeight - y)),
    //                   pageNumber: pageNum,
    //                   text: word.text,
    //               };

    //               console.log(
    //                   `Word: ${word.text}, Page: ${pageNum}, BBox:`,
    //                   boundingBox
    //               );

    //               if (!wordCoordinates[cleanText]) {
    //                   wordCoordinates[cleanText] = [];
    //               }
    //               wordCoordinates[cleanText].push(boundingBox);
    //           });
    //       }

    //       pdfDocument.destroy();

    //       return {
    //           text: fullText.trim(),
    //           pages,
    //           wordCoordinates,
    //       };
    //   } catch (error) {
    //       console.error("Error processing PDF:", error);
    //       throw new Error("Failed to process PDF");
    //   }
    // },
    async processPdf(file: File): Promise<ProcessedPDF> {
        try {
            // Load PDF to get page dimensions
            const arrayBuffer = await file.arrayBuffer();
            const pdfDocument = await pdfjs.getDocument({ data: arrayBuffer })
                .promise;

            // Upload PDF to backend
            const formData = new FormData();
            formData.append("pdf", file);
            const response = await fetch("http://localhost:3000/process-pdf", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to process PDF");
            }

            const ocrData: OCRPage[] = await response.json();
            let fullText = "";
            const wordCoordinates: Record<string, BoundingBox[]> = {};
            const pages = ocrData.length;

            for (let i = 0; i < pages; i++) {
                const pageNum = i + 1;
                const ocrPage = ocrData.find((p) => p.page === pageNum);
                if (!ocrPage) continue;

                // Get PDF page dimensions
                const page = await pdfDocument.getPage(pageNum);
                const viewport = page.getViewport({ scale: 1.0 });
                const pdfWidth = viewport.width; // In points (72 DPI)
                const pdfHeight = viewport.height;

                // Compute scaling factor: OCR pixels to PDF points
                const ocrDpi = ocrPage.dpi || 300;
                const scaleFactor = 72 / ocrDpi;

                ocrPage.words.forEach((word) => {
                    if (!word.text.trim()) return;

                    const cleanText = word.text.toLowerCase().trim();
                    fullText += word.text + " ";

                    // Extract OCR coordinates
                    const [[x1, y1], [x2, _1], [_2, y3], [_3, _4]] = word.bbox;
                    const ocrWidth = x2 - x1;
                    const ocrHeight = y3 - y1;

                    // Transform to PDF coordinates, using top-left origin
                    const x = x1 * scaleFactor;
                    const y = y1 * scaleFactor; // Use y1 directly, no flip needed
                    const width = ocrWidth * scaleFactor;
                    const height = ocrHeight * scaleFactor;

                    // Clamp coordinates to page bounds
                    const boundingBox: BoundingBox = {
                        x: Math.max(0, Math.min(x, pdfWidth)),
                        y: Math.max(0, Math.min(y, pdfHeight)),
                        width: Math.max(0, Math.min(width, pdfWidth - x)),
                        height: Math.max(0, Math.min(height, pdfHeight - y)),
                        pageNumber: pageNum,
                        text: word.text,
                    };

                    console.log(
                        `Word: ${word.text}, Page: ${pageNum}, BBox:`,
                        boundingBox
                    );

                    if (!wordCoordinates[cleanText]) {
                        wordCoordinates[cleanText] = [];
                    }
                    wordCoordinates[cleanText].push(boundingBox);
                });
            }

            pdfDocument.destroy();

            return {
                text: fullText.trim(),
                pages,
                wordCoordinates,
            };
        } catch (error) {
            console.error("Error processing PDF:", error);
            throw new Error("Failed to process PDF");
        }
    },

    async queryDocument(
        query: string,
        processedDocument: ProcessedPDF
    ): Promise<QueryResponse> {
        const lowerQuery = query.toLowerCase().trim();
        const words = lowerQuery.split(/\s+/);
        let highlights: BoundingBox[] = [];
        let response = "";
        let targetPage = 1;

        words.forEach((word) => {
            const cleanWord = word.toLowerCase();
            if (processedDocument.wordCoordinates[cleanWord]) {
                highlights = highlights.concat(
                    processedDocument.wordCoordinates[cleanWord]
                );
            }
        });

        if (highlights.length > 0) {
            highlights.sort((a, b) => a.pageNumber - b.pageNumber);
            targetPage = highlights[0].pageNumber;

            const foundWords = [
                ...new Set(highlights.map((h) => h.text.toLowerCase())),
            ];
            response = `Found ${
                foundWords.length
            } relevant term(s): ${foundWords.join(
                ", "
            )}. The primary occurrence is on page ${targetPage}.`;
        } else {
            response =
                "No exact matches found for your query. Showing the first page of the document.";
            const firstPageWords = Object.values(
                processedDocument.wordCoordinates
            )
                .flat()
                .filter((box) => box.pageNumber === 1)
                .slice(0, 5);
            highlights = firstPageWords;
        }

        // Optional: Integrate Perplexity Sonar API for insights
        if (highlights.length > 0) {
            const context = highlights.map((h) => h.text).join(" ");
            try {
                const sonarResponse = await fetch(
                    "http://localhost:8000/api/query",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            query,
                            pdf_id: "processed_pdf",
                            context_window: 5,
                        }),
                    }
                );
                const sonarData = await sonarResponse.json();
                highlights = highlights.map((h, i) => ({
                    ...h,
                    insights: sonarData[i]?.insights,
                }));
            } catch (error) {
                console.error("Error fetching Sonar insights:", error);
            }
        }

        return {
            response,
            highlights,
            targetPage,
        };
    },
};
