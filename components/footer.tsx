import Link from "next/link"
import { Facebook, Mail, MapPin, Phone, ExternalLink } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center bg-primary text-primary-foreground font-bold text-2xl rounded-md h-16 w-16 mb-3">
                A
              </div>
              <p className="text-gray-600 mb-4 text-center">
                Building quality homes and communities for Bicolano families since 1989.
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <Link href="https://www.facebook.com/enjoyrealty" className="text-gray-500 hover:text-primary p-2">
                {" "}
                {/* Increased touch target */}
                <Facebook className="h-6 w-6" /> {/* Slightly larger icon */}
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="mailto:frontdesk@enjoyrealty.com" className="text-gray-500 hover:text-primary p-2">
                {" "}
                {/* Increased touch target */}
                <Mail className="h-6 w-6" /> {/* Slightly larger icon */}
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>

          <div className="mt-2 sm:mt-0">
            <h3 className="text-lg font-semibold mb-4 text-center sm:text-left">Our Developers</h3>
            <ul className="space-y-3">
              <li className="text-center sm:text-left">
                <Link href="/enjoy-realty" className="text-gray-600 hover:text-primary inline-flex items-center">
                  Enjoy Realty & Development
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </li>
              <li className="text-center sm:text-left">
                <Link href="/aman-engineering" className="text-gray-600 hover:text-primary inline-flex items-center">
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
                <Link href="/model-houses" className="text-gray-600 hover:text-primary inline-flex items-center">
                  Model Houses
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </li>
              <li className="text-center sm:text-left">
                <Link href="/ready-for-occupancy" className="text-gray-600 hover:text-primary inline-flex items-center">
                  Ready For Occupancy
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </li>
              <li className="text-center sm:text-left">
                <Link href="/loan-calculator" className="text-gray-600 hover:text-primary inline-flex items-center">
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
                <MapPin className="h-5 w-5 mr-0 sm:mr-2 mb-2 sm:mb-0 text-gray-600" />
                <span className="text-gray-600 text-center sm:text-left">
                  Aman Corporate Center, Zone 6, San Felipe, Naga City, Camarines Sur, Philippines
                </span>
              </li>
              <li className="flex flex-col sm:flex-row items-center sm:items-start">
                <Phone className="h-5 w-5 mr-0 sm:mr-2 mb-2 sm:mb-0 text-gray-600" />
                <span className="text-gray-600 text-center sm:text-left">(054) 884-5188 | (Smart) 09296083744​ </span>
              </li>
              <li className="flex flex-col sm:flex-row items-center sm:items-start">
                <Mail className="h-5 w-5 mr-0 sm:mr-2 mb-2 sm:mb-0 text-gray-600" />
                <span className="text-gray-600 text-center sm:text-left">frontdesk@enjoyrealty.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 md:mt-12 pt-6 md:pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Aman Group of Companies. All rights reserved.</p>
          <p className="mt-2 text-xs">
            <Link href="/offline" className="hover:underline">
              Offline Access
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
