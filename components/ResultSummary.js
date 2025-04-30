import React from 'react';

const ResultSummary = ({ summary }) => {
  if (!summary) return null;
  const rows = [
    { label: 'Exam', value: summary.exam || '-' },
    { label: 'Result', value: summary.result || '-' },
    { label: 'Your Score', value: summary.score || '-' },
    { label: 'Minimum Passing Score (MPS)', value: summary.mps || '-' },
  ];
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 border border-blue-100 max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-blue-900 mb-4">Exam Summary</h2>
      <table className="result-table">
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.label} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
              <td>{row.label}</td>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultSummary; 