"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Brain, Download, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@workos-inc/authkit-nextjs/components"

// Type definitions for better type safety
type AnalysisResult = {
  summary?: string
  details?: string
  recommendations?: string[]
  statistics?: Record<string, string | number>
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

export function Dashboard() {
  // State management using React hooks
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [useDefault, setUseDefault] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  // Pure function handler for file upload events
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && validateCsvFile(selectedFile)) {
      setFile(selectedFile)
      setUseDefault(false)
      setAnalysis(null)
      setError(null)
    } else {
      alert("Please select a valid CSV file")
    }
  }

  // Pure function handler for using default dataset
  const handleUseDefault = () => {
    setUseDefault(true)
    setFile(null)
    setAnalysis(null)
    setError(null)
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
  const createAuthHeaders = (user: any | null): HeadersInit => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    // If user is authenticated, add session token from AuthKit
    if (user) {
      // WorkOS AuthKit handles the token in cookies automatically
      // We're just ensuring the Content-Type is set correctly
      // The actual authentication is handled by the credentials: 'include' option
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
    // Input validation
    if (!file && !useDefault) {
      alert("Please upload a CSV file or use the default dataset")
      return
    }

    // Reset state for new analysis
    setIsAnalyzing(true)
    setError(null)
    setProgress(0)
    
    // Create progress update function
    const updateProgress = (prev: number): number => {
      const newProgress = prev + Math.random() * 10
      return newProgress >= 90 ? 90 : newProgress
    }
    
    // Start progress simulation
    const progressInterval = setInterval(() => {
      setProgress(updateProgress)
    }, 300)
    
    try {
      // Use pure functions to prepare request
      const formData = createFormData(file, useDefault)
      const headers = createAuthHeaders(user)
      
      // Use the unauthenticated test endpoint for now
      // TODO: Switch back to authenticated endpoint once WorkOS auth is properly implemented
      const url = getApiUrl(API_CONFIG.ENDPOINTS.PREDICT_TEST)
      
      // Make the API call with timeout for better error handling
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      // Clean up interval and set progress to complete
      clearInterval(progressInterval)
      setProgress(100)
      
      // Handle error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `Server error: ${response.status}` }))
        throw new Error(errorData.detail || `Failed to analyze the data (Status: ${response.status})`)
      }
      
      // Process successful response
      const result = await response.json()
      
      // Transform data using pure function
      const formattedAnalysis = formatAnalysisResult(result)
      setAnalysis(formattedAnalysis)
    } catch (err) {
      console.error('Error analyzing data:', err)
      setError(handleFetchError(err))
    } finally {
      clearInterval(progressInterval)
      setIsAnalyzing(false)
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="flex items-end">
              <Button variant="outline" onClick={handleUseDefault} className="w-full" disabled={isAnalyzing}>
                Use Default Dataset
              </Button>
            </div>
          </div>

          {useDefault && (
            <p className="text-sm text-blue-600 flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>Using sample sales dataset (1,247 records)</span>
            </p>
          )}

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

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Analysis Results</span>
              <Button variant="outline" size="sm" onClick={handleDownload} className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download Report</span>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">{analysis}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
