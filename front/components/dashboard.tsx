"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Brain, Download, LogOut } from "lucide-react"
import { SignOutButton } from "./auth/sign-out-button"

export function Dashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [useDefault, setUseDefault] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
      setUseDefault(false)
      setAnalysis(null)
    } else {
      alert("Please select a valid CSV file")
    }
  }

  const handleUseDefault = () => {
    setUseDefault(true)
    setFile(null)
    setAnalysis(null)
  }

  const handleAnalyze = async () => {
    if (!file && !useDefault) {
      alert("Please upload a CSV file or use the default dataset")
      return
    }

    setIsAnalyzing(true)

    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const mockAnalysis = `
## Data Analysis Results

### Key Findings:
- **Data Quality**: The dataset contains 1,247 records with 95% completeness
- **Trends Identified**: Strong correlation between variables A and B (r=0.78)
- **Outliers**: 23 potential outliers detected in column C
- **Missing Values**: 5% missing values primarily in demographic fields

### Recommendations:
1. **Data Cleaning**: Remove or impute the 23 outliers to improve model accuracy
2. **Feature Engineering**: Create interaction terms between highly correlated variables
3. **Validation**: Implement cross-validation with 80/20 train-test split
4. **Next Steps**: Consider collecting additional data for underrepresented segments

### Statistical Summary:
- Mean accuracy: 87.3%
- Standard deviation: 12.1
- Confidence interval: 95%
- P-value: < 0.001 (statistically significant)

This analysis suggests your data is suitable for predictive modeling with some preprocessing steps.
    `

    setAnalysis(mockAnalysis)
    setIsAnalyzing(false)
  }

  const handleDownload = () => {
    if (!analysis) return

    const blob = new Blob([analysis], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "analysis-report.txt"
    document.body.appendChild(a)
    a.click()
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
            <SignOutButton variant="outline" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SignOutButton>
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
