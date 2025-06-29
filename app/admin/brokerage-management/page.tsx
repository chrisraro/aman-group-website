"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Users, Building, Search } from "lucide-react"
import { accreditedBrokerages } from "@/lib/brokerage-links"
import { getAllAgents } from "@/lib/data/agents"

interface Brokerage {
  id: string
  name: string
  agency: string
  department: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  status: "Active" | "Inactive"
}

interface Agent {
  id: string
  name: string
  agencyId: string
  classification: "Broker" | "Salesperson"
  team: "Alpha" | "Mavericks" | "Titans"
  email?: string
  phone?: string
  status: "Active" | "Inactive"
}

export default function BrokerageManagementPage() {
  const [brokerages, setBrokerages] = useState<Brokerage[]>(
    accreditedBrokerages.map((b) => ({
      ...b,
      contactEmail: `contact@${b.agency.toLowerCase().replace(/\s+/g, "")}.com`,
      contactPhone: "+63 912 345 6789",
      address: "Metro Manila, Philippines",
      status: "Active" as const,
    })),
  )

  const [agents, setAgents] = useState<Agent[]>(
    getAllAgents().map((a) => ({
      ...a,
      email: `${a.name.toLowerCase().replace(/\s+/g, ".")}@${
        accreditedBrokerages
          .find((b) => b.id === a.agencyId)
          ?.agency.toLowerCase()
          .replace(/\s+/g, "") || "agency"
      }.com`,
      phone: "+63 912 345 6789",
      status: "Active" as const,
    })),
  )

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("All")
  const [isAddBrokerageOpen, setIsAddBrokerageOpen] = useState(false)
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false)
  const [editingBrokerage, setEditingBrokerage] = useState<Brokerage | null>(null)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)

  // Filter brokerages
  const filteredBrokerages = brokerages.filter((brokerage) => {
    const matchesSearch =
      brokerage.agency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brokerage.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === "All" || brokerage.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  // Filter agents
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase())
    const brokerage = brokerages.find((b) => b.id === agent.agencyId)
    const matchesDepartment = selectedDepartment === "All" || brokerage?.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const handleAddBrokerage = (formData: FormData) => {
    const newBrokerage: Brokerage = {
      id: `new-${Date.now()}`,
      name: formData.get("name") as string,
      agency: formData.get("agency") as string,
      department: formData.get("department") as string,
      contactEmail: formData.get("contactEmail") as string,
      contactPhone: formData.get("contactPhone") as string,
      address: formData.get("address") as string,
      status: "Active",
    }
    setBrokerages([...brokerages, newBrokerage])
    setIsAddBrokerageOpen(false)
  }

  const handleEditBrokerage = (formData: FormData) => {
    if (!editingBrokerage) return

    const updatedBrokerage: Brokerage = {
      ...editingBrokerage,
      name: formData.get("name") as string,
      agency: formData.get("agency") as string,
      department: formData.get("department") as string,
      contactEmail: formData.get("contactEmail") as string,
      contactPhone: formData.get("contactPhone") as string,
      address: formData.get("address") as string,
    }

    setBrokerages(brokerages.map((b) => (b.id === editingBrokerage.id ? updatedBrokerage : b)))
    setEditingBrokerage(null)
  }

  const handleDeleteBrokerage = (id: string) => {
    setBrokerages(brokerages.filter((b) => b.id !== id))
    // Also remove agents from this brokerage
    setAgents(agents.filter((a) => a.agencyId !== id))
  }

  const handleAddAgent = (formData: FormData) => {
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: formData.get("name") as string,
      agencyId: formData.get("agencyId") as string,
      classification: formData.get("classification") as "Broker" | "Salesperson",
      team: formData.get("team") as "Alpha" | "Mavericks" | "Titans",
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      status: "Active",
    }
    setAgents([...agents, newAgent])
    setIsAddAgentOpen(false)
  }

  const handleEditAgent = (formData: FormData) => {
    if (!editingAgent) return

    const updatedAgent: Agent = {
      ...editingAgent,
      name: formData.get("name") as string,
      agencyId: formData.get("agencyId") as string,
      classification: formData.get("classification") as "Broker" | "Salesperson",
      team: formData.get("team") as "Alpha" | "Mavericks" | "Titans",
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
    }

    setAgents(agents.map((a) => (a.id === editingAgent.id ? updatedAgent : a)))
    setEditingAgent(null)
  }

  const handleDeleteAgent = (id: string) => {
    setAgents(agents.filter((a) => a.id !== id))
  }

  const toggleBrokerageStatus = (id: string) => {
    setBrokerages(
      brokerages.map((b) => (b.id === id ? { ...b, status: b.status === "Active" ? "Inactive" : "Active" } : b)),
    )
  }

  const toggleAgentStatus = (id: string) => {
    setAgents(agents.map((a) => (a.id === id ? { ...a, status: a.status === "Active" ? "Inactive" : "Active" } : a)))
  }

  const BrokerageForm = ({
    brokerage,
    onSubmit,
  }: { brokerage?: Brokerage; onSubmit: (formData: FormData) => void }) => (
    <form action={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Contact Person</Label>
          <Input id="name" name="name" defaultValue={brokerage?.name} required />
        </div>
        <div>
          <Label htmlFor="agency">Agency Name</Label>
          <Input id="agency" name="agency" defaultValue={brokerage?.agency} required />
        </div>
      </div>

      <div>
        <Label htmlFor="department">Department/Team</Label>
        <Select name="department" defaultValue={brokerage?.department}>
          <SelectTrigger>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Marketing">Team Alpha (Marketing)</SelectItem>
            <SelectItem value="Sales">Team Mavericks (Sales)</SelectItem>
            <SelectItem value="Loans">Team Titans (Loans)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contactEmail">Contact Email</Label>
          <Input id="contactEmail" name="contactEmail" type="email" defaultValue={brokerage?.contactEmail} />
        </div>
        <div>
          <Label htmlFor="contactPhone">Contact Phone</Label>
          <Input id="contactPhone" name="contactPhone" defaultValue={brokerage?.contactPhone} />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" defaultValue={brokerage?.address} />
      </div>

      <Button type="submit" className="w-full">
        {brokerage ? "Update Brokerage" : "Add Brokerage"}
      </Button>
    </form>
  )

  const AgentForm = ({ agent, onSubmit }: { agent?: Agent; onSubmit: (formData: FormData) => void }) => (
    <form action={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Agent Name</Label>
        <Input id="name" name="name" defaultValue={agent?.name} required />
      </div>

      <div>
        <Label htmlFor="agencyId">Brokerage</Label>
        <Select name="agencyId" defaultValue={agent?.agencyId}>
          <SelectTrigger>
            <SelectValue placeholder="Select brokerage" />
          </SelectTrigger>
          <SelectContent>
            {brokerages
              .filter((b) => b.status === "Active")
              .map((brokerage) => (
                <SelectItem key={brokerage.id} value={brokerage.id}>
                  {brokerage.agency}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="classification">Classification</Label>
          <Select name="classification" defaultValue={agent?.classification}>
            <SelectTrigger>
              <SelectValue placeholder="Select classification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Broker">Broker</SelectItem>
              <SelectItem value="Salesperson">Salesperson</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="team">Team</Label>
          <Select name="team" defaultValue={agent?.team}>
            <SelectTrigger>
              <SelectValue placeholder="Select team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Alpha">Team Alpha</SelectItem>
              <SelectItem value="Mavericks">Team Mavericks</SelectItem>
              <SelectItem value="Titans">Team Titans</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={agent?.email} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={agent?.phone} />
        </div>
      </div>

      <Button type="submit" className="w-full">
        {agent ? "Update Agent" : "Add Agent"}
      </Button>
    </form>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Brokerage & Agent Management</h1>
          <p className="text-muted-foreground">Manage your partner brokerages and their agents</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search brokerages or agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Teams</SelectItem>
                <SelectItem value="Marketing">Team Alpha</SelectItem>
                <SelectItem value="Sales">Team Mavericks</SelectItem>
                <SelectItem value="Loans">Team Titans</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="brokerages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="brokerages" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Brokerages ({filteredBrokerages.length})
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Agents ({filteredAgents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brokerages" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Brokerages</h2>
            <Dialog open={isAddBrokerageOpen} onOpenChange={setIsAddBrokerageOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Brokerage
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Brokerage</DialogTitle>
                  <DialogDescription>Add a new partner brokerage to your network</DialogDescription>
                </DialogHeader>
                <BrokerageForm onSubmit={handleAddBrokerage} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {filteredBrokerages.map((brokerage) => (
              <Card key={brokerage.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {brokerage.agency}
                        <Badge variant={brokerage.status === "Active" ? "default" : "secondary"}>
                          {brokerage.status}
                        </Badge>
                        <Badge variant="outline">
                          {brokerage.department === "Marketing"
                            ? "Alpha"
                            : brokerage.department === "Sales"
                              ? "Mavericks"
                              : "Titans"}
                        </Badge>
                      </CardTitle>
                      <CardDescription>Contact: {brokerage.name}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => toggleBrokerageStatus(brokerage.id)}>
                        {brokerage.status === "Active" ? "Deactivate" : "Activate"}
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setEditingBrokerage(brokerage)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Brokerage</DialogTitle>
                            <DialogDescription>Update brokerage information</DialogDescription>
                          </DialogHeader>
                          <BrokerageForm brokerage={editingBrokerage || undefined} onSubmit={handleEditBrokerage} />
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteBrokerage(brokerage.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>Email:</strong> {brokerage.contactEmail}
                    </div>
                    <div>
                      <strong>Phone:</strong> {brokerage.contactPhone}
                    </div>
                    <div>
                      <strong>Address:</strong> {brokerage.address}
                    </div>
                  </div>
                  <div className="mt-4">
                    <strong>Agents:</strong> {agents.filter((a) => a.agencyId === brokerage.id).length} agents
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Agents</h2>
            <Dialog open={isAddAgentOpen} onOpenChange={setIsAddAgentOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Agent
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Agent</DialogTitle>
                  <DialogDescription>Add a new agent to a brokerage</DialogDescription>
                </DialogHeader>
                <AgentForm onSubmit={handleAddAgent} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {filteredAgents.map((agent) => {
              const brokerage = brokerages.find((b) => b.id === agent.agencyId)
              return (
                <Card key={agent.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {agent.name}
                          <Badge variant={agent.status === "Active" ? "default" : "secondary"}>{agent.status}</Badge>
                          <Badge variant="outline">{agent.classification}</Badge>
                          <Badge variant="outline">{agent.team}</Badge>
                        </CardTitle>
                        <CardDescription>{brokerage?.agency}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => toggleAgentStatus(agent.id)}>
                          {agent.status === "Active" ? "Deactivate" : "Activate"}
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setEditingAgent(agent)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Agent</DialogTitle>
                              <DialogDescription>Update agent information</DialogDescription>
                            </DialogHeader>
                            <AgentForm agent={editingAgent || undefined} onSubmit={handleEditAgent} />
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteAgent(agent.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Email:</strong> {agent.email}
                      </div>
                      <div>
                        <strong>Phone:</strong> {agent.phone}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
