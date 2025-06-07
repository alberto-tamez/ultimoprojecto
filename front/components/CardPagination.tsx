"use client"

import { Button } from "../components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Pure type definitions
type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

// Pure function to create an array of page numbers
const createPageArray = (totalPages: number, currentPage: number): number[] => {
  // For small number of pages, show all
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  
  // For larger numbers, show current page with neighbors and ellipsis
  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5]
  }
  
  if (currentPage >= totalPages - 2) {
    return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }
  
  return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2]
}

// Pure functional component for pagination
export function CardPagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Early return for single page
  if (totalPages <= 1) return null
  
  // Pure transformation to create page numbers
  const pageNumbers = createPageArray(totalPages, currentPage)
  
  // Pure functions for navigation
  const goToPrevious = () => onPageChange(Math.max(1, currentPage - 1))
  const goToNext = () => onPageChange(Math.min(totalPages, currentPage + 1))
  
  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={goToPrevious}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {pageNumbers.map(pageNumber => (
        <Button
          key={pageNumber}
          variant={pageNumber === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </Button>
      ))}
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={goToNext}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
