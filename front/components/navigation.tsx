"use client"

import { Button } from "@/components/ui/button"
import { User, BarChart3, LogOut } from "lucide-react"

interface NavigationProps {
  currentPage: "dashboard" | "profile"
  onPageChange: (page: "dashboard" | "profile") => void
  onLogout: () => void
  user: { email: string; name: string; role: string } | null
}

export function Navigation({ currentPage, onPageChange, onLogout, user }: NavigationProps) {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900">CSV Analyzer</h1>
            <div className="flex space-x-2">
              <Button
                variant={currentPage === "dashboard" ? "default" : "ghost"}
                size="sm"
                onClick={() => onPageChange("dashboard")}
                className="flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
              <Button
                variant={currentPage === "profile" ? "default" : "ghost"}
                size="sm"
                onClick={() => onPageChange("profile")}
                className="flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user?.name || user?.email}</span>
            <Button variant="ghost" size="sm" onClick={onLogout} className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
