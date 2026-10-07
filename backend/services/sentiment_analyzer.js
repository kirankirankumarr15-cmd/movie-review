const vader = require('vader-sentiment');

function getSentimentWords(text) {
  // Approximate sentiment bearing words based on general positive/negative lexicons
  // The vader-sentiment JS port doesn't easily expose the full lexicon in the same way,
  // but we can do a simple lookup for demonstration.
  const words = text.toLowerCase().match(/[a-z']+/g) || [];
  const positive = [];
  const negative = [];
  const seen = new Set();
  
  for (const w of words) {
    if (seen.has(w)) continue;
    seen.add(w);
    
    // Evaluate single word
    const score = vader.SentimentIntensityAnalyzer.polarity_scores(w).compound;
    if (score >= 0.4) positive.push(w.charAt(0).toUpperCase() + w.slice(1));
    else if (score <= -0.4) negative.push(w.charAt(0).toUpperCase() + w.slice(1));
  }
  
  return {
    positive: positive.slice(0, 10),
    negative: negative.slice(0, 10)
  };
}

function analyzeSentiment(text) {
  if (!text || !text.trim()) {
    throw new Error("Review text cannot be empty.");
  }

  const scores = vader.SentimentIntensityAnalyzer.polarity_scores(text);
  
  const compound = scores.compound;
  const pos = scores.pos;
  const neu = scores.neu;
  const neg = scores.neg;

  let sentiment = 'neutral';
  if (compound >= 0.05) sentiment = 'positive';
  else if (compound <= -0.05) sentiment = 'negative';

  const confidence = Math.abs(compound);
  const words = getSentimentWords(text);

  return {
    sentiment,
    compound: Number(compound.toFixed(4)),
    positive: Number(pos.toFixed(4)),
    neutral: Number(neu.toFixed(4)),
    negative: Number(neg.toFixed(4)),
    confidence: Number(confidence.toFixed(4)),
    words
  };
}

module.exports = { analyzeSentiment };
