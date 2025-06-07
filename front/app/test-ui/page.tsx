"use client"

import { useState } from "react"
import { CropRecommendationCard } from "../../components/CropRecommendationCard"
import { CardPagination } from "../../components/CardPagination"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { getCropLabelFromIndex, getCropDescription, getRecommendedConditions } from "../../lib/crop-utils"

// Pure function to generate test data
const generateTestData = (count: number = 15) => {
  // Pure function to generate a random number within a range
  const randomInRange = (min: number, max: number): number => 
    Math.floor(Math.random() * (max - min + 1)) + min
  
  // Pure function to generate a random crop data entry
  const generateCropEntry = (index: number) => {
    const cropIndex = randomInRange(0, 21)
    const confidence = randomInRange(60, 99) / 100
    
    return {
      N: randomInRange(0, 140),
      P: randomInRange(5, 145),
      K: randomInRange(5, 205),
      temperature: randomInRange(8, 43),
      humidity: randomInRange(14, 99),
      ph: (randomInRange(35, 99) / 10),
      rainfall: randomInRange(20, 298),
      prediction: confidence,
      label: getCropLabelFromIndex(cropIndex)
    }
  }
  
  // Generate array of test data using pure map function
  return Array.from({ length: count }, (_, i) => generateCropEntry(i))
}

// Pure function to calculate total pages
const calculateTotalPages = (totalItems: number, itemsPerPage: number): number => 
  Math.ceil(totalItems / itemsPerPage)

// Pure function to get paginated data
const getPaginatedData = <T,>(data: T[], currentPage: number, itemsPerPage: number): T[] => {
  const startIndex = (currentPage - 1) * itemsPerPage
  return data.slice(startIndex, startIndex + itemsPerPage)
}

export default function TestUI() {
  // State management using React hooks with immutable updates
  const [currentPage, setCurrentPage] = useState(1)
  const [testData] = useState(() => generateTestData())
  const [itemsPerPage] = useState(5)
  
  // Derive paginated data using pure function
  const paginatedData = getPaginatedData(testData, currentPage, itemsPerPage)
  const totalPages = calculateTotalPages(testData.length, itemsPerPage)
  
  // Pure function to handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">AI Crop Recommendation Test UI</CardTitle>
          <CardDescription>
            This page demonstrates the crop recommendation UI components with test data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Test Mode</Badge>
            <Badge variant="secondary">Random Data</Badge>
            <Badge variant="default">{testData.length} Samples</Badge>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>This test page shows how crop recommendations are displayed after CSV analysis.</p>
            <p>Click on any card to view detailed crop information and suitability analysis.</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Crop Recommendations</CardTitle>
          <CardDescription>
            Based on soil nutrients, climate conditions, and our AI model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedData.map((crop, index) => (
              <CropRecommendationCard 
                key={`crop-${currentPage}-${index}`} 
                data={crop} 
              />
            ))}
          </div>
          
          <div className="mt-6">
            <CardPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Component Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Key Components:</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><code>CropRecommendationCard</code> - Displays crop prediction with soil/climate data</li>
              <li><code>CropDetailModal</code> - Shows detailed crop information and suitability analysis</li>
              <li><code>CardPagination</code> - Handles pagination for multiple crop recommendations</li>
              <li><code>Badge</code> - Displays confidence levels and other status indicators</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Functional Programming Features:</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Pure utility functions for crop data transformation</li>
              <li>Immutable state management</li>
              <li>Separation of data and UI concerns</li>
              <li>Function composition for data processing</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
