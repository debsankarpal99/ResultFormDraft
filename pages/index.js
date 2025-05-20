import React, { useState } from 'react';
import Head from 'next/head';
import FileUpload from '../components/FileUpload';

import ResultSummary from '../components/ResultSummary';
import ResultTable from '../components/ResultTable';
import ResultTableFRM from '../components/ResultTableFRM';
import ScoreChart from '../components/ScoreChart';
import ResultMessage from '../components/ResultMessage';
import { analyzeExamScore } from '../lib/imageProcessing';
import { analyzeFRMResultText } from '../lib/frmTextProcessing';
import { sum } from 'pdf-lib';


export default function Home() {
  const [scores, setScores] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [debugImage, setDebugImage] = useState(null);
  const [summary, setSummary] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [CFALevel, setCFALevel] = useState(null);
  const handleSetSummary=(summary)=>{
    setSummary(summary);
    // console.log("summary is " , summary)
  }

  // the course list
  const courses = [
    { label: 'CFA', value: 'CFA', enabled: true },
    { label: 'FRM', value: 'FRM', enabled: true },
    // { label: 'CFA - Level 2 (Coming soon)', value: 'CFA - Level 2', enabled: false },
    // { label: 'CFA - Level 3 (Coming soon)', value: 'CFA - Level 3', enabled: false },
    // { label: 'FRM - Part 1 (Coming soon)', value: 'FRM - Part 1', enabled: false },
    // { label: 'FRM - Part 2 (Coming soon)', value: 'FRM - Part 2', enabled: false },
  ];

  // FileUpload output
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
      // console.log('DEBUG: handleFileProcessed received', data);


      // data: file, page1Image, page2Image
      setFileType(data.file.type);
      // If summary is available (from FileUpload), set it
      const level = data.summary.level;
      handleSetSummary(data.summary);
      
      
      
      
      
      
    
    

      let imageElement;
      if (data.file.type === 'application/pdf') {
        // console.log('DEBUG: About to analyze page2Image', data.page2Image);
        // Use page2Image for score analysis
        imageElement = await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = data.page2Image;
        });
        setProcessedImage(data.page2Image);
      } else if (data.file.type.startsWith('image/')) {
        // Use the single image (page2Image)
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

      // Analyzing the exam score with enhanced processing
      const { scores: scoreResults, debugImageUrl } = await analyzeExamScore(imageElement , level);
   
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
   const handleFileProcessedFRM = async (text) => {
    try {
      setIsProcessing(true);
      setError(null);
      setScores(null);
      const scoreResults = analyzeFRMResultText(text);
      setScores(scoreResults);
      setAnalysisComplete(true);
    } catch (err) {
      console.error('Error processing text:', err);
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
    <div className="min-h-screen bg-gradient-light">
      <Head>
        <title>Exam Score Analyzer | Aswini Bajaj Classes</title>
        <meta name="description" content="Analyze exam score charts from PDFs and images" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fira+Code&display=swap" rel="stylesheet" />
      </Head>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="app-header mb-8 pb-6 border-b border-gray-200">
          <div className="relative z-10">
            <h1 className="app-title">Analyzer Dashboard</h1>
            <p className="app-subtitle">Analyze your exam results with advanced score processing</p>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-10 right-32 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        </header>

        <main className="main-card p-8 mb-8">
          {!analysisComplete && (
            <div className="course-selector-container mb-20">
              <label className="block  text-xl font-semibold text-gray-700 m-7 ">
                Select Course
              </label>
              
              <div className="relative mb-8">
                <select
                  className="modern-select"
                  value={selectedCourse}
                  onChange={e => setSelectedCourse(e.target.value)}
                >
                  <option value="" disabled>Choose an exam to analyze</option>
                  {courses.map(course => (
                    <option 
                      key={course.value} 
                      value={course.value} 
                      disabled={!course.enabled}
                      className={!course.enabled ? "text-gray-400" : ""}
                    >
                      {course.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedCourse === 'CFA' && (
                <div className="mt-16 border-t border-gray-200 pt-8">
                  <FileUpload 
                    onFileProcessed={handleFileProcessed}
                    isProcessing={isProcessing}
                    examType="CFA"
                  />
                </div>
              )}
              {selectedCourse === 'FRM' && (
                <div className="mt-16 border-t border-gray-200 pt-8">
                  
                <FileUpload
              onFileProcessed={handleFileProcessedFRM}
              isProcessing={isProcessing}
              examType={"FRM"}
              />
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Error: {error}</p>
                </div>
              </div>
            </div>
          )}
          {
            analysisComplete && selectedCourse === "FRM" && scores && (
              <>
                            <ResultTableFRM scores={scores} />
                            <div className = "mt-12 flex justify-center">
                <button
                  className="btn-primary"
                  onClick={handleAnalyzeAgain}
                >
                  Analyze Another Result
                </button>
              </div>
                </>
            )
            

          }

          {analysisComplete && selectedCourse==="CFA" && (
            <div className="analysis-results">
              {summary && <ResultSummary summary={summary} />}
              
              <div className="glass-card mt-8">
                {scores && <ScoreChart scores={scores} />}
              </div>
              
              <div className="glass-card mt-8">
                {scores && <ResultTable scores={scores} />}
              </div>
              
              {summary && <ResultMessage result={summary.result} />}
              
              <div className="mt-12 flex justify-center">
                <button
                  className="btn-primary"
                  onClick={handleAnalyzeAgain}
                >
                  Analyze Another Result
                </button>
              </div>
            </div>
          )}
        </main>

        <footer className="footer">
          <p>Aswini Bajaj Classes &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}
