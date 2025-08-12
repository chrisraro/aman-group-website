// Interface for brokerage data
export interface BrokerageLink {
  id: string
  name: string
  agency: string
  department: string
  hash: string
  // Add agent information
  agentId?: string
  agentName?: string
  agentClassification?: "Broker" | "Salesperson"
}
