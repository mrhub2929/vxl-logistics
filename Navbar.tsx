import React, { useState, useEffect } from "react";
import { Phone, ArrowUpRight, Menu, X, Truck, Database } from "lucide-react";

interface NavbarProps {
  onQuoteClick: () => void;
  onDashboardClick: () => void;
  showDashboardBadge: boolean;
}

export default function Navbar({ onQuoteClick, onDashboardClick, showDashboardBadge }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0B1320]/95 backdrop-blur-md border-b border-gray-800/80 shadow-lg py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-[#0E4FB5] group-hover:bg-[#FF5A1F] transition-all duration-300 shadow-md shadow-[#0E4FB5]/20">
              <Truck className="w-5 h-5 text-white" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF5A1F] rounded-full animate-ping" />
            </div>
            <div>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-black tracking-tight text-white font-sans">VXL</span>
                <span className="text-[#FF5A1F] font-bold text-xs uppercase tracking-wider">Logistics</span>
              </div>
              <p className="text-[9px] text-gray-400 font-medium tracking-wide">Reliable Transport. Since 2001</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("about")}
              className="text-gray-300 hover:text-[#FF5A1F] text-sm font-medium transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="text-gray-300 hover:text-[#FFCE00] text-sm font-medium transition-colors cursor-pointer"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("fleet")}
              className="text-gray-300 hover:text-[#FF5A1F] text-sm font-medium transition-colors cursor-pointer"
            >
              Fleet
            </button>
            <button
              onClick={() => scrollToSection("network")}
              className="text-gray-300 hover:text-[#FFCE00] text-sm font-medium transition-colors cursor-pointer"
            >
              Network Map
            </button>
            <button
              onClick={() => scrollToSection("clients")}
              className="text-gray-300 hover:text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Clients
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className="text-gray-300 hover:text-[#FFCE00] text-sm font-medium transition-colors cursor-pointer"
            >
              Reviews
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-gray-300 hover:text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Contact
            </button>
          </div>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center space-x-4">
            {/* Lead Dashboard Simulator Toggle */}
            <button
              onClick={onDashboardClick}
              className="relative flex items-center space-x-2 bg-gray-800/80 hover:bg-gray-700 hover:text-white text-gray-300 text-xs font-semibold py-2 px-3.5 rounded-lg border border-gray-700/60 transition-all duration-200"
            >
              <Database className="w-3.5 h-3.5 text-[#FFD400]" />
              <span>Operations Portal</span>
              {showDashboardBadge && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF5A1F] rounded-full" />
              )}
            </button>

            {/* Direct Call Mobile Dial */}
            <a
              href="tel:9049105678"
              className="flex items-center space-x-1.5 text-gray-300 hover:text-white text-xs font-semibold"
            >
              <Phone className="w-3.5 h-3.5 text-[#FF5A1F]" />
              <span className="hidden md:inline">Call Dispatch:</span>
              <span>+91 9049105678</span>
            </a>

            {/* Quote Action */}
            <button
              onClick={onQuoteClick}
              className="flex items-center space-x-1.5 bg-[#0E4FB5] hover:bg-[#0E4FB5]/90 text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-md hover:shadow-[#0E4FB5]/30 hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <span>Get Quote</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-3">
            <button
              onClick={onDashboardClick}
              className="relative p-2 bg-gray-800/80 rounded-lg text-gray-300"
            >
              <Database className="w-4 h-4 text-[#FFD400]" />
              {showDashboardBadge && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF5A1F] rounded-full animate-pulse" />
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0B1320] border-b border-gray-800 py-3 px-4 space-y-3 animate-fadeIn">
          <div className="space-y-1">
            <button
              onClick={() => scrollToSection("about")}
              className="block w-full text-left py-2 px-3 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-md"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("services")}
              className="block w-full text-left py-2 px-3 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-[#FF5A1F] rounded-md"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("fleet")}
              className="block w-full text-left py-2 px-3 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-md"
            >
              Fleet Spec
            </button>
            <button
              onClick={() => scrollToSection("network")}
              className="block w-full text-left py-2 px-3 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-md"
            >
              Network Hubs
            </button>
            <button
              onClick={() => scrollToSection("clients")}
              className="block w-full text-left py-2 px-3 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-md"
            >
              Clients
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className="block w-full text-left py-2 px-3 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-md"
            >
              Testimonials
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="block w-full text-left py-2 px-3 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-md"
            >
              Contact
            </button>
          </div>

          <div className="pt-3 border-t border-gray-800 space-y-2">
            <a
              href="tel:9049105678"
              className="flex items-center justify-center space-x-2 w-full py-2 px-4 rounded-md bg-gray-800 text-sm font-semibold text-white"
            >
              <Phone className="w-4 h-4 text-[#FF5A1F]" />
              <span>Call +91 9049105678</span>
            </a>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onQuoteClick();
              }}
              className="flex items-center justify-center space-x-1.5 w-full py-2.5 px-4 rounded-md bg-[#0E4FB5] text-sm font-bold text-white shadow-md"
            >
              <span>Get Custom Quote</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
