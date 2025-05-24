"use client"

import { useState } from "react"
import {
  Book,
  Home,
  Search,
  Building,
  Calculator,
  Calendar,
  Phone,
  Download,
  MapPin,
  Filter,
  Eye,
  Menu,
  Info,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function UserGuide() {
  const [activeSection, setActiveSection] = useState("getting-started")

  const sections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: Home,
      description: "Learn the basics of using the Aman Group website",
    },
    {
      id: "navigation",
      title: "Navigation",
      icon: Menu,
      description: "How to navigate through the website",
    },
    {
      id: "properties",
      title: "Browsing Properties",
      icon: Building,
      description: "Find and explore available properties",
    },
    {
      id: "tools",
      title: "Tools & Features",
      icon: Calculator,
      description: "Use our helpful tools and features",
    },
    {
      id: "contact",
      title: "Getting Help",
      icon: Phone,
      description: "How to contact us and get support",
    },
  ]

  const renderContent = (sectionId: string) => {
    switch (sectionId) {
      case "getting-started":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Welcome to Aman Group</h3>
              <p className="text-muted-foreground mb-4">
                Aman Group is your premier destination for real estate properties in the Philippines. We offer a wide
                range of properties including model houses, ready-for-occupancy units, and lot-only properties.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <Building className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-base">Model Houses</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Explore our collection of model houses with various designs and floor plans.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <Home className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-base">Ready For Occupancy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Move-in ready properties that are completed and available immediately.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <MapPin className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-base">Lot Only</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Prime lots available for purchase in various locations.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Device Compatibility</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5 text-primary" />
                  <span className="text-sm">Desktop</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Tablet className="h-5 w-5 text-primary" />
                  <span className="text-sm">Tablet</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <span className="text-sm">Mobile</span>
                </div>
              </div>
            </div>
          </div>
        )

      case "navigation":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Website Navigation</h3>
              <p className="text-muted-foreground mb-4">
                Learn how to navigate through our website efficiently on any device.
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Monitor className="h-5 w-5 mr-2" />
                    Desktop Navigation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">1</Badge>
                    <div>
                      <p className="font-medium">Main Menu</p>
                      <p className="text-sm text-muted-foreground">
                        Use the horizontal menu bar at the top to access main sections
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">2</Badge>
                    <div>
                      <p className="font-medium">Dropdown Menus</p>
                      <p className="text-sm text-muted-foreground">
                        Hover over "Properties" and "Resources" to see submenu options
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">3</Badge>
                    <div>
                      <p className="font-medium">Logo</p>
                      <p className="text-sm text-muted-foreground">
                        Click the Aman Group logo to return to the homepage
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Smartphone className="h-5 w-5 mr-2" />
                    Mobile Navigation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">1</Badge>
                    <div>
                      <p className="font-medium">Hamburger Menu</p>
                      <p className="text-sm text-muted-foreground">Tap the menu icon (☰) in the top right corner</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">2</Badge>
                    <div>
                      <p className="font-medium">Expandable Sections</p>
                      <p className="text-sm text-muted-foreground">
                        Tap sections with arrows to expand submenu options
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">3</Badge>
                    <div>
                      <p className="font-medium">Swipe Navigation</p>
                      <p className="text-sm text-muted-foreground">
                        Swipe left/right on property galleries and image carousels
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "properties":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Finding Properties</h3>
              <p className="text-muted-foreground mb-4">
                Discover how to browse, filter, and view property details effectively.
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Search className="h-5 w-5 mr-2" />
                    Browsing Properties
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">1</Badge>
                    <div>
                      <p className="font-medium">Property Categories</p>
                      <p className="text-sm text-muted-foreground">
                        Navigate to Model Houses, Ready For Occupancy, or Lot Only sections
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">2</Badge>
                    <div>
                      <p className="font-medium">Property Cards</p>
                      <p className="text-sm text-muted-foreground">
                        Each property shows key information: price, location, size, and features
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">3</Badge>
                    <div>
                      <p className="font-medium">View Details</p>
                      <p className="text-sm text-muted-foreground">
                        Click "View Details" to see complete property information
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Filtering & Sorting
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">1</Badge>
                    <div>
                      <p className="font-medium">Price Range</p>
                      <p className="text-sm text-muted-foreground">
                        Use price filters to find properties within your budget
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">2</Badge>
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">Filter by specific locations or areas of interest</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">3</Badge>
                    <div>
                      <p className="font-medium">Property Type</p>
                      <p className="text-sm text-muted-foreground">
                        Sort by house type, lot size, or number of bedrooms
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Property Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">1</Badge>
                    <div>
                      <p className="font-medium">Image Gallery</p>
                      <p className="text-sm text-muted-foreground">
                        Browse through multiple property photos and floor plans
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">2</Badge>
                    <div>
                      <p className="font-medium">Specifications</p>
                      <p className="text-sm text-muted-foreground">
                        View detailed specifications, dimensions, and features
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">3</Badge>
                    <div>
                      <p className="font-medium">Location Map</p>
                      <p className="text-sm text-muted-foreground">See the exact location and nearby amenities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "tools":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Tools & Features</h3>
              <p className="text-muted-foreground mb-4">
                Make the most of our helpful tools and features to enhance your property search experience.
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Calculator className="h-5 w-5 mr-2" />
                    Loan Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-3">
                    Calculate your monthly payments and plan your financing.
                  </p>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">1</Badge>
                    <div>
                      <p className="font-medium">Enter Property Price</p>
                      <p className="text-sm text-muted-foreground">
                        Input the total property price or use the suggested amount
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">2</Badge>
                    <div>
                      <p className="font-medium">Set Down Payment</p>
                      <p className="text-sm text-muted-foreground">
                        Choose your down payment percentage (typically 10-30%)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">3</Badge>
                    <div>
                      <p className="font-medium">Select Loan Terms</p>
                      <p className="text-sm text-muted-foreground">Choose loan duration and interest rate options</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">4</Badge>
                    <div>
                      <p className="font-medium">View Results</p>
                      <p className="text-sm text-muted-foreground">
                        See monthly payments, total interest, and payment breakdown
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Schedule Property Viewing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-3">Book appointments to visit properties in person.</p>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">1</Badge>
                    <div>
                      <p className="font-medium">Select Property</p>
                      <p className="text-sm text-muted-foreground">
                        Choose the property you want to visit from the details page
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">2</Badge>
                    <div>
                      <p className="font-medium">Pick Date & Time</p>
                      <p className="text-sm text-muted-foreground">Select your preferred viewing date and time slot</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">3</Badge>
                    <div>
                      <p className="font-medium">Provide Contact Info</p>
                      <p className="text-sm text-muted-foreground">Enter your contact details for confirmation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Download className="h-5 w-5 mr-2" />
                    Download & Share
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-3">Save and share property information easily.</p>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">1</Badge>
                    <div>
                      <p className="font-medium">Download Brochures</p>
                      <p className="text-sm text-muted-foreground">Get PDF brochures with complete property details</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">2</Badge>
                    <div>
                      <p className="font-medium">Save Images</p>
                      <p className="text-sm text-muted-foreground">Download high-resolution property photos</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">3</Badge>
                    <div>
                      <p className="font-medium">Share Properties</p>
                      <p className="text-sm text-muted-foreground">
                        Share property links via social media or messaging apps
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "contact":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Getting Help & Support</h3>
              <p className="text-muted-foreground mb-4">
                We're here to help! Learn how to contact us and get the support you need.
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    Contact Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">📞</Badge>
                    <div>
                      <p className="font-medium">Phone Support</p>
                      <p className="text-sm text-muted-foreground">
                        Call us directly for immediate assistance with property inquiries
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">📧</Badge>
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-sm text-muted-foreground">
                        Send detailed inquiries via our contact form or email
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">💬</Badge>
                    <div>
                      <p className="font-medium">Online Form</p>
                      <p className="text-sm text-muted-foreground">
                        Use our contact form for specific property questions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">📍</Badge>
                    <div>
                      <p className="font-medium">Office Visit</p>
                      <p className="text-sm text-muted-foreground">
                        Visit our office for in-person consultations and document processing
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    What to Include in Your Inquiry
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">1</Badge>
                    <div>
                      <p className="font-medium">Property Details</p>
                      <p className="text-sm text-muted-foreground">
                        Mention the specific property name, location, or reference number
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">2</Badge>
                    <div>
                      <p className="font-medium">Your Requirements</p>
                      <p className="text-sm text-muted-foreground">
                        Share your budget, preferred location, and property preferences
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">3</Badge>
                    <div>
                      <p className="font-medium">Contact Preference</p>
                      <p className="text-sm text-muted-foreground">Let us know the best way and time to reach you</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge variant="outline">4</Badge>
                    <div>
                      <p className="font-medium">Timeline</p>
                      <p className="text-sm text-muted-foreground">
                        Mention your expected timeline for property purchase or viewing
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Response Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-sm">Phone Calls</p>
                      <p className="text-sm text-muted-foreground">Immediate during business hours</p>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Email/Forms</p>
                      <p className="text-sm text-muted-foreground">Within 24 hours</p>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Property Viewing</p>
                      <p className="text-sm text-muted-foreground">1-2 business days</p>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Document Processing</p>
                      <p className="text-sm text-muted-foreground">3-5 business days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <Book className="h-4 w-4" />
          <span>User Guide</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Book className="h-5 w-5" />
            <span>User Guide</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-[70vh]">
          {/* Sidebar */}
          <div className="w-64 border-r pr-4 overflow-y-auto">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeSection === section.id ? "bg-primary text-primary-foreground" : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-4 w-4" />
                      <div>
                        <p className="font-medium text-sm">{section.title}</p>
                        <p
                          className={`text-xs ${
                            activeSection === section.id ? "text-primary-foreground/80" : "text-muted-foreground"
                          }`}
                        >
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 pl-6 overflow-y-auto">{renderContent(activeSection)}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
