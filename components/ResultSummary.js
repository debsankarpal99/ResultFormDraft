import React from 'react';

const ResultSummary = ({ summary }) => {
  if (!summary) return null;
  
  const rows = [
    { label: 'Exam', value: summary.exam || '-', emoji: '📝' },
    { 
      label: 'Result', 
      value: summary.result || '-',
      emoji: summary.result === 'Passed' ? '✅' : '🔄',
      highlight: summary.result === 'Passed'
    },
    { label: 'Your Score', value: summary.score || '-', emoji: '📊' },
    { label: 'Minimum Passing Score (MPS)', value: summary.mps || '-', emoji: '🎯' },
  ];
  
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
        <span className="mr-2">📋</span>
        Exam Summary
      </h2>
      
      <div className="overflow-hidden rounded-lg shadow">
        <table className="result-table">
          <thead>
            <tr>
              <th className="py-3 px-4" width="50%">Category</th>
              <th className="py-3 px-4">Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr 
                key={row.label} 
                className={`${index % 2 === 0 ? 'bg-gray-50' : ''} ${row.highlight ? 'border-l-4 border-green-500' : ''}`}
              >
                <td className="py-3 px-4 font-medium">
                  <div className="flex items-center">
                    <span className="mr-2">{row.emoji}</span>
                    {row.label}
                  </div>
                </td>
                <td className="py-3 px-4">
                  {row.highlight ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {row.value}
                    </span>
                  ) : (
                    <span className="font-medium">{row.value}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultSummary; 