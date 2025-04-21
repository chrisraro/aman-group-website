// Types for agents
export interface Agent {
  id: string
  name: string
  agencyId: string // Reference to the parent agency
  classification: "Broker" | "Salesperson"
  team: "Alpha" | "Mavericks" | "Titans"
}

// List of all agents organized by agency
export const agentsByAgency: Record<string, Agent[]> = {
  // Aces & B Realty
  m10: [
    { id: "m10-1", name: "Angelica Orain Cleofe", agencyId: "m10", classification: "Salesperson", team: "Alpha" },
    { id: "m10-2", name: "Kristina Francia Daquioag", agencyId: "m10", classification: "Salesperson", team: "Alpha" },
    { id: "m10-3", name: "Mary Ann Luna Picaso", agencyId: "m10", classification: "Salesperson", team: "Alpha" },
    { id: "m10-4", name: "Homer San andres Reyes", agencyId: "m10", classification: "Salesperson", team: "Alpha" },
    { id: "m10-5", name: "Allen Lindog Damot", agencyId: "m10", classification: "Salesperson", team: "Alpha" },
    { id: "m10-6", name: "Marison Martillana Comia", agencyId: "m10", classification: "Salesperson", team: "Alpha" },
    { id: "m10-7", name: "Analen Sol Roa", agencyId: "m10", classification: "Salesperson", team: "Alpha" },
    { id: "m10-8", name: "Angel Pantila Pante", agencyId: "m10", classification: "Salesperson", team: "Alpha" },
    { id: "m10-9", name: "Mariben Cleofe Pante", agencyId: "m10", classification: "Broker", team: "Alpha" },
  ],

  // Audjean Realty
  m2: [
    { id: "m2-1", name: "Shania Tolo Aman", agencyId: "m2", classification: "Salesperson", team: "Alpha" },
    { id: "m2-2", name: "Armando Laureles Aman", agencyId: "m2", classification: "Broker", team: "Alpha" },
    { id: "m2-3", name: "Cheryl Delos Santos Rabano", agencyId: "m2", classification: "Salesperson", team: "Alpha" },
  ],

  // Deocrats Realty
  m9: [
    { id: "m9-1", name: "Virginia Fernández Albao", agencyId: "m9", classification: "Salesperson", team: "Alpha" },
    { id: "m9-2", name: "Kristine Fernandez Albao", agencyId: "m9", classification: "Salesperson", team: "Alpha" },
  ],

  // Dezhomes Realty
  m3: [
    { id: "m3-1", name: "Lanie Imperial Sabaybay", agencyId: "m3", classification: "Salesperson", team: "Alpha" },
    { id: "m3-2", name: "Bernadette Patinga Ulep", agencyId: "m3", classification: "Salesperson", team: "Alpha" },
    { id: "m3-3", name: "Francia Gallenito Dematera", agencyId: "m3", classification: "Salesperson", team: "Alpha" },
    { id: "m3-4", name: "Josie Totañes Aguila", agencyId: "m3", classification: "Salesperson", team: "Alpha" },
  ],

  // Red Zeal Realty
  m1: [
    { id: "m1-1", name: "Roderick Argoso Rojo", agencyId: "m1", classification: "Salesperson", team: "Alpha" },
    { id: "m1-2", name: "Roden Argoso Rojo", agencyId: "m1", classification: "Broker", team: "Alpha" },
    { id: "m1-3", name: "Eva Alejandre Rojo", agencyId: "m1", classification: "Salesperson", team: "Alpha" },
    { id: "m1-4", name: "Diana Angelica Rojo", agencyId: "m1", classification: "Salesperson", team: "Alpha" },
    { id: "m1-5", name: "Rolan Lopez Son", agencyId: "m1", classification: "Salesperson", team: "Alpha" },
    { id: "m1-6", name: "Michelle Rose Tubig", agencyId: "m1", classification: "Salesperson", team: "Alpha" },
    { id: "m1-7", name: "Jonalyn Luna Arcilla", agencyId: "m1", classification: "Salesperson", team: "Alpha" },
  ],

  // Sweetville Realty
  m4: [
    { id: "m4-1", name: "Regina Vilma Angeles Guevara", agencyId: "m4", classification: "Salesperson", team: "Alpha" },
    { id: "m4-2", name: "Allan De La Cruz Remoquillo", agencyId: "m4", classification: "Broker", team: "Alpha" },
    { id: "m4-3", name: "Roda Mostrera Rebellion", agencyId: "m4", classification: "Salesperson", team: "Alpha" },
    { id: "m4-4", name: "Allene Villar Oliver", agencyId: "m4", classification: "Salesperson", team: "Alpha" },
    { id: "m4-5", name: "Jose Millapre Bisana", agencyId: "m4", classification: "Salesperson", team: "Alpha" },
    { id: "m4-6", name: "Debbie Garchitorena Bolina", agencyId: "m4", classification: "Salesperson", team: "Alpha" },
    { id: "m4-7", name: "Elizabeth Foliente Dialogo", agencyId: "m4", classification: "Salesperson", team: "Alpha" },
    { id: "m4-8", name: "Dianna Parma Reyes", agencyId: "m4", classification: "Salesperson", team: "Alpha" },
    { id: "m4-9", name: "Cristy Barnido Santos", agencyId: "m4", classification: "Salesperson", team: "Alpha" },
    { id: "m4-10", name: "Liberty Mausig Nabo", agencyId: "m4", classification: "Salesperson", team: "Alpha" },
    { id: "m4-11", name: "Loida Jardin Yuson", agencyId: "m4", classification: "Salesperson", team: "Alpha" },
  ],

  // Viva Realm Realty
  m11: [
    { id: "m11-1", name: "Emmanuel Lavapie Magallona", agencyId: "m11", classification: "Salesperson", team: "Alpha" },
    { id: "m11-2", name: "Viva Francia Rojo", agencyId: "m11", classification: "Broker", team: "Alpha" },
  ],
}

// Helper function to get all agents as a flat array
export function getAllAgents(): Agent[] {
  return Object.values(agentsByAgency).flat()
}

// Helper function to get an agent by ID
export function getAgentById(id: string): Agent | undefined {
  return getAllAgents().find((agent) => agent.id === id)
}

// Helper function to get agents by agency ID
export function getAgentsByAgencyId(agencyId: string): Agent[] {
  return agentsByAgency[agencyId] || []
}
