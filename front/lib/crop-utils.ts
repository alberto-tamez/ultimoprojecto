// Pure type definitions
export type CropLabel = 'rice' | 'maize' | 'chickpea' | 'kidneybeans' | 'pigeonpeas' | 
  'mothbeans' | 'mungbean' | 'blackgram' | 'lentil' | 'pomegranate' | 
  'banana' | 'mango' | 'grapes' | 'watermelon' | 'muskmelon' | 'apple' | 
  'orange' | 'papaya' | 'coconut' | 'cotton' | 'jute' | 'coffee'

// Pure mapping of prediction index to crop label
const cropLabels: CropLabel[] = [
  'rice', 'maize', 'chickpea', 'kidneybeans', 'pigeonpeas',
  'mothbeans', 'mungbean', 'blackgram', 'lentil', 'pomegranate',
  'banana', 'mango', 'grapes', 'watermelon', 'muskmelon',
  'apple', 'orange', 'papaya', 'coconut', 'cotton',
  'jute', 'coffee'
]

// Pure function to get crop label from prediction index
export const getCropLabelFromIndex = (index: number): CropLabel => {
  // Ensure index is within bounds
  if (index >= 0 && index < cropLabels.length) {
    return cropLabels[index]
  }
  // Default to first crop if out of bounds
  return cropLabels[0]
}

// Pure function to get crop label from prediction value
export const getCropLabelFromPrediction = (prediction: number): CropLabel => {
  // For now, this is a placeholder that just returns based on a threshold
  // In the future, this will be enhanced to properly interpret the model's output
  const index = Math.floor(prediction * cropLabels.length)
  return getCropLabelFromIndex(Math.min(index, cropLabels.length - 1))
}

// Pure function to get crop description
export const getCropDescription = (label: CropLabel): string => {
  const descriptions: Record<CropLabel, string> = {
    rice: 'Thrives in warm, humid conditions with abundant water.',
    maize: 'Requires moderate water and full sun exposure.',
    chickpea: 'Drought-tolerant legume that fixes nitrogen in soil.',
    kidneybeans: 'Needs well-drained soil and moderate water.',
    pigeonpeas: 'Heat-tolerant legume suitable for semi-arid regions.',
    mothbeans: 'Drought-resistant crop for arid and semi-arid regions.',
    mungbean: 'Short-duration crop suitable for multiple cropping systems.',
    blackgram: 'Requires moderate rainfall and well-drained soil.',
    lentil: 'Cool-season crop that thrives in well-drained soils.',
    pomegranate: 'Drought-resistant fruit tree for semi-arid conditions.',
    banana: 'Requires consistent moisture and warm temperatures.',
    mango: 'Tropical fruit tree that needs warm climate and seasonal rain.',
    grapes: 'Needs full sun exposure and well-drained soil.',
    watermelon: 'Requires warm temperatures and consistent moisture.',
    muskmelon: 'Thrives in warm, sunny conditions with moderate water.',
    apple: 'Needs cold winter period and moderate summer temperatures.',
    orange: 'Tropical to subtropical citrus requiring consistent moisture.',
    papaya: 'Fast-growing tropical fruit requiring warm temperatures.',
    coconut: 'Tropical palm thriving in coastal, humid environments.',
    cotton: 'Warm-season crop requiring full sun and moderate water.',
    jute: 'Requires warm, humid conditions and abundant rainfall.',
    coffee: 'Shade-tolerant crop for tropical highland environments.'
  }
  
  return descriptions[label] || 'No description available.'
}

// Pure function to get recommended soil conditions
export const getRecommendedConditions = (label: CropLabel): Record<string, string> => {
  const conditions: Record<CropLabel, Record<string, string>> = {
    rice: { N: '80-100', P: '40-60', K: '40-60', ph: '5.5-6.5', rainfall: '200-300' },
    maize: { N: '80-100', P: '50-80', K: '40-60', ph: '5.5-7.0', rainfall: '150-200' },
    chickpea: { N: '20-40', P: '40-60', K: '20-40', ph: '6.0-8.0', rainfall: '60-100' },
    kidneybeans: { N: '40-60', P: '40-60', K: '20-40', ph: '6.0-7.5', rainfall: '90-140' },
    pigeonpeas: { N: '20-40', P: '40-60', K: '20-40', ph: '5.5-7.0', rainfall: '60-150' },
    mothbeans: { N: '20-40', P: '40-60', K: '20-30', ph: '6.0-7.5', rainfall: '30-60' },
    mungbean: { N: '20-40', P: '40-60', K: '20-40', ph: '6.0-7.5', rainfall: '60-100' },
    blackgram: { N: '20-40', P: '40-60', K: '20-40', ph: '6.0-7.5', rainfall: '70-100' },
    lentil: { N: '20-30', P: '40-60', K: '20-30', ph: '6.0-8.0', rainfall: '50-80' },
    pomegranate: { N: '60-80', P: '40-60', K: '40-60', ph: '5.5-7.0', rainfall: '50-100' },
    banana: { N: '100-120', P: '40-60', K: '80-100', ph: '5.5-7.0', rainfall: '120-180' },
    mango: { N: '60-80', P: '40-60', K: '60-80', ph: '5.5-7.5', rainfall: '100-150' },
    grapes: { N: '60-80', P: '40-60', K: '60-80', ph: '6.0-7.0', rainfall: '80-120' },
    watermelon: { N: '80-100', P: '40-60', K: '80-100', ph: '6.0-7.0', rainfall: '50-80' },
    muskmelon: { N: '80-100', P: '40-60', K: '80-100', ph: '6.0-7.0', rainfall: '50-80' },
    apple: { N: '60-80', P: '40-60', K: '60-80', ph: '5.5-6.5', rainfall: '100-140' },
    orange: { N: '60-80', P: '40-60', K: '40-60', ph: '5.5-7.0', rainfall: '90-120' },
    papaya: { N: '80-100', P: '40-60', K: '80-100', ph: '6.0-7.0', rainfall: '100-150' },
    coconut: { N: '60-80', P: '40-60', K: '80-100', ph: '5.5-7.0', rainfall: '150-250' },
    cotton: { N: '80-100', P: '40-60', K: '40-60', ph: '6.0-8.0', rainfall: '60-100' },
    jute: { N: '60-80', P: '30-40', K: '30-40', ph: '6.0-7.5', rainfall: '150-200' },
    coffee: { N: '60-80', P: '30-50', K: '60-80', ph: '5.0-6.0', rainfall: '150-250' }
  }
  
  return conditions[label] || { N: 'N/A', P: 'N/A', K: 'N/A', ph: 'N/A', rainfall: 'N/A' }
}
