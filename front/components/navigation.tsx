"use client"

import { Button } from "@/components/ui/button"
import { User, BarChart3, LogOut } from "lucide-react"

import { MeResponse } from '../lib/api/types';

export interface NavigationUser extends MeResponse {
  role?: string;
}

interface NavigationProps {
  currentPage: "dashboard" | "profile" | "admin"
  onPageChange: (page: "dashboard" | "profile" | "admin") => void
  onLogout: () => void
  user: NavigationUser | null;
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
              <Button
                variant={currentPage === "admin" ? "default" : "ghost"}
                size="sm"
                onClick={() => onPageChange("admin")}
                className="flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Admin</span>
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="ml-2 font-medium">{user?.full_name}</span>
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
