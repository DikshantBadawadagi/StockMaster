"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signup, resendOTP } from "@/lib/api"
import { useAuth } from "@/lib/AuthContext"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SignupPage() {
  const router = useRouter()
  const { setUser, setToken } = useAuth()

  const [step, setStep] = useState<"signup" | "verify">("signup")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [verifyData, setVerifyData] = useState({
    otp: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("")
  }

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerifyData({
      otp: e.target.value,
    })
    setError("")
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields")
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      const response = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "user",
      })

      if (response.success) {
        setSuccess("Signup successful! Please check your email for the OTP.")
        setStep("verify")
      } else {
        setError(response.message || "Signup failed")
      }
    } catch (err) {
      setError("An error occurred during signup")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (!verifyData.otp) {
      setError("Please enter the OTP")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: verifyData.otp,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("Email verified successfully!")
        if (data.data?.token && data.data?.user) {
          setToken(data.data.token)
          setUser(data.data.user)
          setTimeout(() => {
            router.push("/dashboard")
          }, 1000)
        }
      } else {
        setError(data.message || "Email verification failed")
      }
    } catch (err) {
      setError("An error occurred during verification")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError("")
    setLoading(true)

    try {
      const response = await resendOTP({
        email: formData.email,
      })

      if (response.success) {
        setSuccess("OTP resent successfully to your email")
      } else {
        setError(response.message || "Failed to resend OTP")
      }
    } catch (err) {
      setError("An error occurred while resending OTP")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>{step === "signup" ? "Create your account" : "Verify your email"}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === "signup" ? (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert variant="default" className="border-green-600 bg-green-50">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Loading..." : "Sign Up"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Login
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="otp" className="text-sm font-medium">
                  Enter OTP
                </label>
                <Input
                  id="otp"
                  type="text"
                  value={verifyData.otp}
                  onChange={handleOTPChange}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert variant="default" className="border-green-600 bg-green-50">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Verifying..." : "Verify Email"}
              </Button>

              <Button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                variant="outline"
                className="w-full bg-transparent"
              >
                Resend OTP
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
