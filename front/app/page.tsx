"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { Dashboard } from "@/components/dashboard"
import { ProfilePage } from "@/components/profile-page"
import { Navigation } from "@/components/navigation"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPage, setCurrentPage] = useState<"dashboard" | "profile">("dashboard")
  const [user, setUser] = useState<{
    email: string
    name: string
    role: "student" | "teacher" | "other"
  } | null>(null)

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (email: string, password: string) => {
    // Simple authentication - in real app, this would be server-side
    const userData = {
      email,
      name: "",
      role: "student" as const,
    }
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem("user")
    setCurrentPage("dashboard")
  }

  const updateUser = (updatedUser: typeof user) => {
    setUser(updatedUser)
    if (updatedUser) {
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} onLogout={handleLogout} user={user} />

      <main className="container mx-auto px-4 py-8">
        {currentPage === "dashboard" ? <Dashboard /> : <ProfilePage user={user} onUpdateUser={updateUser} />}
      </main>
    </div>
  )
}
