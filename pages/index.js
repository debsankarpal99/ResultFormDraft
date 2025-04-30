
import React, { useState } from 'react';
import Head from 'next/head';
import FileUpload from '../components/FileUpload';
import ResultSummary from '../components/ResultSummary';
import ResultTable from '../components/ResultTable';
import ScoreChart from '../components/ScoreChart';
import ResultMessage from '../components/ResultMessage';
import { analyzeExamScore } from '../lib/imageProcessing';

export default function Home() {
  const [scores, setScores] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [debugImage, setDebugImage] = useState(null);
  const [summary, setSummary] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // New: handle new FileUpload output
  const handleFileProcessed = async (data) => {
    try {
      setIsProcessing(true);
      setError(null);
      setScores(null);
      setDebugImage(null);
      setSummary(null);
      setFileType(null);
      setAnalysisComplete(false);

      // Debug log for received data
      console.log('DEBUG: handleFileProcessed received', data);

      // data: { file, page1Image, page2Image, ... }
      setFileType(data.file.type);
      // If summary is available (from FileUpload), set it
      if (data.summary) setSummary(data.summary);

      let imageElement;
      if (data.file.type === 'application/pdf') {
        console.log('DEBUG: About to analyze page2Image', data.page2Image);
        // Use page2Image for score analysis
        imageElement = await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = data.page2Image;
        });
        setProcessedImage(data.page2Image);
      } else if (data.file.type.startsWith('image/')) {
        // Use the single image
        imageElement = await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = data.page1Image;
        });
        setProcessedImage(data.page1Image);
      } else {
        throw new Error('Unsupported file type');
      }

      // Analyze the exam score with enhanced processing
      const { scores: scoreResults, debugImageUrl } = await analyzeExamScore(imageElement);
      console.log('DEBUG: Score analysis result', scoreResults);
      setScores(scoreResults);
      setDebugImage(debugImageUrl);
      setAnalysisComplete(true);
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err.message || 'Failed to process the file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnalyzeAgain = () => {
    setScores(null);
    setError(null);
    setIsProcessing(false);
    setProcessedImage(null);
    setDebugImage(null);
    setSummary(null);
    setFileType(null);
    setAnalysisComplete(false);
  };

  return (
    <div className="container">
      <Head>
        <title>Exam Score Analyzer</title>
        <meta name="description" content="Analyze exam score charts from PDFs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="text-3xl font-bold mb-4">CFA Exam Score Chart Analyzer</h1>
        <p className="mb-8">Upload an exam score chart image or PDF to analyze the scores by topic.</p>
        {/* Hide upload area after analysis is complete */}
        {!analysisComplete && (
          <FileUpload 
            onFileProcessed={handleFileProcessed}
            isProcessing={isProcessing}
          />
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error: </strong> {error}
          </div>
        )}
        {/* Always show summary and analysis after upload */}
        {analysisComplete && (
          <>
            {summary && <ResultSummary summary={summary} />}
            {scores && <ScoreChart scores={scores} />}
            {scores && <ResultTable scores={scores} />}
            {/* Show custom message below analysis results */}
            {summary && <ResultMessage result={summary.result} />}
            <div className="mt-8 flex justify-center">
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold"
                onClick={handleAnalyzeAgain}
              >
                Analyze again
              </button>
            </div>
          </>
        )}
      </main>
      <footer className="mt-12 pt-4 border-t text-center text-gray-500">
        <p>CFA Exam Score Analyzer &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
