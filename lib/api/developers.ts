// Mock data for developers
export async function getAllDevelopers() {
  return [
    {
      id: 1,
      name: "Enjoy Realty & Development",
      slug: "enjoy-realty",
      description: "Specializing in residential developments with a focus on quality and affordability.",
      logo_url:
        "https://8ybl2ah7tkcii6tt.public.blob.vercel-storage.com/logo_images/Enjoy_Realty_Logo%20%281%29-RQ8HUzf03lgsW1fFNZuytby4ifEMUE.png",
      primary_color: "#65932D",
      secondary_color: "#FFE400",
    },
    {
      id: 2,
      name: "Aman Engineering Enterprise",
      slug: "aman-engineering",
      description: "Experts in construction and engineering with a commitment to excellence and innovation.",
      logo_url:
        "https://8ybl2ah7tkcii6tt.public.blob.vercel-storage.com/logo_images/aman_engineering_logo-uZFrkvP8LjG5wN6CEoGfixc9Zgsu91.png",
      primary_color: "#04009D",
      secondary_color: "#FE0000",
    },
  ]
}

export async function getDeveloperBySlug(slug: string) {
  const developers = await getAllDevelopers()
  return developers.find((developer) => developer.slug === slug) || null
}
