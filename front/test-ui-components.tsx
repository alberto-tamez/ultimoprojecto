"use client"

import React, { useState } from 'react'
import { CropRecommendationCard, CropData } from './components/CropRecommendationCard'
import { CardPagination } from './components/CardPagination'
import { getCropLabelFromPrediction, getCropLabelFromIndex } from './lib/crop-utils'

// Pure function to generate test data with realistic crop predictions
const generateTestData = (): CropData[] => {
  // Sample predictions from AI model (values between 0-1 representing confidence)
  const predictions = [
    0.92, 0.84, 0.70, 0.69, 0.52, 
    0.48, 0.30, 0.28, 0.10, 0.07
  ]
  
  // Sample crop indices (0-21 representing different crops)
  const cropIndices = [0, 3, 5, 10, 15, 20, 1, 8, 12, 18]
  
  // Sample CSV data with realistic soil and climate values
  const csvData = [
    { N: 90, P: 42, K: 43, temperature: 20.87, humidity: 82.00, ph: 6.50, rainfall: 202.93 },
    { N: 85, P: 58, K: 41, temperature: 21.77, humidity: 80.32, ph: 7.04, rainfall: 226.66 },
    { N: 60, P: 55, K: 44, temperature: 23.00, humidity: 82.00, ph: 7.84, rainfall: 263.96 },
    { N: 74, P: 35, K: 40, temperature: 26.49, humidity: 80.16, ph: 6.98, rainfall: 242.86 },
    { N: 78, P: 42, K: 42, temperature: 20.13, humidity: 81.60, ph: 7.62, rainfall: 262.72 },
    { N: 69, P: 37, K: 42, temperature: 23.41, humidity: 83.17, ph: 7.00, rainfall: 251.89 },
    { N: 69, P: 55, K: 38, temperature: 22.76, humidity: 82.41, ph: 7.43, rainfall: 260.65 },
    { N: 94, P: 53, K: 40, temperature: 25.81, humidity: 83.13, ph: 6.72, rainfall: 240.12 },
    { N: 89, P: 54, K: 38, temperature: 27.24, humidity: 80.31, ph: 6.88, rainfall: 227.15 },
    { N: 68, P: 58, K: 38, temperature: 24.86, humidity: 82.67, ph: 7.23, rainfall: 251.84 }
  ]
  
  // Combine CSV data with predictions and crop labels using pure functions
  return csvData.map((row, index) => ({
    ...row,
    prediction: predictions[index],
    label: getCropLabelFromIndex(cropIndices[index])
  }))
}

// Pure function to paginate data
const paginateData = (data: CropData[], page: number, itemsPerPage: number): CropData[] => {
  const startIndex = (page - 1) * itemsPerPage
  return data.slice(startIndex, startIndex + itemsPerPage)
}

// Component to test our UI components
export default function TestUIComponents() {
  // State using immutable patterns
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [cropData, setCropData] = useState<CropData[]>(generateTestData())
  
  // Constants
  const itemsPerPage = 5
  const totalPages = Math.ceil(cropData.length / itemsPerPage)
  
  // Pure function to handle page change
  const handlePageChange = (page: number): void => {
    setCurrentPage(page)
  }
  
  // Get current page data using pure function
  const currentPageData = paginateData(cropData, currentPage, itemsPerPage)
  
  return (
    <div className="container mx-auto p-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Crop Recommendation System</h1>
          <p className="text-muted-foreground">
            AI-powered crop recommendations based on soil and climate data
          </p>
        </div>
        
        <div className="bg-slate-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Model: <span className="font-medium">MLPClassifier</span></p>
              <p className="text-sm text-muted-foreground">Samples processed: <span className="font-medium">{cropData.length}</span></p>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Click on any card to view detailed information and suitability analysis</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {currentPageData.map((item, index) => (
            <CropRecommendationCard 
              key={index} 
              data={item} 
            />
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          <CardPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  )
}
