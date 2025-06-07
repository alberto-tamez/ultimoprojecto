"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Upload, FileText, Brain, Download, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Progress } from "./ui/progress"
import { useAuth } from "@workos-inc/authkit-nextjs/components"
import { CropRecommendationCard, CropData } from "./CropRecommendationCard"
import { getCropLabelFromIndex } from "../lib/crop-utils"
import { CardPagination } from "./CardPagination"

// Type definitions for better type safety
type AnalysisResult = {
  summary?: string
  details?: string
  recommendations?: string[]
  statistics?: Record<string, string | number>
  predictions?: Array<Record<string, number>>
  metadata?: {
    samples_processed?: number
    features_used?: number
    model_type?: string
    [key: string]: any
  }
  [key: string]: any
}

// Pure configuration values
const API_CONFIG = {
  BASE_URL: "http://172.28.69.182:9000",
  ENDPOINTS: {
    PREDICT: "/api/ai/predict",
    PREDICT_TEST: "/api/ai/predict-test", // Unauthenticated test endpoint
    TEST: "/api/ai/test"
  }
}

// Pure function to validate file extension
const validateCsvFile = (file: File | null): boolean => {
  return file !== null && file.type === "text/csv"
}

// Pure function to format analysis results as markdown
const formatAnalysisResult = (result: any): string => {
  // Handle string responses directly
  if (typeof result === 'string') {
    return result
  }
  
  // Format object responses as markdown
  if (result.summary) {
    return `
## Data Analysis Results

### Summary:
${result.summary}

${result.details ? `### Details:\n${result.details}\n\n` : ''}
${result.recommendations ? `### Recommendations:\n${result.recommendations.map((rec: string, i: number) => `${i+1}. ${rec}`).join('\n')}\n\n` : ''}
${result.statistics ? `### Statistical Summary:\n${Object.entries(result.statistics).map(([key, value]) => `- ${key}: ${value}`).join('\n')}` : ''}
    `
  }
  
  // Fallback for other formats
  return JSON.stringify(result, null, 2)
}

// Pure constants
const ITEMS_PER_PAGE = 5

// Pure function to calculate total pages
const calculateTotalPages = (totalItems: number, itemsPerPage: number): number => {
  return Math.ceil(totalItems / itemsPerPage)
}

// Pure function to get paginated data
const getPaginatedData = <T,>(data: T[], currentPage: number, itemsPerPage: number): T[] => {
  const startIndex = (currentPage - 1) * itemsPerPage
  return data.slice(startIndex, startIndex + itemsPerPage)
}

// Pure function to map predictions to CSV rows with crop labels
const mapPredictionsToData = (predictions: number[], csvRows: string[][], predictionIndices?: number[]): CropData[] => {
  return predictions.map((prediction, index) => {
    // Ensure we have a corresponding CSV row
    if (index < csvRows.length) {
      const row = csvRows[index]
      // Map CSV values to CropData structure with enhanced crop label
      return {
        N: parseFloat(row[0] || '0'),
        P: parseFloat(row[1] || '0'),
        K: parseFloat(row[2] || '0'),
        temperature: parseFloat(row[3] || '0'),
        humidity: parseFloat(row[4] || '0'),
        ph: parseFloat(row[5] || '0'),
        rainfall: parseFloat(row[6] || '0'),
        prediction,
        // If we have prediction indices (actual crop types), use them to get labels
        label: predictionIndices && index < predictionIndices.length ? 
          getCropLabelFromIndex(predictionIndices[index]) : 
          undefined
      }
    }
    return {
      N: 0, P: 0, K: 0, temperature: 0, humidity: 0, ph: 0, rainfall: 0, prediction
    }
  })
}

// Pure function to parse CSV content
const parseCSV = (csvContent: string): string[][] => {
  const lines = csvContent.trim().split('\n')
  const parsedCsv: string[][] = []
  
  lines.forEach(line => {
    parsedCsv.push(line.split(','))
  })
  
  return parsedCsv
}

export function Dashboard() {
  // State management using React hooks
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [useDefault, setUseDefault] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [cropData, setCropData] = useState<CropData[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [metadata, setMetadata] = useState<Record<string, any> | null>(null)
  const [csvContent, setCsvContent] = useState<string>('')

  // Pure function handler for file upload events
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && validateCsvFile(selectedFile)) {
      setFile(selectedFile)
      setUseDefault(false)
      setAnalysis(null)
      setError(null)
      setCropData([])
      setCurrentPage(1)
      
      // Read file content
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setCsvContent(event.target.result as string)
        }
      }
      reader.readAsText(selectedFile)
    } else {
      alert("Please select a valid CSV file")
    }
  }

  // Pure function to create a File object from a path
  const createFileFromPath = async (path: string, filename: string): Promise<File | null> => {
    try {
      const response = await fetch(path)
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`)
      }
      
      const blob = await response.blob()
      return new File([blob], filename, { type: 'text/csv' })
    } catch (err: unknown) {
      console.error('Error creating file from path:', err)
      return null
    }
  }

  // Pure function handler for using default dataset
  const handleUseDefault = async () => {
    setUseDefault(true)
    setFile(null)
    setError(null)
    
    try {
      // Use the specific crop recommendation dataset from public directory
      const defaultDatasetPath = '/1Crop_recommendation.csv'
      const defaultFilename = '1Crop_recommendation.csv'
      
      // Create a File object from the dataset
      const defaultFile = await createFileFromPath(defaultDatasetPath, defaultFilename)
      
      if (defaultFile) {
        // Set the file and read its content
        setFile(defaultFile)
        
        // Read file content using FileReader (pure approach)
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            const content = event.target.result as string
            setCsvContent(content)
            console.log('Default dataset loaded successfully')
          }
        }
        reader.readAsText(defaultFile)
      } else {
        throw new Error('Failed to create file from default dataset')
      }
    } catch (err: unknown) {
      console.error('Error loading default dataset:', err)
      // Handle error with proper type checking
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to load default dataset: ${errorMessage}`)
      setUseDefault(false)
    }
  }

  // Pure function to create FormData object
  const createFormData = (file: File | null, useDefault: boolean): FormData => {
    const formData = new FormData()
    
    if (file) {
      formData.append('file', file)
    } else if (useDefault) {
      formData.append('use_default', 'true')
    }
    
    return formData
  }
  
  // Pure function to create auth headers using WorkOS AuthKit session
  const createAuthHeaders = (user: any | null, isFormData: boolean = false): HeadersInit => {
    // Start with minimal headers
    const headers: HeadersInit = {
      'Accept': 'application/json',
    }
    
    // Only set Content-Type if not FormData (browser will set it for FormData)
    if (!isFormData) {
      headers['Content-Type'] = 'application/json'
    }
    
    // Add authorization header if user is authenticated
    if (user) {
      headers['Authorization'] = `Bearer ${user.token}`
    }
    
    return headers
  }
  
  // Pure function to construct API URL
  const getApiUrl = (endpoint: string): string => {
    return `${API_CONFIG.BASE_URL}${endpoint}`
  }
  
  // Pure function to handle fetch errors
  const handleFetchError = (error: any): string => {
    // Network errors
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      return `Cannot connect to server at ${API_CONFIG.BASE_URL}. Please check if the server is running.`
    }
    
    // Server errors
    if (error instanceof Error) {
      return error.message
    }
    
    // Unknown errors
    return 'An unexpected error occurred';
  }
  
  // Asynchronous function to handle data analysis
  const handleAnalyze = async () => {
    if (!file && !useDefault) {
      alert("Please upload a CSV file or use the default dataset")
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setProgress(0)
    setCropData([])
    setCurrentPage(1)

    // Progress simulation with pure function
    const simulateProgress = () => {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10
          return newProgress < 90 ? newProgress : 90
        })
      }, 300)
      return interval
    }
    
    const progressInterval = simulateProgress()

    try {
      const formData = createFormData(file, useDefault)
      // Set isFormData to true when sending FormData
      const headers = createAuthHeaders(user, true)
      const url = getApiUrl(API_CONFIG.ENDPOINTS.PREDICT_TEST)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)
      
      console.log('Sending request to:', url)
      console.log('With file:', file?.name || 'Using default')

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      
      // Extract predictions and metadata from response
      const rawPredictions = result.predictions as Array<Record<string, number>> | undefined;
      const apiMetadata = result.metadata; // Renamed to avoid conflict with state variable if any
      setMetadata(apiMetadata || {});

      // Transform predictions if they exist and are in the expected format
      const processedPredictions: number[] = Array.isArray(rawPredictions)
        ? rawPredictions.map((p: Record<string, number>) => {
            // Ensure p is an object and has values
            if (p && typeof p === 'object' && Object.keys(p).length > 0) {
              const values = Object.values(p);
              return typeof values[0] === 'number' ? values[0] : 0; // Fallback for safety
            }
            return 0; // Fallback if p is not as expected
          })
        : [];

      // Format analysis result for display
      const formattedAnalysis = formatAnalysisResult(result)
      setAnalysis(formattedAnalysis)

      // Parse CSV content and map predictions to data
      if (csvContent) {
        const parsedCsv = parseCSV(csvContent)
        if (parsedCsv.length > 0) {
          // Skip header row
          const dataRows = parsedCsv.slice(1)
          
          // Extract prediction indices if available in metadata
          const predictionIndices = apiMetadata?.prediction_indices || [] // Use apiMetadata here
          
          // Map predictions to CSV data with enhanced crop labels
          const cropDataWithPredictions = mapPredictionsToData(
            processedPredictions, // Use processedPredictions here
            dataRows,
            predictionIndices.length > 0 ? predictionIndices : undefined
          )
          setCropData(cropDataWithPredictions)
        }
      }

      clearInterval(progressInterval)
      setIsAnalyzing(false)
      setProgress(100)
    } catch (err) {
      console.error('Error during analysis:', err)
      setAnalysis(null)
      setError(handleFetchError(err))
    } finally {
      clearInterval(progressInterval)
      setIsAnalyzing(false)
      setProgress(isAnalyzing ? 0 : 100)
    }
  }

  // Pure function to handle report downloads
  const handleDownload = () => {
    if (!analysis) return

    // Create immutable data objects
    const blob = new Blob([analysis], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    
    // Create and trigger download
    const a = document.createElement("a")
    a.href = url
    a.download = "analysis-report.txt"
    document.body.appendChild(a)
    a.click()
    
    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }


  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CSV Data Analyzer</h1>
        <p className="text-gray-600">Upload your CSV file and get AI-powered insights</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-row justify-between items-start">
            <div>
              <CardTitle>Data Analysis Dashboard</CardTitle>
              <CardDescription>Upload your CSV file or use the default dataset to analyze</CardDescription>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="csv-upload">Upload CSV File</Label>
              <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileUpload} className="cursor-pointer" />
              {file && (
                <p className="text-sm text-green-600 flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>{file.name} selected</span>
                </p>
              )}
            </div>

            <div>
              <Button variant="outline" onClick={handleUseDefault} className="w-full" disabled={isAnalyzing}>
                Use Default Dataset
              </Button>
              {useDefault && (
                <p className="text-sm text-green-600 flex items-center space-x-1 mt-2">
                  <FileText className="h-4 w-4" />
                  <span>Using crop recommendation dataset</span>
                </p>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {isAnalyzing && (
            <div className="space-y-2 mt-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-gray-500">
                {progress < 100 ? 'Processing your data...' : 'Finalizing results...'}
              </p>
            </div>
          )}
          
          <Button
            onClick={handleAnalyze}
            disabled={(!file && !useDefault) || isAnalyzing}
            className="w-full flex items-center space-x-2"
          >
            <Brain className="h-4 w-4" />
            <span>{isAnalyzing ? "Analyzing..." : "Analyze with AI"}</span>
          </Button>
        </CardContent>
      </Card>

      {/* Download button moved to crop recommendations section */}
      
      {cropData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Crop Recommendations</span>
              {analysis && (
                <Button variant="outline" size="sm" onClick={handleDownload} className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download Report</span>
                </Button>
              )}
            </CardTitle>
            <CardDescription>
              Based on soil nutrients and climate conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getPaginatedData(cropData, currentPage, ITEMS_PER_PAGE).map((crop, index) => (
                <CropRecommendationCard 
                  key={`crop-${currentPage}-${index}`} 
                  data={crop} 
                />
              ))}
            </div>
            
            <CardPagination 
              currentPage={currentPage}
              totalPages={calculateTotalPages(cropData.length, ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
