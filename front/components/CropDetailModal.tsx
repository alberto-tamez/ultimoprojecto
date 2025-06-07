"use client"

import React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Badge } from "../components/ui/badge"
import { Leaf, Droplet, Thermometer, CloudRain, Beaker, Info } from "lucide-react"
import { type CropLabel, getCropDescription, getRecommendedConditions } from "../lib/crop-utils"
import { CropData } from "./CropRecommendationCard"

// Pure type definitions
interface CropDetailModalProps {
  isOpen: boolean
  onClose: () => void
  cropData: CropData | null
  cropLabel: CropLabel
}

// Pure function to format number with specified precision
const formatNumber = (value: number | undefined, precision: number = 2): string => {
  if (value === undefined) return "N/A"
  return value.toFixed(precision)
}

// Pure function to get appropriate color based on prediction confidence
const getConfidenceBadgeVariant = (prediction: number): "success" | "warning" | "destructive" => {
  if (prediction >= 0.8) return "success"
  if (prediction >= 0.5) return "warning"
  return "destructive"
}

// Pure function to calculate suitability score based on actual vs recommended values
const calculateSuitabilityScore = (
  actual: Record<string, number | undefined>,
  recommended: Record<string, string>
): Record<string, number> => {
  const scores: Record<string, number> = {}
  
  // Process N, P, K values
  const nutrients = ["N", "P", "K"]
  nutrients.forEach(nutrient => {
    const actualValue = actual[nutrient]
    if (actualValue === undefined) {
      scores[nutrient] = 0
      return
    }
    
    const recommendedRange = recommended[nutrient].split("-")
    const minRecommended = parseInt(recommendedRange[0], 10)
    const maxRecommended = parseInt(recommendedRange[1], 10)
    
    // Calculate how close the actual value is to the recommended range
    if (actualValue >= minRecommended && actualValue <= maxRecommended) {
      scores[nutrient] = 1 // Perfect match
    } else {
      // Calculate distance from range as percentage
      const distance = actualValue < minRecommended 
        ? minRecommended - actualValue 
        : actualValue - maxRecommended
      const rangeSize = maxRecommended - minRecommended
      scores[nutrient] = Math.max(0, 1 - (distance / rangeSize))
    }
  })
  
  // Process pH value
  const actualPh = actual.ph
  if (actualPh !== undefined) {
    const phRange = recommended.ph.split("-")
    const minPh = parseFloat(phRange[0])
    const maxPh = parseFloat(phRange[1])
    
    if (actualPh >= minPh && actualPh <= maxPh) {
      scores.ph = 1
    } else {
      // pH is more sensitive, so we use a smaller range for scoring
      const distance = actualPh < minPh ? minPh - actualPh : actualPh - maxPh
      scores.ph = Math.max(0, 1 - (distance / 2)) // pH typically ranges by about 2 points
    }
  } else {
    scores.ph = 0
  }
  
  // Process rainfall
  const actualRainfall = actual.rainfall
  if (actualRainfall !== undefined) {
    const rainfallRange = recommended.rainfall.split("-")
    const minRainfall = parseInt(rainfallRange[0], 10)
    const maxRainfall = parseInt(rainfallRange[1], 10)
    
    if (actualRainfall >= minRainfall && actualRainfall <= maxRainfall) {
      scores.rainfall = 1
    } else {
      const distance = actualRainfall < minRainfall 
        ? minRainfall - actualRainfall 
        : actualRainfall - maxRainfall
      const rangeSize = maxRainfall - minRainfall
      scores.rainfall = Math.max(0, 1 - (distance / rangeSize))
    }
  } else {
    scores.rainfall = 0
  }
  
  return scores
}

// Pure functional component for displaying detailed crop information
export function CropDetailModal({ isOpen, onClose, cropData, cropLabel }: CropDetailModalProps) {
  if (!cropData) return null
  
  // Pure transformations using composition of pure functions
  const { N, P, K, temperature, humidity, ph, rainfall, prediction = 0 } = cropData
  const formattedPrediction = formatNumber(prediction * 100)
  const cropDescription = getCropDescription(cropLabel)
  const recommendedConditions = getRecommendedConditions(cropLabel)
  const badgeVariant = getConfidenceBadgeVariant(prediction)
  
  // Calculate suitability scores
  const suitabilityScores = calculateSuitabilityScore(
    { N, P, K, ph, rainfall },
    recommendedConditions
  )
  
  // Pure function to render suitability indicator
  const renderSuitabilityIndicator = (score: number) => {
    const width = `${Math.round(score * 100)}%`
    let bgColor = "bg-red-500"
    
    if (score >= 0.8) bgColor = "bg-green-500"
    else if (score >= 0.5) bgColor = "bg-yellow-500"
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${bgColor} h-2 rounded-full`} style={{ width }}></div>
      </div>
    )
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl capitalize">{cropLabel}</DialogTitle>
            <Badge variant={badgeVariant}>
              {formattedPrediction}% Match
            </Badge>
          </div>
          <DialogDescription className="text-sm mt-2">
            {cropDescription}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Current Soil & Climate Conditions</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Nitrogen (N)</span>
                <span className="font-medium">{N} kg/ha</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Phosphorus (P)</span>
                <span className="font-medium">{P} kg/ha</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Potassium (K)</span>
                <span className="font-medium">{K} kg/ha</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">pH Level</span>
                <span className="font-medium">{ph}</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Temperature</span>
                <span className="font-medium">{temperature}°C</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Humidity</span>
                <span className="font-medium">{humidity}%</span>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Rainfall</span>
                <span className="font-medium">{rainfall} mm</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Recommended Conditions</h3>
            
            <div className="grid grid-cols-1 gap-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Nitrogen (N)</span>
                  <span className="text-xs">{recommendedConditions.N} kg/ha</span>
                </div>
                {renderSuitabilityIndicator(suitabilityScores.N)}
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Phosphorus (P)</span>
                  <span className="text-xs">{recommendedConditions.P} kg/ha</span>
                </div>
                {renderSuitabilityIndicator(suitabilityScores.P)}
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Potassium (K)</span>
                  <span className="text-xs">{recommendedConditions.K} kg/ha</span>
                </div>
                {renderSuitabilityIndicator(suitabilityScores.K)}
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted-foreground">pH Level</span>
                  <span className="text-xs">{recommendedConditions.ph}</span>
                </div>
                {renderSuitabilityIndicator(suitabilityScores.ph)}
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Rainfall</span>
                  <span className="text-xs">{recommendedConditions.rainfall} mm</span>
                </div>
                {renderSuitabilityIndicator(suitabilityScores.rainfall)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-2 text-sm">
          <p className="text-muted-foreground">
            <Info className="h-3 w-3 inline mr-1" />
            The suitability indicators show how well your current conditions match the ideal growing conditions for {cropLabel}.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
