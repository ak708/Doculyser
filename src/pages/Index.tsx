
import React, { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import PDFViewer from '@/components/PDFViewer';
import ChatInterface from '@/components/ChatInterface';
import { pdfService, ProcessedPDF, BoundingBox } from '@/services/pdfService';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [processedPdf, setProcessedPdf] = useState<ProcessedPDF | null>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [highlights, setHighlights] = useState<BoundingBox[]>([]);
  const [targetPage, setTargetPage] = useState<number>(1);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setPdfFile(file);
    setIsProcessingPdf(true);
    
    try {
      const processed = await pdfService.processPdf(file);
      setProcessedPdf(processed);
      toast({
        title: 'PDF Processed',
        description: `Successfully analyzed ${file.name}`,
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: 'Processing Error',
        description: 'Failed to analyze the PDF document',
        variant: 'destructive',
      });
      setPdfFile(null);
    } finally {
      setIsProcessingPdf(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!processedPdf) throw new Error('No PDF processed');
    
    const result = await pdfService.queryDocument(message, processedPdf);
    setHighlights(result.highlights);
    
    if (result.targetPage) {
      setTargetPage(result.targetPage);
    }
    
    return {
      response: result.response,
      highlights: result.highlights,
    };
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      <div className="p-4 bg-primary text-primary-foreground">
        <h1 className="text-xl font-bold">Document Insight Chat</h1>
      </div>
      
      <div className="flex flex-1 relative overflow-hidden">
        {/* Main content area */}
        <div className="flex flex-col md:flex-row w-full h-full">
          {/* Chat Interface */}
          <ChatInterface 
            onSendMessage={handleSendMessage}
            isProcessingPdf={isProcessingPdf}
            isPdfLoaded={!!processedPdf}
          />
          
          {/* PDF Area */}
          <div className="flex-1 h-full">
            {!pdfFile ? (
              <div className="h-full p-6">
                <FileUpload onFileUpload={handleFileUpload} />
              </div>
            ) : (
              <PDFViewer 
                file={pdfFile}
                currentHighlights={highlights}
                targetPageNumber={targetPage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
