export const analyzeFRMResultText = (text) => {
  const scores = {};
  const topics = [
    "Foundations of Risk Management",
    "Quantitative Analysis",
    "Financial Markets and Products",
    "Valuation and Risk Models",
  ];

  topics.forEach(topic => {
    // Normalize whitespaces for safety
    const normalizedText = text.replace(/\s+/g, ' ');

    // Fuzzy match pattern using relaxed spacing
    const regex = new RegExp(`${topic}.*?You scored in the (\\d{1,3})\\s*-\\s*(\\d{1,3}) percentile range`, 'i');
    const match = normalizedText.match(regex);

    if (match && match[1] && match[2]) {
      scores[topic] = `${match[1]} - ${match[2]}`;
    } else {
      scores[topic] = null;
    }
  });

  return scores;
};
