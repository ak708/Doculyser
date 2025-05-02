
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
  text: string;
}

export interface ProcessedPDF {
  text: string;
  pages: number;
  wordCoordinates: Record<string, BoundingBox[]>;
}

interface QueryResponse {
  response: string;
  highlights: BoundingBox[];
  targetPage?: number;
}

// Mock service for PDF processing
export const pdfService = {
  async processPdf(file: File): Promise<ProcessedPDF> {
    // In a real implementation, this would extract text and coordinates from the PDF
    console.log(`Processing PDF: ${file.name}`);
    
    // Mock response - simulating PDF processing
    return new Promise((resolve) => {
      setTimeout(() => {
        // This would be generated from actual PDF content
        resolve({
          text: "This is the extracted text from the PDF",
          pages: 5,
          wordCoordinates: {
            "important": [
              { x: 100, y: 150, width: 80, height: 20, pageNumber: 1, text: "important" },
              { x: 200, y: 300, width: 80, height: 20, pageNumber: 3, text: "important" }
            ],
            "document": [
              { x: 150, y: 200, width: 90, height: 20, pageNumber: 1, text: "document" },
              { x: 250, y: 350, width: 90, height: 20, pageNumber: 2, text: "document" }
            ],
            "analysis": [
              { x: 180, y: 250, width: 70, height: 20, pageNumber: 2, text: "analysis" }
            ],
            "results": [
              { x: 120, y: 400, width: 60, height: 20, pageNumber: 4, text: "results" }
            ],
            "conclusion": [
              { x: 300, y: 450, width: 100, height: 20, pageNumber: 5, text: "conclusion" }
            ]
          }
        });
      }, 2000);
    });
  },

  async queryDocument(query: string, processedDocument: ProcessedPDF): Promise<QueryResponse> {
    console.log(`Processing query: "${query}" on document`);
    
    // Mock response generation
    // In a real implementation, this would use an LLM to analyze the query
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple keyword matching to simulate LLM processing
        const lowerQuery = query.toLowerCase();
        let response = '';
        let highlights: BoundingBox[] = [];
        let targetPage = 1;
        
        // Generate mock response based on query keywords
        if (lowerQuery.includes('important')) {
          response = 'There are several important points mentioned in the document. The key one is on page 3.';
          highlights = processedDocument.wordCoordinates['important'] || [];
          targetPage = 3;
        } 
        else if (lowerQuery.includes('analysis') || lowerQuery.includes('analyze')) {
          response = 'The document contains analysis on page 2 that discusses the methodology used.';
          highlights = processedDocument.wordCoordinates['analysis'] || [];
          targetPage = 2;
        }
        else if (lowerQuery.includes('result') || lowerQuery.includes('findings')) {
          response = 'The results are presented on page 4, showing the outcomes of the study.';
          highlights = processedDocument.wordCoordinates['results'] || [];
          targetPage = 4;
        }
        else if (lowerQuery.includes('conclusion') || lowerQuery.includes('summary')) {
          response = 'The conclusion on page 5 summarizes the key findings and implications.';
          highlights = processedDocument.wordCoordinates['conclusion'] || [];
          targetPage = 5;
        }
        else {
          response = 'The document is about a research study with findings spread across 5 pages. The introduction on page 1 provides context for the research.';
          highlights = [
            ...(processedDocument.wordCoordinates['document'] || []).slice(0, 1),
            ...(processedDocument.wordCoordinates['important'] || []).slice(0, 1)
          ];
          targetPage = 1;
        }
        
        resolve({
          response,
          highlights,
          targetPage
        });
      }, 1500);
    });
  }
};
