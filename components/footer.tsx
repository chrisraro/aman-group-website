import Link from "next/link"
import { Facebook, Mail, MapPin, Phone, ExternalLink } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Company Info - Full width on mobile */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex items-center justify-center bg-primary text-primary-foreground font-bold text-2xl rounded-md h-16 w-16 mb-4">
                A
              </div>
              <p className="text-gray-600 mb-6 text-center sm:text-left text-sm leading-relaxed">
                Building quality homes and communities for Bicolano families since 1989.
              </p>
            </div>
            <div className="flex justify-center sm:justify-start space-x-4">
              <Link
                href="https://www.facebook.com/enjoyrealty"
                className="text-gray-500 hover:text-primary p-3 rounded-full hover:bg-primary/10 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="mailto:frontdesk@enjoyrealty.com"
                className="text-gray-500 hover:text-primary p-3 rounded-full hover:bg-primary/10 transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>

          {/* Developers */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Our Developers</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/enjoy-realty"
                  className="text-gray-600 hover:text-primary inline-flex items-center justify-center sm:justify-start w-full sm:w-auto py-2 px-3 rounded-md hover:bg-primary/5 transition-colors text-sm"
                >
                  Enjoy Realty & Development
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link
                  href="/aman-engineering"
                  className="text-gray-600 hover:text-primary inline-flex items-center justify-center sm:justify-start w-full sm:w-auto py-2 px-3 rounded-md hover:bg-primary/5 transition-colors text-sm"
                >
                  Aman Engineering Enterprise
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Properties */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Our Properties</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/model-houses"
                  className="text-gray-600 hover:text-primary inline-flex items-center justify-center sm:justify-start w-full sm:w-auto py-2 px-3 rounded-md hover:bg-primary/5 transition-colors text-sm"
                >
                  Model Houses
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link
                  href="/ready-for-occupancy"
                  className="text-gray-600 hover:text-primary inline-flex items-center justify-center sm:justify-start w-full sm:w-auto py-2 px-3 rounded-md hover:bg-primary/5 transition-colors text-sm"
                >
                  Ready For Occupancy
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Link>
              </li>
              <li>
                <Link
                  href="/loan-calculator"
                  className="text-gray-600 hover:text-primary inline-flex items-center justify-center sm:justify-start w-full sm:w-auto py-2 px-3 rounded-md hover:bg-primary/5 transition-colors text-sm"
                >
                  Loan Calculator
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex flex-col sm:flex-row items-center sm:items-start">
                <MapPin className="h-5 w-5 mr-0 sm:mr-3 mb-2 sm:mb-0 text-gray-600 flex-shrink-0" />
                <span className="text-gray-600 text-center sm:text-left text-sm leading-relaxed">
                  Aman Corporate Center, Zone 6, San Felipe, Naga City, Camarines Sur, Philippines
                </span>
              </li>
              <li className="flex flex-col sm:flex-row items-center sm:items-start">
                <Phone className="h-5 w-5 mr-0 sm:mr-3 mb-2 sm:mb-0 text-gray-600 flex-shrink-0" />
                <div className="text-center sm:text-left">
                  <a href="tel:+63548845188" className="text-gray-600 hover:text-primary text-sm block">
                    (054) 884-5188
                  </a>
                  <a href="tel:+639296083744" className="text-gray-600 hover:text-primary text-sm block">
                    (Smart) 09296083744
                  </a>
                </div>
              </li>
              <li className="flex flex-col sm:flex-row items-center sm:items-start">
                <Mail className="h-5 w-5 mr-0 sm:mr-3 mb-2 sm:mb-0 text-gray-600 flex-shrink-0" />
                <a
                  href="mailto:frontdesk@enjoyrealty.com"
                  className="text-gray-600 hover:text-primary text-center sm:text-left text-sm"
                >
                  frontdesk@enjoyrealty.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 md:mt-12 pt-6 md:pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Aman Group of Companies. All rights reserved.</p>
          <p className="mt-2 text-xs">
            <Link href="/offline" className="hover:underline hover:text-primary transition-colors py-1 px-2 rounded">
              Offline Access
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
