
import React, { useState, useCallback } from 'react';
import { Cloud, FileUp, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    
    if (file && file.type === 'application/pdf') {
      handleFile(file);
    } else {
      toast.error('Please upload a PDF file');
    }
  }, []);
  
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.type === 'application/pdf') {
        handleFile(file);
      } else {
        toast.error('Please upload a PDF file');
      }
    }
  }, []);
  
  const handleFile = (file: File) => {
    setIsUploading(true);
    
    // Simulate processing time
    setTimeout(() => {
      onFileUpload(file);
      setIsUploading(false);
      toast.success(`${file.name} uploaded successfully`);
    }, 1000);
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors
        ${isDragging ? 'border-primary bg-blue-50' : 'border-gray-300'}
        ${isUploading ? 'opacity-70 cursor-wait' : 'cursor-pointer'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ minHeight: '250px' }}
    >
      {isUploading ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin">
            <Cloud className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm text-gray-500">Processing PDF...</p>
        </div>
      ) : (
        <>
          <FileUp className="h-10 w-10 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload PDF Document</h3>
          <p className="text-sm text-gray-500 mb-4 text-center">
            Drag & drop your PDF here, or click to select file
          </p>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileInput}
            accept="application/pdf"
            disabled={isUploading}
          />
          <label htmlFor="file-upload">
            <Button 
              variant="outline"
              className="cursor-pointer"
              disabled={isUploading}
              aria-label="Select PDF file"
            >
              <File className="h-4 w-4 mr-2" />
              Select PDF
            </Button>
          </label>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Maximum file size: 50MB
          </p>
        </>
      )}
    </div>
  );
};

export default FileUpload;
