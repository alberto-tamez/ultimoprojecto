"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Save, Download } from "lucide-react"

interface ProfilePageProps {
  user: {
    email: string
    name: string
    role: "student" | "teacher" | "other"
  } | null
  onUpdateUser: (user: any) => void
}

export function ProfilePage({ user, onUpdateUser }: ProfilePageProps) {
  // Hardcoded user info
  const [name, setName] = useState("alberto tamez");
  const [role, setRole] = useState<"student" | "teacher" | "other">("student");
  const [isSaving, setIsSaving] = useState(false);

  // Ignore props.user, always use hardcoded values
  useEffect(() => {
    setName("alberto tamez");
    setRole("student");
  }, []);

  const handleSave = async () => {
    setIsSaving(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedUser = {
      ...user,
      name,
      role,
    }

    onUpdateUser(updatedUser)
    setIsSaving(false)
  }

  const handleDownloadProfile = () => {
    const profileData = {
      email: user?.email,
      name,
      role,
      lastUpdated: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(profileData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "profile-data.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Personal Information</span>
          </CardTitle>
          <CardDescription>Update your profile details and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg">{user && getInitials(name, user.email)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">alberto tamez</h3>
              <p className="text-gray-600">alberto.chinx@gmail.com</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value: "student" | "teacher" | "other") => setRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={user?.email || ""} disabled className="bg-gray-50" />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div className="flex space-x-3">
            {/* Show email as a standalone, prominent element */}
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-700">Email: </span>
              <span className="text-base font-semibold text-blue-700">alberto.chinx@gmail.com</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-600">Files Analyzed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-gray-600">Reports Generated</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">24</div>
              <div className="text-sm text-gray-600">Days Active</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
