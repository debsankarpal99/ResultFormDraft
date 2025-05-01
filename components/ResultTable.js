import React from 'react';
import { saveAs } from 'file-saver';

const ResultTable = ({ scores }) => {
  if (!scores || Object.keys(scores).length === 0) return null;

  const handleDownloadCSV = () => {
    let csv = "Topic,Score (%)\n";
    
    Object.entries(scores).forEach(([topic, score]) => {
      const scoreValue = score !== null ? score.toFixed(1) : 'N/A';
      csv += `"${topic}",${scoreValue}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'exam_scores.csv');
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
        <span className="mr-2">📊</span>
        Analysis Results
      </h2>
      
      <div className="overflow-hidden rounded-lg shadow">
        <table className="result-table">
          <thead>
            <tr>
              <th className="py-3 px-4">Topic</th>
              <th className="py-3 px-4 text-right">Score (%)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(scores).map(([topic, score], index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="py-3 px-4 font-medium">{topic}</td>
                <td className="py-3 px-4 text-right">
                  {score !== null ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${score >= 70 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {score.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-gray-500">Not detected</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          onClick={handleDownloadCSV}
        >
          <span className="mr-2">📥</span>
          Download as CSV
        </button>
      </div>
    </div>
  );
};

export default ResultTable;
