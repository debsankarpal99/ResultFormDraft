import React from 'react';
import { saveAs } from 'file-saver';

// Determine mastery based on percentile ranges or numeric scores
const getMastery = (score) => {
  if (score === null || score === undefined) return 'N/A';

  let value;
  if (typeof score === 'number') {
    value = score;
  } else if (typeof score === 'string') {
    // Extract first number from string (e.g., "51 - 75" -> 51)
    const matches = score.match(/(\d+)/);
    if (matches && matches[1]) {
      value = parseInt(matches[1], 10);
    } else {
      return 'N/A';
    }
  } else {
    return 'N/A';
  }

  if (value >= 76) return 'Excellent';
  if (value >= 51) return 'Good';
  if (value >= 26) return 'Fair';
  return 'Poor';
};

const ResultTableFRM = ({ scores }) => {
  if (!scores || Object.keys(scores).length === 0) return null;

  const handleDownloadCSV = () => {
    let csv = 'Topic,Percentile Range (%),Mastery,Comment\n';

    Object.entries(scores).forEach(([topic, score]) => {
      const scoreValue = score !== null && score !== undefined ? score : 'N/A';
      const mastery = getMastery(score);
      const comment = mastery !== 'N/A'
        ? `You have shown ${mastery} understanding of the subject area.`
        : '';
      csv += `"${topic}","${scoreValue}","${mastery}","${comment}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'frm_results.csv');
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Analysis Results</h2>

      <table className="result-table">
        <thead>
          <tr>
            <th>Topic</th>
            <th>Percentile Range (%)</th>
            <th>Mastery</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(scores).map(([topic, score], index) => {
            const scoreValue = score !== null && score !== undefined ? score : 'Not detected';
            const mastery = getMastery(score);
            const comment = mastery !== 'N/A'
              ? `You have shown ${mastery} understanding of the subject area.`
              : '';

            return (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td>{topic}</td>
                <td>{scoreValue}</td>
                <td>{mastery}</td>
                <td style={{ fontStyle: 'italic' }}>{comment}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        onClick={handleDownloadCSV}
      >
        Download as CSV
      </button>
    </div>
  );
};

export default ResultTableFRM;
