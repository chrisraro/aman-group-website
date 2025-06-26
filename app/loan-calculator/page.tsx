"use client"

import { Suspense } from "react"
import Link from "next/link"
import { Home } from "lucide-react"
import { LoanCalculatorForm } from "@/components/loan-calculator-form"
import { LoanCalculatorNote } from "@/components/loan-calculator-note"

function LoanCalculatorContent() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm mb-8">
        <Link href="/" className="text-muted-foreground hover:text-primary">
          <Home className="h-4 w-4 inline mr-1" />
          Home
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <span className="font-medium">Loan Calculator</span>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Loan Calculator</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Calculate your monthly payments and explore financing options for your dream property.
        </p>
      </div>

      {/* Calculator Form */}
      <div className="max-w-4xl mx-auto">
        <LoanCalculatorForm />
      </div>

      {/* Important Note */}
      <div className="max-w-4xl mx-auto mt-8">
        <LoanCalculatorNote />
      </div>
    </div>
  )
}

export default function LoanCalculatorPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading calculator...</p>
            </div>
          </div>
        </div>
      }
    >
      <LoanCalculatorContent />
    </Suspense>
  )
}
