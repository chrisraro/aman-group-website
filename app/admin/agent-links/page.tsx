"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { accreditedBrokerages } from "@/lib/brokerage-links"
import { agentsByAgency, getAllAgents } from "@/lib/data/agents"
import { Copy, Check, ExternalLink, Download, QrCode } from 'lucide-react'
import QRCode from "react-qr-code"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AgentLinksPage() {
  const [selectedAgency, setSelectedAgency] = useState("")
  const [selectedAgent, setSelectedAgent] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [department, setDepartment] = useState("All")
  const [downloadingQR, setDownloadingQR] = useState(false)
  const qrCodeRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<"link" | "qrcode">("link")

  // Get available agencies based on department filter
  const filteredAgencies =
    department === "All"
      ? accreditedBrokerages.slice().sort((a, b) => a.agency.localeCompare(b.agency))
      : accreditedBrokerages.filter((b) => b.department === department).sort((a, b) => a.agency.localeCompare(b.agency))

  // Get available agents based on selected agency
  const availableAgents = selectedAgency ? agentsByAgency[selectedAgency] || [] : []

  const generateLink = async () => { // Made async
    if (!selectedAgency) return

    // Use the current origin for the base URL
    const baseUrl = window.location.origin

    // Import the function dynamically to avoid circular dependencies
    import("@/lib/brokerage-links")
      .then(async ({ generateBrokerageLink }) => { // Await the import and then the function call
        const link = await generateBrokerageLink(selectedAgency, baseUrl, selectedAgent || undefined)
        setGeneratedLink(link)
      })
      .catch((error) => {
        console.error("Error importing generateBrokerageLink:", error)
      })
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
      img.crossOrigin = "anonymous"

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

      // Get the agency and agent names for the filename
      const agency = accreditedBrokerages.find((b) => b.id === selectedAgency)
      const agent = selectedAgent ? availableAgents.find((a) => a.id === selectedAgent) : null

      const agencyName = agency ? agency.agency.replace(/\s+/g, "_") : "agency"
      const agentName = agent ? agent.name.replace(/\s+/g, "_") : ""
      const fileName = agentName ? `${agencyName}_${agentName}_qrcode.png` : `${agencyName}_qrcode.png`

      // Convert canvas to data URL and trigger download
      const dataUrl = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = fileName
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

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Agent Referral Links</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Generate Agent Referral Link</CardTitle>
            <CardDescription>
              Create a unique referral link for a specific agent that will auto-populate the contact form.
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
              <Label htmlFor="agency">Select Agency</Label>
              <Select
                value={selectedAgency}
                onValueChange={(value) => {
                  setSelectedAgency(value)
                  setSelectedAgent("") // Reset agent selection when agency changes
                }}
              >
                <SelectTrigger id="agency">
                  <SelectValue placeholder="Select an agency" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {filteredAgencies.map((agency) => (
                    <SelectItem key={agency.id} value={agency.id}>
                      {agency.agency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAgency && availableAgents.length > 0 && (
              <div>
                <Label htmlFor="agent">Select Agent (Optional)</Label>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger id="agent">
                    <SelectValue placeholder="Select an agent or leave blank for agency" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="">Agency Level (No Specific Agent)</SelectItem>
                    {availableAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} ({agent.classification})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button onClick={generateLink} disabled={!selectedAgency} className="w-full">
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
                          Scan this QR code to access the agent referral link
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
            <CardDescription>Understanding the agent referral link system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Purpose</h3>
              <p className="text-muted-foreground">
                Agent referral links allow you to track which specific agent is referring clients to your website. When
                a client uses an agent's unique link, the contact form will automatically be populated with the agent's
                information.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">How to Use</h3>
              <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
                <li>Select an agency from the dropdown menu</li>
                <li>Optionally select a specific agent from that agency</li>
                <li>Click "Generate Link" to create a unique referral link</li>
                <li>Copy the link or download the QR code</li>
                <li>Share the link or QR code with the agency or agent</li>
                <li>
                  When clients use this link or scan the QR code, they'll be directed to the home page with the agency
                  and agent information stored
                </li>
                <li>The agency and agent information will be pre-filled when they visit the contact page</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Security</h3>
              <p className="text-muted-foreground">
                Each link contains a secure hash that validates the agency and agent information. This prevents
                tampering with the link parameters and ensures data integrity.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>All Agents</CardTitle>
          <CardDescription>List of all agents that can have referral links</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-2 border">ID</th>
                  <th className="text-left p-2 border">Name</th>
                  <th className="text-left p-2 border">Agency</th>
                  <th className="text-left p-2 border">Classification</th>
                  <th className="text-left p-2 border">Team</th>
                  <th className="text-left p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getAllAgents()
                  .sort((a, b) => {
                    // Sort by agency first, then by name
                    const agencyA = accreditedBrokerages.find((agency) => agency.id === a.agencyId)?.agency || ""
                    const agencyB = accreditedBrokerages.find((agency) => agency.id === b.agencyId)?.agency || ""

                    if (agencyA !== agencyB) {
                      return agencyA.localeCompare(agencyB)
                    }
                    return a.name.localeCompare(b.name)
                  })
                  .filter((agent) => department === "All" || agent.team === department)
                  .map((agent) => {
                    const agency = accreditedBrokerages.find((a) => a.id === agent.agencyId)
                    return (
                      <tr key={agent.id} className="border-b">
                        <td className="p-2 border">{agent.id}</td>
                        <td className="p-2 border">{agent.name}</td>
                        <td className="p-2 border">{agency?.agency || "Unknown Agency"}</td>
                        <td className="p-2 border">{agent.classification}</td>
                        <td className="p-2 border">{agent.team}</td>
                        <td className="p-2 border">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedAgency(agent.agencyId)
                                setSelectedAgent(agent.id)
                                setDepartment(agent.team)
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
                                setSelectedAgency(agent.agencyId)
                                setSelectedAgent(agent.id)
                                setDepartment(agent.team)
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
                    )
                  })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
