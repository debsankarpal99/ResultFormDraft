import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';
import ProgressBar from './ProgressBar';
import ResultSummary from './ResultSummary';

// Ensure PDF.js worker is configured
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Base dimension requirements
const BASE_WIDTH = 5100;
const BASE_HEIGHT = 3300;
const TOLERANCE_PERCENT = 5; // 5% tolerance

// Acceptable scale factors
const ACCEPTABLE_SCALE_FACTORS = [0.25, 0.5, 1, 1.5, 2];

const FileUpload = ({ onFileProcessed, isProcessing , examType }) => {
 
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [dimensionError, setDimensionError] = useState(null);
  const [dotsPhase, setDotsPhase] = useState(0);
  const [showAnalyzing, setShowAnalyzing] = useState(false);
  const [summary, setSummary] = useState(null);

  
  
  // Pre-render the analyzing dialog to prevent jitter
  const analyzingDialog = (
    <div className="tech-analyzing-container">
      {/* Glow effect */}
      <div className="glow-effect"></div>
      
      {/* Vertical bars animation */}
      <div className="vertical-bars-container">
        <div className="vertical-bar vertical-bar-1"></div>
        <div className="vertical-bar vertical-bar-2"></div>
        <div className="vertical-bar vertical-bar-3"></div>
      </div>
      
      {/* Analyzing text */}
      <div className="tech-analyzing-text">
        Analyzing<span className="tech-analyzing-dots">{'.'.repeat((dotsPhase % 3) + 1)}</span>
      </div>
      
      {/* Status text */}
      <div className="tech-info-text">
        Just a sec... Pulling out the numbers! 🔍
      </div>
    </div>
  );
  
  // When isProcessing changes, update animation state immediately
  useEffect(() => {
    if (isProcessing) {
      // Immediately show the analyzing overlay
      setShowAnalyzing(true);
    } else {
      // Add a small delay before hiding to ensure smooth transitions
      const hideTimer = setTimeout(() => {
        setShowAnalyzing(false);
      }, 300);
      return () => clearTimeout(hideTimer);
    }
  }, [isProcessing]);
  
  // Animation effects for the analyzing overlay
  useEffect(() => {
    if (!showAnalyzing) return;
    
    // Animate dots
    const dotsInterval = setInterval(() => {
      setDotsPhase(prev => (prev + 1) % 3);
    }, 300); // Make the dots animation faster
    
    return () => {
      clearInterval(dotsInterval);
    };
  }, [showAnalyzing]);

  const validateImageDimensions = (img) => {
    const tolerance = TOLERANCE_PERCENT / 100;
    
    // Check if dimensions match any of the acceptable scaled dimensions
    return ACCEPTABLE_SCALE_FACTORS.some(scale => {
      const targetWidth = BASE_WIDTH * scale;
      const targetHeight = BASE_HEIGHT * scale;
      
      const minWidth = targetWidth * (1 - tolerance);
      const maxWidth = targetWidth * (1 + tolerance);
      const minHeight = targetHeight * (1 - tolerance);
      const maxHeight = targetHeight * (1 + tolerance);
      
      return (img.width >= minWidth && img.width <= maxWidth && 
              img.height >= minHeight && img.height <= maxHeight);
    });
  };

  const getAcceptableDimensionsText = () => {
    return ACCEPTABLE_SCALE_FACTORS.map(scale => {
      return `${Math.round(BASE_WIDTH * scale)}×${Math.round(BASE_HEIGHT * scale)}`;
    }).join(', ');
  };
 const processPdfFRM = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const maxPages = pdf.numPages;
    let fullText = '';

    // Extract text from all pages (or relevant pages if the structure is consistent)
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map(item => item.str).join(' ') + '\n';
    }

    return fullText;
  };

  const processPdfCFA = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdf.numPages;
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();
    // console.log(textContent)


    let fullText = textContent.items.map(item => item.str).join(' ') + '\n';
    // console.log("full text is " , fullText)
    
    const summary = extractCFAResults(fullText)
    

    // Always try to get both pages if available
    const getPageImage = async (pageNum) => {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport: viewport }).promise;
      return canvas.toDataURL('image/png');
    };
    const page1Image = await getPageImage(1);
    let page2Image = null;
    if (pageCount >= 2) {
      page2Image = await getPageImage(2);
    }
    return { page1Image, page2Image, summary };
  };

  // Helper: Parse summary info from OCR text
  // const parseSummaryFromText = (text) => {
  //   // console.log('DEBUG - Raw OCR Text:', text);
    
  //   // Updated regex to match "Did Not Pass" instead of "Failed"
  //   const resultMatch = text.match(/Result[:\s]*(Passed|Did Not Pass)/i);
  //   const examMatch = text.match(/Exam[:\s]*([\w\s|]+CFA Exam)/i);
  //   const scoreMatch = text.match(/Your Score[:\s]*(\d+)/i);
  //   const mpsMatch = text.match(/Minimum Passing Score \(MPS\)[:\s]*(\d+)/i);
  //   return {
  //     exam: examMatch ? examMatch[1].trim() : '',
  //     result: resultMatch ? resultMatch[1].trim() : '',
  //     score: scoreMatch ? scoreMatch[1].trim() : '',
  //     mps: mpsMatch ? mpsMatch[1].trim() : '',
  //   };
  // };
  function extractCFAResults(text) {
  // Extract pass/fail result
 
  
  // Extract exam details
  const examMatch = text.match(/Exam:\s+([\d]{4}\s+[A-Za-z]+\s+Level\s+[I|II|III]+\s+CFA\s+Exam)/i);
  const examDetails = examMatch ? examMatch[1] : null;

  const match = examDetails.match(/Level\s+([I]{1,3}|\d)/i);

  let level = null;

if (match) {
  const value = match[1].toUpperCase();
  const romanToNumber = { I: 1, II: 2, III: 3 };

  level = romanToNumber[value] || parseInt(value);
}
  
  // Extract candidate's score
  const scoreMatch = text.match(/Your Score:\s+(\d+)/i);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
  
  // Extract minimum passing score
  const mpsMatch = text.match(/Minimum Passing Score \(MPS\)[:\s]*(\d+)/i);
  const minimumPassingScore = mpsMatch ? parseInt(mpsMatch[1]) : null;
  
  // Extract candidate name
  const nameMatch = text.match(/Name:\s+([^\n]+)/i);
  const name = nameMatch ? nameMatch[1].trim() : null;
  
  // Extract CFA ID
  const idMatch = text.match(/CFA Institute ID:\s+(\d+)/i);
  const cfaId = idMatch ? idMatch[1] : null;
  
  return {
    name,
    cfaId,
    examDetails,
    
    score,
    minimumPassingScore,
   
    level
  };
}

  // OCR and parse summary from page 1 image
  const extractSummaryFromImage = async (imageUrl) => {
    try {
      const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng', {
        tessjs_create_pdf: '0',
      });
      // console.log('OCR PAGE 1 TEXT:', text);
     
      return parseSummaryFromText(text);
    } catch (err) {
      return null;
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setFileName(file.name);
    setDimensionError(null);
    setUploadProgress(0);
    setSummary(null);
    
    // Start progress animation
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);
    
    try {
      let processedFile = file;
      
      // Show analyzing animation immediately when processing starts
      setShowAnalyzing(true);
      
      // Handle different file types
      if (file.type === 'application/pdf') {
        // For PDFs, extract both pages as images
        if(examType==="CFA")
        {
            const { page1Image, page2Image ,summary} = await processPdfCFA(file);
       
          // OCR page 1 for summary info
          // const summaryInfo = await extractSummaryFromImage(page1Image);
          setSummary(summary);
          // console.log(summary)
          // Debug log for page2Image
          // console.log('DEBUG: page2Image', page2Image);
          await onFileProcessed({
          file,
          page1Image,
          page2Image,
          summary ,

          
        });
      }
      let processedContent
      if(examType=="FRM")
       {
        // {  console.log("in FRM")
          processedContent = await processPdfFRM(file);
          // console.log(processedContent)
          await onFileProcessed(processedContent);
      }

     
        // Pass both images and summary to the next step (text extraction and score analysis)
        
      } else if (file.type.startsWith('image/')) {
        // For images, validate dimensions
        const fileUrl = URL.createObjectURL(file);
        const img = await new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = fileUrl;
        });
        
        if (!validateImageDimensions(img)) {
          throw new Error(`Image dimensions don't match any acceptable sizes. Your image is ${img.width}×${img.height} pixels. Acceptable dimensions (with ${TOLERANCE_PERCENT}% tolerance): ${getAcceptableDimensionsText()}`);
        }
        
        setSummary(null);
        // For single images, just pass as before
        await onFileProcessed({
          file,
          page1Image: fileUrl,
          page2Image: null
        });
      }
      
      // Process the file if dimensions are valid
      setUploadProgress(100);
      
      // Reset progress after a moment
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Error processing file:', error);
      setDimensionError(error.message);
      clearInterval(interval);
      setUploadProgress(0);
      setShowAnalyzing(false);
    }
  }, [onFileProcessed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <div className="file-upload">
      <div
        {...getRootProps()}
        className={`upload-container glass-card ${
          isDragActive ? "border-primary ring-2 ring-blue-200" : ""
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          <div className="text-2xl mb-3">
            📄
          </div>
          
          {isDragActive ? (
            <p className="text-xl font-medium text-blue-600">Drop the file here ...</p>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag & Drop your exam result PDF or image here
              </p>
              <p className="text-sm text-gray-500 mb-4">
                or click to select a file (PDF or JPG/PNG)
              </p>
              <button className="btn-primary mt-2">
                Select File
              </button>
            </>
          )}
        </div>
      </div>
      
      {fileName && !dimensionError && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg shadow-sm">
          <div className="flex items-center">
            <span className="mr-2">📋</span>
            <span className="text-blue-700 font-medium">{fileName}</span>
          </div>
          
          {uploadProgress > 0 && (
            <div className="mt-3">
              <ProgressBar progress={uploadProgress} />
            </div>
          )}
        </div>
      )}
      
      {dimensionError && (
        <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <p className="text-red-700">{dimensionError}</p>
        </div>
      )}
      
      {showAnalyzing && (
        <div className="analyzing-overlay">
          {analyzingDialog}
        </div>
      )}
      
      {summary && !isProcessing && !dimensionError && (
        <div className="mt-6 glass-card">
          <ResultSummary summary={summary} />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
