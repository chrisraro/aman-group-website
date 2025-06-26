"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Save, RotateCcw, Settings, AlertCircle } from "lucide-react"
import { useLoanCalculatorSettings } from "@/lib/hooks/useLoanCalculatorSettings"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminLoanCalculatorPage() {
  const { settings, isLoading, updateSettings, resetSettings } = useLoanCalculatorSettings()
  const [localSettings, setLocalSettings] = useState(settings)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")

  // Update local settings when settings change
  useState(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  const handleSave = async () => {
    if (!localSettings) return

    setIsSaving(true)
    setSaveStatus("idle")

    try {
      await updateSettings(localSettings)
      setSaveStatus("success")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } catch (error) {
      console.error("Error saving settings:", error)
      setSaveStatus("error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    setIsResetting(true)
    setSaveStatus("idle")

    try {
      await resetSettings()
      setSaveStatus("success")
      setTimeout(() => setSaveStatus("idle"), 3000)
    } catch (error) {
      console.error("Error resetting settings:", error)
      setSaveStatus("error")
    } finally {
      setIsResetting(false)
    }
  }

  const updateLocalSetting = (key: keyof typeof localSettings, value: number | boolean) => {
    if (!localSettings) return
    setLocalSettings({
      ...localSettings,
      [key]: value,
    })
  }

  if (isLoading || !localSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Loan Calculator Settings</h1>
          <p className="text-muted-foreground">Configure loan calculation parameters and fees</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={isResetting}>
            <RotateCcw className="h-4 w-4 mr-2" />
            {isResetting ? "Resetting..." : "Reset to Defaults"}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {saveStatus === "success" && (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      {saveStatus === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error saving settings. Please try again.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interest Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Interest Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="baseInterestRate">Base Interest Rate (%)</Label>
              <Input
                id="baseInterestRate"
                type="number"
                step="0.1"
                value={localSettings.baseInterestRate}
                onChange={(e) => updateLocalSetting("baseInterestRate", Number.parseFloat(e.target.value) || 0)}
              />
              <p className="text-sm text-muted-foreground mt-1">Standard interest rate for regular loans</p>
            </div>

            <div>
              <Label htmlFor="specialRuleInterestRate">Special Rule Interest Rate (%)</Label>
              <Input
                id="specialRuleInterestRate"
                type="number"
                step="0.1"
                value={localSettings.specialRuleInterestRate}
                onChange={(e) => updateLocalSetting("specialRuleInterestRate", Number.parseFloat(e.target.value) || 0)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Interest rate for year 2+ (20% down payment special rule)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="specialRuleEnabled">Enable Special Rule</Label>
                <p className="text-sm text-muted-foreground">20% down payment: Year 1 at 0%, Year 2+ at special rate</p>
              </div>
              <Switch
                id="specialRuleEnabled"
                checked={localSettings.specialRuleEnabled}
                onCheckedChange={(checked) => updateLocalSetting("specialRuleEnabled", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Standard Fees */}
        <Card>
          <CardHeader>
            <CardTitle>Standard Fees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="processingFeePercentage">Processing Fee (%)</Label>
              <Input
                id="processingFeePercentage"
                type="number"
                step="0.1"
                value={localSettings.processingFeePercentage}
                onChange={(e) => updateLocalSetting("processingFeePercentage", Number.parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="appraisalFee">Appraisal Fee (₱)</Label>
              <Input
                id="appraisalFee"
                type="number"
                value={localSettings.appraisalFee}
                onChange={(e) => updateLocalSetting("appraisalFee", Number.parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="notarialFeePercentage">Notarial Fee (%)</Label>
              <Input
                id="notarialFeePercentage"
                type="number"
                step="0.1"
                value={localSettings.notarialFeePercentage}
                onChange={(e) => updateLocalSetting("notarialFeePercentage", Number.parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="insuranceFeePercentage">Insurance Fee (%)</Label>
              <Input
                id="insuranceFeePercentage"
                type="number"
                step="0.1"
                value={localSettings.insuranceFeePercentage}
                onChange={(e) => updateLocalSetting("insuranceFeePercentage", Number.parseFloat(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Model House Specific Fees */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Model House Construction Fees</CardTitle>
            <p className="text-sm text-muted-foreground">
              Additional fees applied to model house properties (17% total)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="constructionFeePercentage">Construction Fee Percentage (%)</Label>
                <Input
                  id="constructionFeePercentage"
                  type="number"
                  step="0.1"
                  value={localSettings.constructionFeePercentage}
                  onChange={(e) =>
                    updateLocalSetting("constructionFeePercentage", Number.parseFloat(e.target.value) || 0)
                  }
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Applied to both lot price and house construction cost
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Fee Breakdown for Model Houses:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Lot Development Fee:</span>
                    <Badge variant="outline">{localSettings.constructionFeePercentage}% of lot price</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>House Construction Fee:</span>
                    <Badge variant="outline">{localSettings.constructionFeePercentage}% of house cost</Badge>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total Additional Fees:</span>
                    <Badge>{localSettings.constructionFeePercentage * 2}%</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Down Payment</h4>
              <p className="text-muted-foreground">Fixed at 20% (Special Rule)</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Interest Structure</h4>
              <p className="text-muted-foreground">Year 1: 0% | Year 2+: {localSettings.specialRuleInterestRate}%</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Model House Fees</h4>
              <p className="text-muted-foreground">
                {localSettings.constructionFeePercentage * 2}% total additional fees
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
