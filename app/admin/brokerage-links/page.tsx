"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { accreditedBrokerages, generateBrokerageLink } from "@/lib/brokerage-links"
import { Copy, Check, ExternalLink, Download, QrCode } from 'lucide-react'
import QRCode from "react-qr-code"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BrokerageLinksPage() {
  const [selectedBrokerage, setSelectedBrokerage] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [department, setDepartment] = useState("All")
  const [downloadingQR, setDownloadingQR] = useState(false)
  const qrCodeRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<"link" | "qrcode">("link")

  const generateLink = async () => { // Made async
    if (!selectedBrokerage) return

    // Use the current origin for the base URL
    const baseUrl = window.location.origin
    const link = await generateBrokerageLink(selectedBrokerage, baseUrl) // Await the function call
    setGeneratedLink(link)
  }

  const copyToClipboard = () => {
    if (!generatedLink) return

    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadQRCode = async () => {
    if (!qrCodeRef.current || !generatedLink) return

    try {
      setDownloadingQR(true)

      // Get the SVG element
      const svg = qrCodeRef.current.querySelector("svg")
      if (!svg) return

      // Create a canvas element
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Set canvas dimensions (with some padding)
      const svgRect = svg.getBoundingClientRect()
      const padding = 20 // Add padding around the QR code
      canvas.width = svgRect.width + padding * 2
      canvas.height = svgRect.height + padding * 2

      // Fill with white background
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Convert SVG to image
      const svgData = new XMLSerializer().serializeToString(svg)
      const img = new Image()

      // Create a blob from the SVG
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
      const url = URL.createObjectURL(svgBlob)

      // Wait for image to load
      await new Promise((resolve) => {
        img.onload = resolve
        img.src = url
      })

      // Draw image on canvas with padding
      ctx.drawImage(img, padding, padding, svgRect.width, svgRect.height)

      // Get the brokerage name for the filename
      const brokerage = accreditedBrokerages.find((b) => b.id === selectedBrokerage)
      const brokerageName = brokerage ? brokerage.agency.replace(/\s+/g, "_") : "brokerage"

      // Convert canvas to data URL and trigger download
      const dataUrl = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `${brokerageName}_qrcode.png`
      link.href = dataUrl
      link.click()

      // Clean up
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading QR code:", error)
    } finally {
      setDownloadingQR(false)
    }
  }

  const filteredBrokerages =
    department === "All"
      ? accreditedBrokerages.slice().sort((a, b) => a.agency.localeCompare(b.agency))
      : accreditedBrokerages.filter((b) => b.department === department).sort((a, b) => a.agency.localeCompare(b.agency))

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Brokerage Referral Links</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Generate Brokerage Link</CardTitle>
            <CardDescription>
              Create a unique referral link for a brokerage that will auto-populate the contact form.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="department">Filter by Team</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Teams</SelectItem>
                  <SelectItem value="Sales">Team Mavericks</SelectItem>
                  <SelectItem value="Marketing">Team Alpha</SelectItem>
                  <SelectItem value="Loans">Team Titans</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="brokerage">Select Brokerage</Label>
              <Select value={selectedBrokerage} onValueChange={setSelectedBrokerage}>
                <SelectTrigger id="brokerage">
                  <SelectValue placeholder="Select a brokerage" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {filteredBrokerages.map((brokerage) => (
                    <SelectItem key={brokerage.id} value={brokerage.id}>
                      {brokerage.agency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={generateLink} disabled={!selectedBrokerage} className="w-full">
              Generate Link
            </Button>

            {generatedLink && (
              <div className="mt-4 space-y-4">
                <div ref={tabsRef}>
                  <Tabs
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value as "link" | "qrcode")}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="link">Shareable Link</TabsTrigger>
                      <TabsTrigger value="qrcode">QR Code</TabsTrigger>
                    </TabsList>

                    <TabsContent value="link" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="generated-link">Shareable Link</Label>
                        <div className="flex">
                          <Input id="generated-link" value={generatedLink} readOnly className="rounded-r-none" />
                          <Button onClick={copyToClipboard} className="rounded-l-none" variant="secondary">
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(generatedLink, "_blank")}
                            className="mt-2"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Test Link
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="qrcode" className="space-y-4">
                      <div className="flex flex-col items-center space-y-4">
                        <div ref={qrCodeRef} className="bg-white p-4 rounded-lg">
                          <QRCode value={generatedLink} size={200} level="H" className="mx-auto" />
                        </div>
                        <Button onClick={downloadQRCode} disabled={downloadingQR} className="w-full sm:w-auto">
                          {downloadingQR ? (
                            <>Processing...</>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Download QR Code
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                          Scan this QR code to access the brokerage referral link
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Understanding the brokerage referral link system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Purpose</h3>
              <p className="text-muted-foreground">
                Brokerage referral links allow you to track which brokerage is referring clients to your website. When a
                client uses a brokerage's unique link, the contact form will automatically be populated with the
                brokerage's information.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">How to Use</h3>
              <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                <li>Select a brokerage from the dropdown menu</li>
                <li>Click "Generate Link" to create a unique referral link</li>
                <li>Copy the link or download the QR code</li>
                <li>Share the link or QR code with the brokerage</li>
                <li>
                  When clients use this link or scan the QR code, they'll be directed to the home page with the
                  brokerage information stored
                </li>
                <li>The brokerage information will be pre-filled when they visit the contact page</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Security</h3>
              <p className="text-muted-foreground">
                Each link contains a secure hash that validates the brokerage information. This prevents tampering with
                the link parameters and ensures data integrity.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Accredited Brokerages</CardTitle>
          <CardDescription>List of all brokerages that can have referral links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-2 border">ID</th>
                  <th className="text-left p-2 border">Brokerage</th>
                  <th className="text-left p-2 border">Team</th>
                  <th className="text-left p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accreditedBrokerages
                  .slice()
                  .sort((a, b) => a.agency.localeCompare(b.agency))
                  .map((brokerage) => (
                    <tr key={brokerage.id} className="border-b">
                      <td className="p-2 border">{brokerage.id}</td>
                      <td className="p-2 border">{brokerage.agency}</td>
                      <td className="p-2 border">
                        {brokerage.department === "Sales"
                          ? "Mavericks"
                          : brokerage.department === "Marketing"
                            ? "Alpha"
                            : brokerage.department === "Loans"
                              ? "Titans"
                              : brokerage.department}
                      </td>
                      <td className="p-2 border">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedBrokerage(brokerage.id)
                              setDepartment(brokerage.department)
                              generateLink()
                              setActiveTab("link")
                              setTimeout(() => {
                                tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                              }, 100)
                            }}
                          >
                            Generate Link
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBrokerage(brokerage.id)
                              setDepartment(brokerage.department)
                              generateLink()
                              setActiveTab("qrcode")
                              setTimeout(() => {
                                tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                              }, 100)
                            }}
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
