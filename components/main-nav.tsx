"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { UserGuide } from "@/components/user-guide/user-guide"

export function MainNav() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [expandedMobileItems, setExpandedMobileItems] = useState<string[]>([])

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/enjoy-realty", label: "Enjoy Realty" },
    { href: "/aman-engineering", label: "Aman Engineering" },
    {
      label: "Properties",
      items: [
        { href: "/model-houses", label: "Model Houses" },
        { href: "/ready-for-occupancy", label: "Ready For Occupancy" },
        { href: "/lot-only", label: "Lot Only" },
      ],
    },
    {
      label: "Resources",
      items: [
        { href: "/loan-calculator", label: "Loan Calculator" },
        { href: "/calendar", label: "Calendar" },
      ],
    },
    { href: "/contact", label: "Contact Us" },
  ]

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
    setExpandedMobileItems([])
  }, [pathname])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleMobileExpand = (label: string) => {
    setExpandedMobileItems((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "sticky top-0 z-30 w-full border-b bg-white transition-all duration-300",
        scrolled ? "shadow-elevation-1" : "",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center bg-primary text-primary-foreground font-bold text-xl rounded-md h-10 w-10"
              >
                A
              </motion.div>
              <span className="ml-2 font-semibold text-lg">Aman Group</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1 lg:space-x-4">
            {navItems.map((item, index) => {
              // Check if the item has a dropdown
              if (item.items) {
                return (
                  <motion.div
                    key={item.label}
                    className="relative group"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    onHoverStart={() => setHoveredItem(item.label)}
                    onHoverEnd={() => setHoveredItem(null)}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary relative px-3 py-2 rounded-md flex items-center",
                        item.items.some((subItem) => pathname.startsWith(subItem.href))
                          ? "text-primary font-semibold bg-primary/5"
                          : "text-muted-foreground hover:bg-gray-50",
                      )}
                    >
                      {item.label}
                      <motion.div
                        animate={{ rotate: hoveredItem === item.label ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </motion.div>
                    </motion.button>
                    <AnimatePresence>
                      {hoveredItem === item.label && (
                        <motion.div
                          className="absolute left-0 mt-1 w-48 rounded-md shadow-elevation-2 bg-white ring-1 ring-black ring-opacity-5 z-50"
                          initial={{ opacity: 0, y: 10, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: 10, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            {item.items.map((subItem, subIndex) => (
                              <motion.div
                                key={subItem.href}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: 0.05 * subIndex }}
                              >
                                <Link
                                  href={subItem.href}
                                  className={cn(
                                    "block px-4 py-2 text-sm hover:bg-gray-100 m3-state-layer",
                                    pathname === subItem.href ? "text-primary font-semibold" : "text-gray-700",
                                  )}
                                >
                                  {subItem.label}
                                </Link>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              }

              // Regular menu item without dropdown
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href={item.href}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary relative px-3 py-2 rounded-md m3-state-layer",
                        pathname === item.href
                          ? "text-primary font-semibold bg-primary/5"
                          : "text-muted-foreground hover:bg-gray-50",
                      )}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                </motion.div>
              )
            })}
            <UserGuide />
          </div>

          {/* Mobile Menu Button */}
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMenu}
                className="h-12 w-12 p-0 rounded-full"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
              >
                <AnimatePresence mode="wait">
                  {isMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 bg-white z-40 md:hidden overflow-y-auto"
            style={{ top: "64px", height: "calc(100vh - 64px)" }}
          >
            <div className="container mx-auto px-4 py-6 pb-32 h-full">
              <motion.div
                className="space-y-2 h-full flex flex-col"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.07 } },
                }}
              >
                {navItems.map((item) => {
                  if (item.items) {
                    const isExpanded = expandedMobileItems.includes(item.label)
                    return (
                      <motion.div
                        key={item.label}
                        className="mb-3 rounded-xl overflow-hidden border border-gray-100 shadow-sm"
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                        }}
                      >
                        <button
                          onClick={() => toggleMobileExpand(item.label)}
                          className={cn(
                            "flex items-center justify-between w-full py-4 px-5 text-lg font-medium rounded-t-xl min-h-[56px]",
                            item.items.some((subItem) => pathname.startsWith(subItem.href))
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-muted-foreground hover:bg-gray-50",
                          )}
                          aria-expanded={isExpanded}
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            className={cn(
                              "h-5 w-5 transition-transform duration-200",
                              isExpanded ? "transform rotate-180" : "",
                            )}
                          />
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="bg-gray-50 py-2">
                                {item.items.map((subItem) => (
                                  <Link
                                    key={subItem.href}
                                    href={subItem.href}
                                    className={cn(
                                      "flex items-center py-3 px-8 text-base transition-all min-h-[48px] m3-state-layer", // Added m3-state-layer
                                      pathname === subItem.href
                                        ? "text-primary font-semibold bg-primary/5"
                                        : "text-muted-foreground hover:bg-gray-100",
                                    )}
                                    onClick={() => setIsMenuOpen(false)}
                                  >
                                    {subItem.label}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  }

                  return (
                    <motion.div
                      key={item.href}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                      }}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center justify-between py-4 px-5 text-lg font-medium rounded-xl transition-all min-h-[56px] shadow-sm border border-gray-100 m3-state-layer", // Added m3-state-layer
                          pathname === item.href
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground hover:bg-gray-50",
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  )
                })}

                {/* User Guide with better spacing */}
                <motion.div
                  className="mt-auto pt-6"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                  }}
                >
                  <div className="py-4 px-5">
                    <UserGuide />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 z-30 md:hidden"
            style={{ top: "64px" }}
            onClick={toggleMenu}
          />
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
