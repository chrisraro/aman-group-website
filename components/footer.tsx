import Link from "next/link"
import { Facebook, Mail, MapPin, Phone, ExternalLink } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex items-center justify-center bg-primary text-primary-foreground font-bold text-2xl rounded-md h-16 w-16 mb-3">
                A
              </div>
              <p className="text-gray-600 mb-4 text-center sm:text-left">
                Building quality homes and communities for Bicolano families since 1989.
              </p>
            </div>
            <div className="flex justify-center sm:justify-start space-x-4">
              <Link
                href="https://www.facebook.com/enjoyrealty"
                className="text-gray-500 hover:text-primary p-2 m3-state-layer"
              >
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="mailto:frontdesk@enjoyrealty.com"
                className="text-gray-500 hover:text-primary p-2 m3-state-layer"
              >
                <Mail className="h-6 w-6" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>

          <div className="mt-2 sm:mt-0">
            <h3 className="text-lg font-semibold mb-4 text-center sm:text-left">Our Developers</h3>
            <ul className="space-y-3">
              <li className="text-center sm:text-left">
                <Link
                  href="/enjoy-realty"
                  className="text-gray-600 hover:text-primary inline-flex items-center m3-state-layer p-1"
                >
                  Enjoy Realty & Development
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </li>
              <li className="text-center sm:text-left">
                <Link
                  href="/aman-engineering"
                  className="text-gray-600 hover:text-primary inline-flex items-center m3-state-layer p-1"
                >
                  Aman Engineering Enterprise
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-2 sm:mt-0">
            <h3 className="text-lg font-semibold mb-4 text-center sm:text-left">Our Properties</h3>
            <ul className="space-y-3">
              <li className="text-center sm:text-left">
                <Link
                  href="/model-houses"
                  className="text-gray-600 hover:text-primary inline-flex items-center m3-state-layer p-1"
                >
                  Model Houses
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </li>
              <li className="text-center sm:text-left">
                <Link
                  href="/ready-for-occupancy"
                  className="text-gray-600 hover:text-primary inline-flex items-center m3-state-layer p-1"
                >
                  Ready For Occupancy
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </li>
              <li className="text-center sm:text-left">
                <Link
                  href="/loan-calculator"
                  className="text-gray-600 hover:text-primary inline-flex items-center m3-state-layer p-1"
                >
                  Loan Calculator
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="mt-2 sm:mt-0">
            <h3 className="text-lg font-semibold mb-4 text-center sm:text-left">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex flex-col sm:flex-row items-center sm:items-start">
                <MapPin className="h-5 w-5 mr-0 sm:mr-2 mb-2 sm:mb-0 text-gray-600 flex-shrink-0" />
                <span className="text-gray-600 text-center sm:text-left">
                  Aman Corporate Center, Zone 6, San Felipe, Naga City, Camarines Sur, Philippines
                </span>
              </li>
              <li className="flex flex-col sm:flex-row items-center sm:items-start">
                <Phone className="h-5 w-5 mr-0 sm:mr-2 mb-2 sm:mb-0 text-gray-600 flex-shrink-0" />
                <span className="text-gray-600 text-center sm:text-left">(054) 884-5188 | (Smart) 09296083744​ </span>
              </li>
              <li className="flex flex-col sm:flex-row items-center sm:items-start">
                <Mail className="h-5 w-5 mr-0 sm:mr-2 mb-2 sm:mb-0 text-gray-600 flex-shrink-0" />
                <span className="text-gray-600 text-center sm:text-left">frontdesk@enjoyrealty.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 md:mt-12 pt-6 md:pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Aman Group of Companies. All rights reserved.</p>
          <p className="mt-2 text-xs">
            <Link href="/offline" className="hover:underline m3-state-layer p-1">
              Offline Access
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
