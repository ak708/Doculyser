import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as pdfjs from "pdfjs-dist";

interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
    pageNumber: number;
    text: string;
}

interface PDFViewerProps {
    file: File | null;
    currentHighlights: BoundingBox[];
    targetPageNumber?: number;
}

const initPdfWorker = () => {
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            "pdfjs-dist/build/pdf.worker.mjs",
            import.meta.url
        ).href;
    }
};

const PDFViewer: React.FC<PDFViewerProps> = ({
    file,
    currentHighlights = [],
    targetPageNumber,
}) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [pdfDocument, setPdfDocument] =
        useState<pdfjs.PDFDocumentProxy | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        initPdfWorker();
    }, []);

    useEffect(() => {
        if (!file) return;

        setIsLoading(true);

        const loadPDF = async () => {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
                const document = await loadingTask.promise;

                setPdfDocument(document);
                setNumPages(document.numPages);
                setCurrentPage(1);
                setIsLoading(false);
            } catch (error) {
                console.error("Error loading PDF:", error);
                setIsLoading(false);
            }
        };

        loadPDF();
    }, [file]);

    useEffect(() => {
        if (
            targetPageNumber &&
            targetPageNumber !== currentPage &&
            targetPageNumber <= numPages
        ) {
            setCurrentPage(targetPageNumber);
        }
    }, [targetPageNumber, numPages, currentPage]);

    useEffect(() => {
        if (!pdfDocument || !canvasRef.current) return;

        const renderPage = async () => {
            try {
                const page = await pdfDocument.getPage(currentPage);
                const viewport = page.getViewport({ scale });

                const canvas = canvasRef.current as HTMLCanvasElement;
                const context = canvas.getContext("2d");

                if (!context) return;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                }).promise;

                // Log viewport and bounding boxes for debugging
                console.log(`Page ${currentPage} viewport:`, {
                    width: viewport.width,
                    height: viewport.height,
                    scale,
                });
                console.log(
                    `Highlights for page ${currentPage}:`,
                    currentHighlights.filter(
                        (h) => h.pageNumber === currentPage
                    )
                );
            } catch (error) {
                console.error("Error rendering PDF page:", error);
            }
        };

        renderPage();
    }, [pdfDocument, currentPage, scale, currentHighlights]);

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < numPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + 0.25, 3.0));
    };

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - 0.25, 0.5));
    };

    return (
        <div className="flex flex-col h-full w-full" ref={containerRef}>
            <div className="flex justify-between items-center p-2 bg-white border-b">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleZoomOut}
                        disabled={scale <= 0.5 || !pdfDocument}
                        aria-label="Zoom out"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">{Math.round(scale * 100)}%</span>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleZoomIn}
                        disabled={scale >= 3.0 || !pdfDocument}
                        aria-label="Zoom in"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePreviousPage}
                        disabled={currentPage <= 1 || !pdfDocument}
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="text-sm">
                        <span>{currentPage}</span>
                        <span className="mx-1">/</span>
                        <span>{numPages}</span>
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNextPage}
                        disabled={currentPage >= numPages || !pdfDocument}
                        aria-label="Next page"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-gray-100 flex justify-center p-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="animate-spin mb-2">
                            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                        </div>
                        <p className="text-sm text-gray-500">Loading PDF...</p>
                    </div>
                ) : !file ? (
                    <div className="flex items-center justify-center h-full w-full">
                        <p className="text-gray-400">No PDF uploaded</p>
                    </div>
                ) : (
                    <div className="relative">
                        <canvas ref={canvasRef} className="shadow-lg"></canvas>
                        {currentHighlights
                            .filter(
                                (highlight) =>
                                    highlight.pageNumber === currentPage
                            )
                            .map((highlight, index) => (
                                <div
                                    key={`highlight-${index}`}
                                    className="absolute border-2 border-yellow-400 bg-yellow-200/30 hover:bg-yellow-200/50 transition-colors"
                                    style={{
                                        left: `${highlight.x * scale}px`,
                                        top: `${highlight.y * scale}px`,
                                        width: `${highlight.width * scale}px`,
                                        height: `${highlight.height * scale}px`,
                                    }}
                                    title={highlight.text}
                                ></div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PDFViewer;
