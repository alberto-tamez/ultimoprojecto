"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Leaf, Droplet, Thermometer, CloudRain, Beaker, Info, ExternalLink } from "lucide-react"
import { getCropLabelFromPrediction, getCropDescription, getRecommendedConditions, type CropLabel } from "../lib/crop-utils"
import { CropDetailModal } from "./CropDetailModal"

// Pure type definitions
export type CropData = {
  N: number
  P: number
  K: number
  temperature: number
  humidity: number
  ph: number
  rainfall: number
  label?: string
  prediction?: number
}

// Pure function to format prediction value for display
export const formatPredictionValue = (prediction: number): string => {
  return (prediction * 100).toFixed(2) + '%'
}

// Pure function to get appropriate color based on prediction confidence
const getConfidenceColor = (prediction: number): string => {
  if (prediction >= 0.8) return "bg-green-50 border-green-200"
  if (prediction >= 0.5) return "bg-yellow-50 border-yellow-200"
  return "bg-red-50 border-red-200"
}

// Pure function to get badge variant based on prediction confidence
const getConfidenceBadgeVariant = (prediction: number): "success" | "warning" | "destructive" => {
  if (prediction >= 0.8) return "success"
  if (prediction >= 0.5) return "warning"
  return "destructive"
}

// Pure function to format number with specified precision
const formatNumber = (value: number, precision: number = 2): string => {
  return value.toFixed(precision)
}

// Pure function component for displaying crop recommendation
export function CropRecommendationCard({ data }: { data: CropData }) {

  // Destructure data using immutable approach
  const { N, P, K, temperature, humidity, ph, rainfall, prediction = 0, label: providedLabel } = data
  
  // Pure transformations using composition of pure functions
  const confidenceClass = "bg-green-50 border-green-200";
  // Convert the prediction to a crop label, ensuring type safety
  const cropLabel = (providedLabel as CropLabel) || getCropLabelFromPrediction(prediction)
  const cropDescription = getCropDescription(cropLabel)
  const recommendedConditions = getRecommendedConditions(cropLabel)
  

  return (
    <>
      <Card 
        className={`overflow-hidden border-2 ${confidenceClass}`}
      >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold capitalize">{cropLabel}</CardTitle>
        </div>


      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 p-1.5 rounded-full">
              <Leaf className="h-4 w-4 text-green-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nitrogen (N)</p>
              <p className="font-medium">{N} kg/ha</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-purple-100 p-1.5 rounded-full">
              <Beaker className="h-4 w-4 text-purple-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phosphorus (P)</p>
              <p className="font-medium">{P} kg/ha</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 p-1.5 rounded-full">
              <Beaker className="h-4 w-4 text-amber-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Potassium (K)</p>
              <p className="font-medium">{K} kg/ha</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-red-100 p-1.5 rounded-full">
              <Thermometer className="h-4 w-4 text-red-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Temperature</p>
              <p className="font-medium">{temperature}°C</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-full">
              <Droplet className="h-4 w-4 text-blue-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Humidity</p>
              <p className="font-medium">{humidity}%</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-cyan-100 p-1.5 rounded-full">
              <CloudRain className="h-4 w-4 text-cyan-700" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rainfall</p>
              <p className="font-medium">{rainfall} mm</p>
            </div>
          </div>
        </div>
      </CardContent>
      

    </Card>
    

    </>
  )
}
