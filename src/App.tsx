/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Truck,
  Shield,
  Clock,
  Activity,
  MapPin,
  TrendingUp,
  Globe,
  CheckCircle2,
  Phone,
  Mail,
  FileText,
  ChevronRight,
  Send,
  MessageSquare,
  Loader2,
  Download,
  Search,
  Briefcase,
  X,
  Target,
  ArrowUpRight,
  Sparkles,
  Layers,
  Zap,
  Star,
  Users,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  Eye,
  Check,
  AlertCircle
} from "lucide-react";
import Navbar from "./components/Navbar";
import { STATS, SERVICES, FLEET, CLIENTS, TESTIMONIALS, MAP_HUBS } from "./data";
import { FleetVehicle, LogisticsService, EnquiryData } from "./types";

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedHub, setSelectedHub] = useState<any>(MAP_HUBS[0]);
  const [selectedFleet, setSelectedFleet] = useState<FleetVehicle>(FLEET[0]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Quote form state
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    origin: "",
    destination: "",
    vehicleRequirement: FLEET[0].name,
    message: ""
  });
  const [formIsSubmitting, setFormIsSubmitting] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // Enquiries list & Simulated database
  const [enquiries, setEnquiries] = useState<EnquiryData[]>([]);
  const [isRefreshingEnquiries, setIsRefreshingEnquiries] = useState(false);
  const [showDashboardBadge, setShowDashboardBadge] = useState(true);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Search/Telemetry Tracking panel state
  const [trackingId, setTrackingId] = useState("");
  const [activeTrackingResult, setActiveTrackingResult] = useState<any>(null);
  const [trackingError, setTrackingError] = useState("");

  // Chatbot states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "model"; content: string }>>([
    {
      role: "model",
      content: "Welcome to VXL Logistics India! 🚛 I am your AI Dispatch Assistant. Let me help you with shipment inquiries, vehicle specifications, or pan-India routes. To provide a quotation, what describes your transport route or cargo?"
    }
  ]);
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Fetch enquiries on mount and periodic interval
  const fetchEnquiries = async (quiet = false) => {
    if (!quiet) setIsRefreshingEnquiries(true);
    try {
      const res = await fetch("/api/enquiries");
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data);
      }
    } catch (e) {
      console.error("Failed to load real-time enquiries from Server:", e);
    } finally {
      if (!quiet) setIsRefreshingEnquiries(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
    const interval = setInterval(() => fetchEnquiries(true), 15000); // refresh quietly
    return () => clearInterval(interval);
  }, []);

  // Scroll to chatbot bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatTyping, isChatOpen]);

  // Submit quote form handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Name and Phone number are required to submit an official enquiry.");
      return;
    }
    setFormIsSubmitting(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, source: "Form" })
      });
      if (res.ok) {
        setFormData({
          name: "",
          company: "",
          phone: "",
          email: "",
          origin: "",
          destination: "",
          vehicleRequirement: FLEET[0].name,
          message: ""
        });
        setFormSuccessMessage("Your freight inquiry has been registered instantly into our dispatch queue. Our Pune desk will contact you via WhatsApp / Call shortly.");
        setShowDashboardBadge(true);
        fetchEnquiries();
        setTimeout(() => setFormSuccessMessage(null), 8000);
      }
    } catch (err) {
      console.error("Failed to submit freight quote:", err);
    } finally {
      setFormIsSubmitting(false);
    }
  };

  // Submit chat handler (connected to real Gemini proxy service)
  const handleChatSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatInput("");
    
    // Append user message immediately
    const updatedMessages = [...chatMessages, { role: "user" as const, content: userText }];
    setChatMessages(updatedMessages);
    setIsChatTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      });
      if (res.ok) {
        const reply = await res.json();
        setChatMessages(prev => [...prev, { role: "model", content: reply.text }]);
        
        // Smart lead extraction check: If the chatbot output suggests booking/enquiry creation we can trigger updates
        if (userText.toLowerCase().includes("phone") || userText.length > 8 && /\b\d{10}\b/.test(userText)) {
          // Quietly update enquiries list to keep real-time UI robust
          setTimeout(() => fetchEnquiries(true), 2000);
        }
      } else {
        throw new Error("Chatbot failed");
      }
    } catch (err) {
      console.error("Failed chat proxy response:", err);
      // Beautiful local backup
      setChatMessages(prev => [
        ...prev,
        {
          role: "model",
          content: "Acknowledged! System registered your route interest. Please dial +91 9049105678 or click the WhatsApp link to secure spot vehicle availability with our Pune dispatch managers immediately."
        }
      ]);
    } finally {
      setIsChatTyping(false);
    }
  };

  // Tracking query handler
  const handleTrackingSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingError("");
    setActiveTrackingResult(null);

    const q = trackingId.trim().toUpperCase();
    if (!q) {
      setTrackingError("Please enter a valid Shipment / Container Tracker ID.");
      return;
    }

    // Match simulated patterns or actual existing enquiries
    const isEnqFormat = q.startsWith("ENQ-");
    const matchedEnq = enquiries.find(item => item.id?.toUpperCase() === q);

    if (matchedEnq) {
      setActiveTrackingResult({
        id: matchedEnq.id,
        origin: matchedEnq.origin,
        destination: matchedEnq.destination,
        vehicle: matchedEnq.vehicleRequirement,
        status: matchedEnq.status || "Pending",
        lastUpdate: matchedEnq.timestamp,
        driver: "VXL Assigned Dispatcher",
        lat: 18.5204,
        lng: 73.8567,
        milestones: [
          { label: "Fleet Allocated", done: true, time: matchedEnq.timestamp },
          { label: "Chakan Depot Exit", done: matchedEnq.status !== "Pending", time: "Pending Departure" },
          { label: "In Transit Corridor", done: matchedEnq.status === "In Transit" || matchedEnq.status === "Completed", time: "Active telemetry" },
          { label: "Destination Deliver", done: matchedEnq.status === "Completed", time: "POD Pending" }
        ]
      });
    } else {
      // Simulate general VXL system trackers matching search queries
      const numericPart = q.replace(/[^0-9]/g, "");
      const finalNum = numericPart ? parseInt(numericPart, 10) : 782;
      const statuses = ["In Transit", "Pending", "Completed", "Assigned"];
      const chosenStatus = statuses[finalNum % statuses.length];

      setActiveTrackingResult({
        id: `VXL-${finalNum || "782"}`,
        origin: finalNum % 2 === 0 ? "Chakan Industrial Zone, Pune" : "Murbad Manufacturing Area",
        destination: finalNum % 3 === 0 ? "Kathmandu Gateway, Nepal Border" : "JNPT Terminal 2, Mumbai",
        vehicle: "32ft Secure Container Chassis",
        status: chosenStatus,
        lastUpdate: "Today, 11:24 AM",
        driver: "Sanjeev Kumar (verified double-relay)",
        lat: 22.0,
        lng: 77.0,
        milestones: [
          { label: "Inquiry Registered", done: true, time: "Yesterday, 04:30 PM" },
          { label: "Vehicle Inspected @ Pune HQ", done: true, time: "Today, 02:00 AM" },
          { label: "Dispatched (Corridor Road)", done: chosenStatus === "In Transit" || chosenStatus === "Completed", time: "Today, 06:15 AM" },
          { label: "Completed Gates / Border", done: chosenStatus === "Completed", time: "Awaiting POD signature" }
        ]
      });
    }
  };

  // Fast scrolling to section helper
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  // Mock downloading digital documents (Company Profile)
  const handleDownloadProfile = () => {
    // Elegant system feedback download trigger simulation
    alert("VXL Logistics Profile PDF is ready to load. Generating brochure with complete 2026 fleet specifications & FTL route catalogs under Pune/Chakan registry...");
    const link = document.createElement("a");
    link.href = "#";
    // We could direct to an actual asset, but simulating is elegant
    console.log("Initiating VXL-Logistics-Brochure-2026.pdf stream.");
  };

  const filteredServices = activeTab === "all" 
    ? SERVICES 
    : SERVICES.filter(s => s.id.includes(activeTab) || s.title.toLowerCase().includes(activeTab) || s.industryApplicability.toLowerCase().includes(activeTab));

  return (
    <div id="vxl-site-root" className="min-h-screen bg-[#0B1320] text-gray-100 font-sans selection:bg-[#FF5A1F] selection:text-white">
      
      {/* Top Banner Alert */}
      <div className="bg-[#0E4FB5] text-white py-2 text-xs font-semibold px-4 text-center border-b border-blue-700 relative z-50 flex items-center justify-center space-x-2">
        <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
        <span>VXL Operations Alert: Dedicated container slots for North-India & Nepal routes are active for June 2026 scheduling.</span>
        <button onClick={() => scrollToId("quote")} className="hover:underline font-bold text-[#FFD400] flex items-center space-x-1 pl-2">
          <span>Book Now</span> 
          <ArrowUpRight className="w-3.5 h-3.5 inline" />
        </button>
      </div>

      {/* Embedded Component - Header Navbar */}
      <Navbar 
        onQuoteClick={() => scrollToId("quote")} 
        onDashboardClick={() => {
          setIsDashboardOpen(true);
          setShowDashboardBadge(false);
        }}
        showDashboardBadge={showDashboardBadge}
      />

      {/* HERO SECTION with live cinematic layout */}
      <section id="hero" className="relative h-screen min-h-[750px] flex items-center justify-center overflow-hidden">
        {/* Full-width premium background video mockup representation / Dynamic dark geometric flow */}
        <div className="absolute inset-0 z-0 bg-[#070D18]">
          {/* Animated SVG lines grid overlay representing road networks */}
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
          
          {/* Moving highway visual effects representation - Cinematic background backdrop photo */}
          <img
            src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=1920"
            alt="Dynamic Logistics operations at night"
            className="w-full h-full object-cover opacity-20 mix-blend-color-dodge transition-opacity duration-1000 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1320] via-[#0B1320]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1320]/90 via-transparent to-[#0B1320]/90" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 bg-gray-800/80 border border-gray-700 rounded-full py-1.5 px-4.5 text-xs text-[#FFCE00] font-semibold tracking-wide">
                <span className="flex h-2 w-2 rounded-full bg-[#FF5A1F] animate-pulse" />
                <span>24+ Years of Industry Trust: Since 2001</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6.5xl font-black tracking-tight text-white leading-tight">
                Powering India's <span className="text-[#FF5A1F] block sm:inline">Supply Chain</span> with Speed & Safety
              </h1>

              <p className="text-lg text-gray-300 max-w-xl font-normal leading-relaxed">
                Pan-India networks and trusted cross-border transportation to Nepal. Serving the automotive, FMCG, cold-chain, and heavy engineering sectors with digital consignment tracking.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => scrollToId("quote")}
                  className="bg-[#0E4FB5] hover:bg-[#0E4FB5]/90 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-blue-900/40 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 text-center flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Build Quotation</span>
                  <ArrowUpRight className="w-5 h-5 text-gray-100" />
                </button>

                <a
                  href="tel:9049105678"
                  className="bg-[#FF5A1F] hover:bg-[#FF5A1F]/90 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-amber-900/30 transition-all transform hover:-translate-y-0.5 text-center flex items-center justify-center space-x-2"
                >
                  <Phone className="w-5 h-5 text-white" />
                  <span>Call Dispatch (Chakan)</span>
                </a>

                <button
                  onClick={handleDownloadProfile}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 font-semibold py-4 px-6 rounded-xl transition-all text-center flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5 text-gray-400" />
                  <span>Brochure</span>
                </button>
              </div>

              {/* Mini trust checklist indicators */}
              <div className="pt-6 grid grid-cols-3 gap-3 border-t border-gray-800/90 max-w-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FFD400]" />
                  <span className="text-xs text-gray-300 font-medium">GPS Tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FFD400]" />
                  <span className="text-xs text-gray-300 font-medium">Digital PODs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FFD400]" />
                  <span className="text-xs text-gray-300 font-medium">Nepal Borders</span>
                </div>
              </div>
            </div>

            {/* Hero Right Widget - Fast Live Shipment Tracker Simulation */}
            <div className="lg:col-span-5">
              <div className="bg-[#121D2F]/90 border border-gray-800/80 rounded-2xl p-6 shadow-2xl relative">
                {/* Visual Glassmorphism effects */}
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-[#FF5A1F] to-[#FFD400] rounded-full blur-md opacity-40" />

                <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-5">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center font-bold text-[#FFD400]">
                      TRK
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Consignment Tracker</h3>
                      <p className="text-[10px] text-gray-400">Integrated GPS Telemetry Verification</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 py-1 px-2.5 rounded-full flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live Portal</span>
                  </span>
                </div>

                <form onSubmit={handleTrackingSearch} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">Consignment ID / Booking ID</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g., ENQ-1024 or VXL-782"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                        className="w-full bg-[#070D18] border border-gray-800 rounded-xl py-3 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-[#0E4FB5] text-white font-mono placeholder:text-gray-600"
                        id="tracking-input-field"
                      />
                      <button type="submit" className="absolute right-2.5 top-2.5 p-1 text-[#FFD400] hover:text-[#FF5A1F] transition-colors">
                        <Search className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">Hint: Submit the quote form below or use mock ID: <span className="font-mono text-[#FFD400]">ENQ-1024</span> or <span className="font-mono text-[#FFD400]">VXL-100</span></p>
                  </div>

                  {trackingError && (
                    <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-lg text-xs text-red-300 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{trackingError}</span>
                    </div>
                  )}

                  {activeTrackingResult && (
                    <div className="mt-4 p-4 bg-[#070D18]/90 border border-gray-800 rounded-xl space-y-3.5 animate-slideUp">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-gray-400">ID: {activeTrackingResult.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                          activeTrackingResult.status === "Pending" ? "bg-amber-400/10 text-amber-300" :
                          activeTrackingResult.status === "In Transit" ? "bg-blue-400/10 text-blue-300 animate-pulse" :
                          activeTrackingResult.status === "Completed" ? "bg-emerald-400/10 text-emerald-300" :
                          "bg-purple-400/10 text-purple-300"
                        }`}>
                          {activeTrackingResult.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-y border-gray-800 py-2.5">
                        <div>
                          <p className="text-[9px] text-gray-500">ORIGIN HUB</p>
                          <p className="font-bold text-gray-200 truncate">{activeTrackingResult.origin}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-500">DESTINATION</p>
                          <p className="font-bold text-[#FFD400] truncate">{activeTrackingResult.destination}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] text-gray-400 font-semibold mb-1">REAL-TIME Corridor Milestones</p>
                        <div className="flex justify-between relative pl-2 border-l border-gray-800 space-y-2.5 flex-col">
                          {activeTrackingResult.milestones.map((m: any, idx: number) => (
                            <div key={idx} className="flex items-start space-x-2 relative">
                              <span className={`absolute -left-[13px] w-2 h-2 rounded-full ${m.done ? "bg-[#FF5A1F]" : "bg-gray-800 border border-gray-700"}`} />
                              <div>
                                <p className={`text-[11px] leading-none ${m.done ? "text-gray-100 font-semibold" : "text-gray-500"}`}>{m.label}</p>
                                <p className="text-[9px] text-gray-500">{m.time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 text-center border-t border-gray-800 flex items-center justify-between text-[10px] text-gray-400">
                        <span>Relay Pilot: <strong className="text-gray-200">{activeTrackingResult.driver}</strong></span>
                        <button
                          type="button"
                          onClick={() => alert(`Connecting live satellite feed to active carrier ${activeTrackingResult.id}...`)}
                          className="text-[#FF5A1F] hover:underline"
                        >
                          Satellite Link
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => scrollToId("services")}
                    className="w-full bg-gray-800/80 hover:bg-gray-800 text-gray-300 border border-gray-700 text-xs py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <span>Analyze Fleet Options & Capabilities</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>

        {/* Scroll action prompt */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-1 z-10 cursor-pointer" onClick={() => scrollToId("about")}>
          <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Excellence Journey</span>
          <div className="w-5 h-9 rounded-full border-2 border-gray-700 p-1 flex justify-center">
            <div className="w-1.5 h-2.5 bg-[#FF5A1F] rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* CORE STATS BANNER */}
      <section className="bg-gradient-to-r from-[#0E4FB5]/20 via-[#0B1320] to-[#FF5A1F]/10 py-10 border-y border-gray-800/90 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center text-center">
            {STATS.map((s, idx) => (
              <div key={idx} className="space-y-1.5 group p-2">
                <div className="text-3xl sm:text-4.5xl font-black text-white group-hover:text-[#FF5A1F] transition-colors duration-300">
                  {s.value}
                </div>
                <div className="text-sm font-bold text-gray-200 uppercase tracking-wide">
                  {s.label}
                </div>
                <p className="text-[10px] text-gray-400 leading-snug">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DETAILED ABOUT SECTION */}
      <section id="about" className="py-24 bg-[#0B1320] border-b border-gray-800/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Visual Logistics collage layout representing Pune headquarters operations */}
            <div className="grid grid-cols-2 gap-4 relative">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden hover:scale-103 transition-transform duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=600"
                    alt="Corporate logistics supply depot Pune"
                    className="w-full h-48 object-cover grayscale opacity-80 hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                <div className="p-6 bg-gradient-to-br from-[#0E4FB5] to-[#0A3D8B] rounded-2xl text-white space-y-2">
                  <Activity className="w-8 h-8 text-[#FFCE00] animate-pulse" />
                  <h4 className="text-md font-bold">Pan-India Integration</h4>
                  <p className="text-xs text-blue-100">Direct logistics pathways traversing major manufacturing nodes across India and Nepal boundaries.</p>
                </div>
              </div>

              <div className="space-y-4 pt-8">
                <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF5A1F]/10 rounded-bl-full" />
                  <span className="text-3xl font-black text-[#FF5A1F]">24Y</span>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#FFCE00] mt-1">Operational Shelf</h4>
                  <p className="text-xs text-gray-300 mt-2">Serving manufacturing hubs out of Pune Maharashtra since year 2001 with unwavering safe transit metrics.</p>
                </div>
                <div className="rounded-2xl overflow-hidden hover:scale-103 transition-transform duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&q=80&w=600"
                    alt="Large transport containers dispatch"
                    className="w-full h-48 object-cover grayscale opacity-85 hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* About text segment */}
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-gray-900 border border-gray-800 text-[#FF5A1F] text-xs font-bold tracking-wide rounded-full py-1.5 px-4.5">
                <span>VXL LOGISTICS PROFILE</span>
              </div>

              <h2 className="text-3xl sm:text-4.5xl font-black tracking-tight text-white leading-tight">
                24+ Years of Specialized Industrial Transport Excellence
              </h2>

              <p className="text-gray-300 leading-relaxed text-sm.5">
                VXL Logistics has been Pune's stellar transport partner since 2001. Headquartered in Chakan (Chimbali Phata), the most intensive manufacturing corridor in Western India, we align custom trailer options, temperature-controlled modules, and double-driver logistics assets to address high-demand industrial requirements.
              </p>

              {/* Grid of details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="flex space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#0E4FB5]/10 flex items-center justify-center text-[#0E4FB5] shrink-0 border border-[#0E4FB5]/20">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Full Freight Protection</h4>
                    <p className="text-xs text-gray-400 mt-1">Insured goods movement with strict zero-accident and minimal-handling procedures.</p>
                  </div>
                </div>

                <div className="flex space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#FF5A1F]/10 flex items-center justify-center text-[#FF5A1F] shrink-0 border border-[#FF5A1F]/20">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Optimized Lead-Time</h4>
                    <p className="text-xs text-gray-400 mt-1">Dual-driver continuous relays running priority timelines for key FMCG & Dairy partners.</p>
                  </div>
                </div>

                <div className="flex space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#FFD400]/10 flex items-center justify-center text-[#FFD400] shrink-0 border border-[#FFD400]/20">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Nepal Border Logistics</h4>
                    <p className="text-xs text-gray-400 mt-1">Strong cross-border custom coordination and bilateral license safety profiles.</p>
                  </div>
                </div>

                <div className="flex space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Food-Grade Sanitized</h4>
                    <p className="text-xs text-gray-400 mt-1">Insulated vehicle floors strictly customized for confectionery and dairy bulk commodities.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => scrollToId("quote")}
                  className="bg-[#0e4fb5] text-white font-bold py-3 px-6 rounded-xl text-center text-xs tracking-wider uppercase hover:bg-opacity-95"
                >
                  Configure Transit Pipeline
                </button>
                <div className="flex items-center space-x-3 pl-2">
                  <div className="h-2 w-2 rounded-full bg-[#FF5A1F] animate-ping" />
                  <span className="text-xs text-gray-400 font-semibold uppercase">Daily Pune dispatch active</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* CORE LOGISTICS SERVICES SECTION */}
      <section id="services" className="py-24 bg-gradient-to-b from-[#0B1320] to-[#070D18] border-b border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-[#FF5A1F] text-xs font-bold uppercase tracking-wider block">CAPABILITIES PORTFOLIO</span>
            <h2 className="text-3xl sm:text-4.5xl font-black text-white tracking-tight">
              Enterprise-Grade Transport Ecosystems
            </h2>
            <p className="text-gray-300 text-sm">
              We leverage modern fleet parameters and customized configurations to offer full freight utility to heavy industrial manufacturers and consumer goods leaders across the nation.
            </p>

            {/* Interactive Tab Selectors for Faster Navigation */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
              {[
                { label: "All Cargo Solutions", key: "all" },
                { label: "Truck Load (FTL/PTL)", key: "truck" },
                { label: "Specialized (ODC/Heavy)", key: "odc" },
                { label: "FMCG / Dairy & Food", key: "food" },
                { label: "Pharma / High Care", key: "pharma" }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab.key 
                      ? "bg-[#0E4FB5] text-white shadow-md shadow-[#0E4FB5]/20" 
                      : "bg-[#121D2F] hover:bg-gray-800 text-gray-300 border border-gray-800/80"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Service Cards with Hover Accent Lights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service, index) => {
              return (
                <div
                  key={service.id}
                  className="bg-[#121D2F]/80 p-6 rounded-2xl border border-gray-800/70 hover:border-[#FF5A1F]/50 transition-all duration-300 hover:-translate-y-1 relative group overflow-hidden"
                  id={`service-${service.id}`}
                >
                  {/* Decorative corner flash glow */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#0E4FB5]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Top Header Grid */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-900/90 border border-gray-800 flex items-center justify-center text-[#FFD400] group-hover:text-white group-hover:bg-[#FF5A1F] transition-all duration-300">
                      {/* Dynamic Render Icon matching service type */}
                      {service.id === "ftl" && <Truck className="w-5.5 h-5.5" />}
                      {service.id === "ptl" && <Layers className="w-5.5 h-5.5" />}
                      {service.id === "odc" && <Shield className="w-5.5 h-5.5" />}
                      {service.id === "food-grade" && <Check className="w-5.5 h-5.5" />}
                      {service.id === "pharma" && <Zap className="w-5.5 h-5.5" />}
                      {service.id === "express-cargo" && <TrendingUp className="w-5.5 h-5.5" />}
                      {service.id === "industrial" && <Briefcase className="w-5.5 h-5.5" />}
                      {service.id === "cross-border" && <Globe className="w-5.5 h-5.5" />}
                      {service.id === "supply-chain" && <Activity className="w-5.5 h-5.5" />}
                      {service.id === "gps-tracked" && <MapPin className="w-5.5 h-5.5" />}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                      VXL #{index + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#FFD400] transition-colors mb-2.5">
                    {service.title}
                  </h3>

                  <p className="text-xs text-gray-300 leading-relaxed mb-4 min-h-[50px]">
                    {service.description}
                  </p>

                  {/* Highlights Bullet List */}
                  <div className="space-y-1.5 border-t border-gray-800/80 pt-4 mb-4">
                    {service.benefits.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-center space-x-2 text-[11px] text-gray-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5A1F]" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  {/* Applicability pill */}
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-500">Applicability:</span>
                    <span className="bg-gray-800/80 text-gray-300 font-medium py-1 px-2.5 rounded-md">
                      {service.industryApplicability}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick CTA banner inside service section */}
          <div className="bg-[#121D2F]/70 border border-gray-800 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 mt-16 max-w-5xl mx-auto">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="text-md sm:text-lg font-bold text-white">Need a combination of Food-Grade & GPS tracking?</h4>
              <p className="text-xs text-gray-400">We construct custom logistics covenants for milk factories, confectioners, and manufacturing chains in Pune/Chakan.</p>
            </div>
            <button
              onClick={() => scrollToId("quote")}
              className="bg-[#FF5A1F] hover:bg-[#FF5A1F]/90 text-white font-bold text-xs py-3.5 px-6 rounded-lg uppercase tracking-wider transition-all shadow-md shadow-orange-950/20"
            >
              Consult Pune Manager
            </button>
          </div>

        </div>
      </section>

      {/* REVOLUTIONARY FLEET SPECIFICATION SECTION */}
      <section id="fleet" className="py-24 bg-[#0B1320] border-b border-gray-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-[#FF5A1F] text-xs font-bold uppercase tracking-widest pl-1 block">VXL DISPATCH FLEET</span>
              <h2 className="text-3xl sm:text-4.5xl font-black text-white tracking-tight leading-tight">
                High-Asset Heavy Vehicle Selection
              </h2>
              <p className="text-gray-300 text-sm">
                Explore real load specifications, precise dimensional footprints, and structural features of our multi-axle tankers, container cabins, and ODC rigs.
              </p>
            </div>
            
            {/* Horizontal specification navigation */}
            <div className="lg:col-span-6">
              <div className="flex flex-wrap lg:justify-end gap-2">
                {FLEET.map(vehicle => (
                  <button
                    key={vehicle.id}
                    onClick={() => setSelectedFleet(vehicle)}
                    className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedFleet.id === vehicle.id 
                        ? "bg-[#FF5A1F] text-white" 
                        : "bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800"
                    }`}
                  >
                    {vehicle.category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Target Active Vehicle Spec Board */}
          <div className="bg-[#121D2F]/90 border border-gray-800/80 rounded-2xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              
              {/* Vehicle Visual */}
              <div className="lg:col-span-5 h-[340px] lg:h-auto min-h-[300px] relative overflow-hidden bg-gray-950/60">
                <img
                  src={selectedFleet.imageUrl}
                  alt={selectedFleet.name}
                  className="w-full h-full object-cover mix-blend-lighten scale-102 hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121D2F] via-[#121D2F]/30 to-transparent" />
                
                {/* Tech indicator card overlaid */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#070D18]/90 border border-gray-850 p-4 rounded-xl">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-gray-400 font-semibold uppercase tracking-wider">Fleet Registry Code</span>
                    <span className="text-emerald-400 font-bold font-mono">ACTIVE (Pune)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">Live Status Telemetry</span>
                    <span className="font-mono text-[#FFD400]">Linked satellite tracker online</span>
                  </div>
                </div>
              </div>

              {/* Specs detailed layout */}
              <div className="lg:col-span-7 p-8 space-y-6">
                <div>
                  <span className="bg-[#0E4FB5]/10 text-[#0E4FB5] text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full border border-[#0E4FB5]/20">
                    {selectedFleet.category} Category Standard
                  </span>
                  <h3 className="text-2xl font-black text-white mt-2.5 tracking-tight">
                    {selectedFleet.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Insured transport asset with digital lock handles & pneumatic brake systems.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-gray-800">
                  <div className="p-3 bg-gray-900/50 rounded-xl">
                    <p className="text-[10px] text-gray-500 font-semibold uppercase">Payload Weight</p>
                    <p className="text-sm font-bold text-white mt-1">{selectedFleet.capacity}</p>
                  </div>
                  <div className="p-3 bg-gray-900/50 rounded-xl">
                    <p className="text-[10px] text-gray-500 font-semibold uppercase">Bed Dimensions</p>
                    <p className="text-xs font-bold text-[#FFD400] mt-1.5 font-mono">{selectedFleet.dimensions}</p>
                  </div>
                  <div className="p-3 bg-gray-900/50 rounded-xl col-span-2">
                    <p className="text-[10px] text-gray-500 font-semibold uppercase">Primary Transit Sector</p>
                    <p className="text-xs font-bold text-gray-200 mt-1.5">{selectedFleet.primaryUse}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2.5">
                    Vehicle Engineering & Safety Shield
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {selectedFleet.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center space-x-2.5 bg-gray-900/30 p-2.5 rounded-lg border border-gray-800/80">
                        <CheckCircle2 className="w-4 h-4 text-[#FF5A1F]" />
                        <span className="text-xs text-gray-300 font-medium">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, vehicleRequirement: selectedFleet.name }));
                      scrollToId("quote");
                    }}
                    className="w-full sm:w-auto bg-[#0E4FB5] hover:bg-[#0E4FB5]/90 text-white text-xs font-bold py-3 px-6 rounded-lg uppercase tracking-wider transition-colors"
                  >
                    Select vehicle for quotation
                  </button>
                  <p className="text-[11px] text-gray-500 text-center sm:text-right">
                    *Trained drivers certified with multi-state heavy vehicle licenses.
                  </p>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* TECHNOLOGY & LIVE TELEMETRY INTERACTIVE PANEL */}
      <section className="py-24 bg-[#070D18] border-b border-gray-800/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Tech Left description */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[#FF5A1F] text-xs font-black uppercase tracking-wider">TECTONIC REAL-TIME COVENANT</span>
              <h2 className="text-3xl sm:text-4.5xl font-black text-white tracking-tight">
                VXL Smart Fleet Technology Engine
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                Rather than relying on analog courier notes, VXL Logistics maintains full GPS synchronization and instant Digital Proof of Delivery (POD) confirmations. This keeps our Pune operations command instantly aligned with destination depots nationwide.
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-[#FFCE00] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Dedicated GPS Transceivers</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Real-time coordinates mapped on secure satellite streams accessible by partners.</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl flex items-start space-x-3">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Instant Digital POD</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Proof-of-delivery signatures are verified and uploaded within minutes of arrival.</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl flex items-start space-x-3">
                  <Activity className="w-5 h-5 text-[#FF5A1F] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Future Fleet Integration Dashboard</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Check actual live pipeline in container grids via our real-time portal widget.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* High-End Tech Visual Interface / Telemetry console mockup */}
            <div className="lg:col-span-7">
              <div className="bg-[#121D2F] border border-gray-800/80 rounded-2xl p-6.5 shadow-2xl font-mono">
                
                {/* Console header */}
                <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4.5 text-xs text-gray-400">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-gray-300">VXL-TELEMETRY-MAIN: ONLINE</span>
                  </div>
                  <span className="text-gray-500">Chakan Base: 18.5204° N, 73.8567° E</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-300">
                  <div className="p-4 bg-[#070D18] rounded-xl border border-gray-800 space-y-2">
                    <p className="text-gray-500 uppercase tracking-wider text-[9px]">SATELLITE SYNC ACCURACY</p>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-bold text-white">99.84%</span>
                      <span className="text-emerald-400 font-semibold">Excellent</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#FF5A1F] h-full rounded-full" style={{ width: "99.8%" }} />
                    </div>
                  </div>

                  <div className="p-4 bg-[#070D18] rounded-xl border border-gray-800 space-y-2">
                    <p className="text-gray-500 uppercase tracking-wider text-[9px]">COMPLETED RUN CORRIDORS</p>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-bold text-white">10,284</span>
                      <span className="text-[#FFD400] font-semibold">+42 Today</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#0E4FB5] h-full rounded-full" style={{ width: "85%" }} />
                    </div>
                  </div>
                </div>

                {/* Simulated Telemetry Log Grid */}
                <div className="mt-5 bg-[#070D18] border border-gray-850 p-4 rounded-xl">
                  <h4 className="text-[10px] text-gray-500 uppercase font-black mb-3">Satellite Telemetry Hub Stream</h4>
                  
                  <div className="space-y-3.5 text-[11px] text-gray-400">
                    <div className="flex items-start justify-between">
                      <span className="text-[#FF5A1F] font-bold shrink-0">[14:02:10]</span>
                      <span className="flex-1 pl-2.5 truncate">Chakan Dispatch: 32ft container leaving to Kathmandu Nepal border.</span>
                      <span className="text-emerald-500 shrink-0 pl-1">GPS OK</span>
                    </div>
                    
                    <div className="flex items-start justify-between">
                      <span className="text-[#FF5A1F] font-bold shrink-0">[13:50:42]</span>
                      <span className="flex-1 pl-2.5 truncate">Govind Milk: Food grade carrier completed sanitization certification.</span>
                      <span className="text-[#FFCE00] shrink-0 pl-1">VERIFIED</span>
                    </div>

                    <div className="flex items-start justify-between">
                      <span className="text-[#FF5A1F] font-bold shrink-0">[12:15:01]</span>
                      <span className="flex-1 pl-2.5 truncate">Morde Chocolates: Scheduled bulk confectionery raw shipping.</span>
                      <span className="text-blue-400 shrink-0 pl-1">ASSIGNED</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">Telemetry engine v4.12 stable</span>
                  <button
                    onClick={() => {
                      setIsDashboardOpen(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }} 
                    className="text-xs bg-[#FF5A1F] text-white py-1.5 px-3.5 rounded-md hover:bg-opacity-90 font-bold transition-all text-center tracking-wide flex items-center space-x-1"
                  >
                    <span>Run Fleet Portal</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CLIENTS MARQUEE SECTION */}
      <section id="clients" className="py-20 bg-[#0B1320] border-b border-gray-800/60 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0B1320] to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0B1320] to-transparent z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
          <span className="text-[#FFD400] text-xs font-black uppercase tracking-wider block">ENTERPRISE CONFIDENCE</span>
          <h2 className="text-2xl sm:text-3.5xl font-black text-white tracking-tight mt-1.5">
            Trusted by Industry Leaders Across India
          </h2>
          <p className="text-gray-405 text-xs max-w-lg mx-auto mt-1">Partnerships nurtured with leading manufacturers, dairy plants and heavy OEMs since 2001.</p>
        </div>

        {/* Dynamic Client Grid Representing Marquee speed */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {CLIENTS.map((client, idx) => (
              <div
                key={idx}
                className="bg-[#121D2F] border border-gray-850 p-4.5 rounded-xl text-center flex flex-col justify-center items-center hover:border-[#0E4FB5] hover:scale-103 transition-all duration-300"
              >
                <div className="text-white font-black text-sm uppercase tracking-wide group-hover:text-[#FF5A1F]">
                  {client.name}
                </div>
                <span className="text-[9px] text-[#FFD400] font-medium tracking-widest uppercase mt-1">
                  {client.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US GRID */}
      <section className="py-24 bg-[#070D18] border-b border-gray-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <span className="text-[#FF5A1F] text-xs font-black uppercase tracking-wider">WHY CHOOSE VXL</span>
          <h2 className="text-3xl sm:text-4.5xl font-black text-white tracking-tight mt-1">
            Uncompromising Standards. Every Consignment.
          </h2>
          <p className="text-gray-300 text-xs.5 max-w-xl mx-auto mt-2">Our corporate pledge centers around absolute container safety, route viability optimization, and responsive dispatch.</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <div className="bg-gradient-to-b from-[#121D2F]/80 to-gray-950 p-6 rounded-xl border border-gray-850">
              <span className="text-2xl font-black text-[#FFD400]">01</span>
              <h4 className="text-md font-bold text-white mt-1">24+ Years Industry Pedigree</h4>
              <p className="text-xs text-gray-400 mt-2">Established in 2001, we possess native familiarity navigating custom border checking checkpoints, state limits regulations, and local permit demands cleanly.</p>
            </div>

            <div className="bg-gradient-to-b from-[#121D2F]/80 to-gray-950 p-6 rounded-xl border border-gray-850">
              <span className="text-2xl font-black text-[#FF5A1F]">02</span>
              <h4 className="text-md font-bold text-white mt-1">Direct Nepal Corridor</h4>
              <p className="text-xs text-gray-400 mt-2">Custom broker integration at Raxaul, Birgunj, Bhairahawa, and Biratnagar to ensure uninterrupted container entry into Nepal's central nodes.</p>
            </div>

            <div className="bg-gradient-to-b from-[#121D2F]/80 to-gray-950 p-6 rounded-xl border border-gray-850">
              <span className="text-2xl font-black text-emerald-400">03</span>
              <h4 className="text-md font-bold text-white mt-1">Strict Food-Grade Insulated Wagon Cabinets</h4>
              <p className="text-xs text-gray-400 mt-2">Wagon models specifically clean-swept for FMCG, chocolate compounds raw materials, and fresh milk cargos to ensure zero-contamination.</p>
            </div>

            <div className="bg-gradient-to-b from-[#121D2F]/80 to-gray-950 p-6 rounded-xl border border-gray-850">
              <span className="text-2xl font-black text-[#0E4FB5]">04</span>
              <h4 className="text-md font-bold text-white mt-1">99% Fleet Availability</h4>
              <p className="text-xs text-gray-400 mt-2">A versatile standby fleet based in Pune, Chakan and major sub-stations prevents logistics delays, guaranteeing replacement vehicles within hours.</p>
            </div>

            <div className="bg-gradient-to-b from-[#121D2F]/80 to-gray-950 p-6 rounded-xl border border-gray-850">
              <span className="text-2xl font-black text-purple-400">05</span>
              <h4 className="text-md font-bold text-white mt-1">Dedicated Outbound Support</h4>
              <p className="text-xs text-gray-400 mt-2">Avoid endless waiting queues. Connect directly with VXL's Pune dispatch managers via standard phone links or instant secure WhatsApp integration.</p>
            </div>

            <div className="bg-gradient-to-b from-[#121D2F]/80 to-gray-950 p-6 rounded-xl border border-gray-850">
              <span className="text-2xl font-black text-pink-400">06</span>
              <h4 className="text-md font-bold text-white mt-1">Pivotal Pune/Chakan Hub</h4>
              <p className="text-xs text-gray-400 mt-2">Our modern warehouse office is positioned perfectly at Chimbali Phata, Chakan next to Kundan Hyundai. Ideal for fast loading across Maharashtra zones.</p>
            </div>

          </div>
        </div>
      </section>

      {/* INTERACTIVE NETWORK MAP OF INDIA */}
      <section id="network" className="py-24 bg-[#0B1320] border-b border-gray-800/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left explanation Text */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-gray-900 border border-gray-800 text-[#FFD400] text-xs font-bold py-1.5 px-4 rounded-full">
                <span>INTERACTIVE TRANSIT CORRIDORS</span>
              </div>

              <h2 className="text-3xl sm:text-4.5xl font-black text-white tracking-tight leading-tight">
                National Network & Bilateral Border Access
              </h2>

              <p className="text-gray-300 text-sm leading-relaxed">
                Tap on any regional checkpoint node in the map to reveal VXL dispatcher coverage status, direct contact lines, and tactical support routing details. 
              </p>

              {/* Display chosen node status card */}
              <div className="bg-[#121D2F] border border-gray-800 p-5 rounded-2xl animate-fadeIn space-y-3.5">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-[#FF5A1F]" />
                    <h3 className="font-bold text-white text-md">{selectedHub.name}</h3>
                  </div>
                  <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 py-1 px-2 rounded-full uppercase tracking-wider">
                    Operational Status: ACTIVE
                  </span>
                </div>
                
                <p className="text-xs text-gray-300">{selectedHub.description}</p>
                
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-gray-500">Dispatch Coordinator Hotline:</span>
                  <a href={`tel:${selectedHub.phone}`} className="font-bold text-[#FFD400] hover:underline flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>+91 {selectedHub.phone}</span>
                  </a>
                </div>
              </div>

              <div className="pt-2 text-xs text-gray-500 flex items-center space-x-2.5">
                <div className="w-2 h-2 rounded-full bg-[#FF5A1F] animate-ping" />
                <span>Highlighted routes are actively tracked under VXL Satellite protocol.</span>
              </div>
            </div>

            {/* Right Map Canvas (custom high fidelity vector map representation of India) */}
            <div className="lg:col-span-7">
              <div className="bg-[#121D2F] border border-gray-800/80 rounded-2xl p-6.5 relative overflow-hidden flex flex-col items-center">
                
                <div className="absolute top-4 left-4 text-left">
                  <h4 className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">VXL Map Telemetry Engine</h4>
                  <p className="text-[10px] text-gray-400 font-mono">Select any orange pin to query routing logs</p>
                </div>

                {/* SVG Visual India Map Representation */}
                <div className="relative w-full max-w-[480px] h-[400px] bg-[#070D18]/90 p-4 rounded-xl border border-gray-800 flex items-center justify-center">
                  
                  {/* Decorative abstract India outline path representation (since complete geographic SVG path can be bulky, our beautiful schematic network perfectly shows hub links cleanly) */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <div className="w-[85%] h-[85%] border-2 border-dashed border-[#0E4FB5] rounded-full animate-spin-slow" />
                  </div>

                  {/* Lines radiating out of Pune HQ to various hubs */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    {MAP_HUBS.map((hub, idx) => {
                      if (hub.name === "Pune (HQ)") return null;
                      // Draw animated line from Pune (which is around x=30%, y=72%) to each other node
                      return (
                        <g key={idx}>
                          <line
                            x1={`${MAP_HUBS[0].coords.x}%`}
                            y1={`${MAP_HUBS[0].coords.y}%`}
                            x2={`${hub.coords.x}%`}
                            y2={`${hub.coords.y}%`}
                            stroke={selectedHub.name === hub.name ? "#FF5A1F" : "#0E4FB5"}
                            strokeWidth={selectedHub.name === hub.name ? "2" : "0.75"}
                            strokeDasharray="4,4"
                            className="opacity-70"
                          />
                          {/* Animated indicator cursor moving on stream path */}
                          <circle r="2" fill="#FFD400" className="animate-pulse">
                            <animateMotion
                              path={`M ${MAP_HUBS[0].coords.x * 4.8} ${MAP_HUBS[0].coords.y * 4} L ${hub.coords.x * 4.8} ${hub.coords.y * 4}`}
                              dur="3s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Interactive Nodes positioning */}
                  {MAP_HUBS.map((hub, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedHub(hub)}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group focus:outline-none z-10"
                      style={{ left: `${hub.coords.x}%`, top: `${hub.coords.y}%` }}
                    >
                      <div className="relative flex items-center justify-center">
                        {/* Pulse effect */}
                        <span className={`absolute inline-flex h-4.5 w-4.5 rounded-full opacity-60 animate-ping ${
                          hub.name.includes("HQ") ? "bg-[#FF5A1F]" : "bg-[#0E4FB5]"
                        }`} />
                        
                        <div className={`p-1.5 rounded-full shadow-lg border transition-all duration-300 ${
                          selectedHub.name === hub.name 
                            ? "bg-[#FF5A1F] border-white scale-125 z-20" 
                            : hub.name.includes("HQ")
                              ? "bg-[#FFD400] border-amber-500 scale-110"
                              : "bg-[#0E4FB5] border-blue-800 hover:bg-[#FFD400] hover:scale-115"
                        }`}>
                          <MapPin className="w-3 h-3 text-white" />
                        </div>

                        {/* Label */}
                        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-[#070D18] border border-gray-850 px-1.5 py-0.5 rounded text-[8px] sm:text-[9.5px] text-white whitespace-nowrap font-bold font-mono tracking-tight shadow-md">
                          {hub.name}
                        </div>
                      </div>
                    </button>
                  ))}

                  {/* Map Compass */}
                  <div className="absolute bottom-3 right-3 text-center border border-gray-800 bg-[#070D18] p-2 rounded text-[8px] tracking-widest text-[#FF5A1F]">
                    N<br />▲<br />PAN INDIA
                  </div>

                </div>

                <div className="w-full mt-4 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Pune HQ Center coordinations is <strong className="text-white">Active</strong></span>
                  <button onClick={() => setSelectedHub(MAP_HUBS[0])} className="text-[#FF5A1F] hover:underline">
                    Reset Map Center
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* GLASSMORPHISM CLIENT TESTIMONIALS */}
      <section id="testimonials" className="py-24 bg-[#070D18] border-b border-gray-800/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <span className="text-[#FF5A1F] text-xs font-black uppercase tracking-widest block">EXECUTIVE DEPOSITIONS</span>
          <h2 className="text-3xl sm:text-4.5xl font-black text-white tracking-tight mt-1">
            Endorsements from Leading Manufacturers
          </h2>
          <p className="text-gray-305 text-sm max-w-xl mx-auto mt-2">Hear directly from the supply chain procurement officers and logistics executives who trust VXL Logistics hourly.</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((test) => (
              <div
                key={test.id}
                className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Rating Stars */}
                  <div className="flex items-center space-x-1 select-none">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#FFD400] text-[#FFD400]" />
                    ))}
                  </div>

                  <p className="text-sm text-gray-200 leading-relaxed italic">
                    "{test.quote}"
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10 flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-white text-xs border border-gray-700">
                    {test.author.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{test.author}</h5>
                    <p className="text-[10px] text-gray-400">{test.designation}</p>
                    <span className="text-[10px] font-black text-[#FFD400] font-mono tracking-wider">{test.company}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEAD-GENERATION QUOTE FORM & OFFICIAL COVENANT */}
      <section id="quote" className="py-24 bg-[#0B1320] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Form Left Information and Dispatched Addresses */}
            <div className="lg:col-span-4 space-y-6">
              <span className="text-[#FF5A1F] text-xs font-black uppercase tracking-widest block">SECURE VEHICLE BOOKING</span>
              
              <h2 className="text-3xl sm:text-4.5xl font-black text-white tracking-tight leading-none">
                Get Your Dispatch Quotation
              </h2>

              <p className="text-gray-300 text-sm">
                Fill the formal routing prospectus requirement sheet. Our Pune/Chakan managers compile current corridor expenses and email official agreements back within 3 hours.
              </p>

              {/* Direct Address & Contact Card */}
              <div className="bg-[#121D2F] border border-gray-850 p-6 rounded-2xl space-y-4 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px] border-b border-gray-800 pb-2 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Head Office Depot</span>
                </h4>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-[#FF5A1F] shrink-0 mt-0.5" />
                  <p className="text-gray-300 leading-normal">
                    Mahalaxmi Warehouse Office No. 3, Ground Floor, Near Kundan Hyundai Showroom, Chimbali Phata, Chakan, Pune - 410501, Maharashtra, India.
                  </p>
                </div>

                <div className="flex items-start space-x-3 pt-1">
                  <Phone className="w-5 h-5 text-[#FFCE00] shrink-0" />
                  <div>
                    <p className="text-gray-300 font-bold">+91 9049105678</p>
                    <p className="text-gray-300 font-bold">+91 9325506667</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 pt-1">
                  <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <a href="mailto:vxl.logistics@yahoo.com" className="text-gray-300 hover:underline">vxl.logistics@yahoo.com</a>
                    <br />
                    <a href="mailto:vxllogisticspune@gmail.com" className="text-gray-300 hover:underline">vxllogisticspune@gmail.com</a>
                  </div>
                </div>
              </div>

              {/* Verified Badge */}
              <div className="border border-dashed border-gray-800 p-4 rounded-xl text-center flex flex-col items-center justify-center space-y-2">
                <span className="text-[10px] uppercase text-[#FF5A1F] font-bold tracking-widest font-mono">Government Compliant License</span>
                <p className="text-[11px] text-gray-500">Official Indian Transporter ID registered with GST, FSSAI, and road permit credentials.</p>
              </div>
            </div>

            {/* Inquiries Submission Form */}
            <div className="lg:col-span-8 bg-[#121D2F] border border-gray-800 rounded-2xl p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6">Dispatch Route Prospectus Sheet</h3>

              {formSuccessMessage && (
                <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-900/60 rounded-xl text-xs text-emerald-300 space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <strong>Submission Confirmed!</strong>
                  </div>
                  <p>{formSuccessMessage}</p>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5" htmlFor="name">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#070D18] border border-gray-800 rounded-xl py-3 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-[#0E4FB5] text-white"
                      placeholder="e.g. Ramesh Patel"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      id="name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5" htmlFor="company">
                      Company Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#070D18] border border-gray-800 rounded-xl py-3 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-[#0E4FB5] text-white"
                      placeholder="e.g. Cummins Ind Pvt Ltd"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      id="company"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5" htmlFor="phone">
                      WhatsApp/Phone Number *
                    </label>
                    <input
                      type="tel"
                      className="w-full bg-[#070D18] border border-gray-800 rounded-xl py-3 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-[#0E4FB5] text-white"
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      id="phone"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5" htmlFor="email">
                      Official Email address
                    </label>
                    <input
                      type="email"
                      className="w-full bg-[#070D18] border border-gray-800 rounded-xl py-3 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-[#0E4FB5] text-white"
                      placeholder="e.g. procurement@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      id="email"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5" htmlFor="origin">
                      Origin Hub / City *
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#070D18] border border-gray-800 rounded-xl py-3 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-[#0E4FB5] text-white"
                      placeholder="e.g. Chakan, Pune"
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      required
                      id="origin"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5" htmlFor="destination">
                      Destination / City *
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#070D18] border border-gray-800 rounded-xl py-3 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-[#0E4FB5] text-white"
                      placeholder="e.g. Kathmandu Gateway, Nepal"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      required
                      id="destination"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5" htmlFor="vehicleRequirement">
                    Target Fleet Vehicle Requirement
                  </label>
                  <select
                    id="vehicleRequirement"
                    className="w-full bg-[#070D18] border border-gray-800 rounded-xl py-3 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-[#0E4FB5] text-white font-mono"
                    value={formData.vehicleRequirement}
                    onChange={(e) => setFormData({ ...formData, vehicleRequirement: e.target.value })}
                  >
                    {FLEET.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.name}>
                        {vehicle.name} ({vehicle.capacity} Standard capacity)
                      </option>
                    ))}
                    <option value="Other / Customized ODC Trailer">Other / Custom Heavy ODC Trailer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5" htmlFor="message">
                    Material Characteristics & Dispatch Instructions
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full bg-[#070D18] border border-gray-800 rounded-xl py-3 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-[#0E4FB5] text-white placeholder:text-gray-600"
                    placeholder="Provide specific notes like 'Confectionery chocolate ingredients, temperature sensitive' or 'Monolithic Castings shift required with low-bed multi axle.'"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-850">
                  <p className="text-[10px] text-gray-500">
                    * By submitting this prospectus, you authorize VXL Logistics dispatch operators to calculate active state routes tolls, fuel expenses and issue written quotes.
                  </p>
                  
                  <button
                    type="submit"
                    disabled={formIsSubmitting}
                    className="w-full sm:w-auto bg-[#FF5A1F] hover:bg-[#FF5A1F]/90 text-white font-bold py-3.5 px-8 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-950/20 hover:scale-103 font-serif flex items-center justify-center space-x-2"
                  >
                    {formIsSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Registering Pipeline...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Submit Consignment Enquiry</span>
                        <ArrowUpRight className="w-4 h-4 text-white" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED ROAD CARRIER QUESTIONS */}
      <section className="py-24 bg-[#070D18] border-b border-gray-800/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-2.5 mb-16">
            <span className="text-[#FF5A1F] text-xs font-black uppercase tracking-widest block">LOGISTICS KNOWLEDGE SHELF</span>
            <h2 className="text-2xl sm:text-3.5xl font-black text-white">Frequently Asked Transport Questions</h2>
            <p className="text-gray-400 text-xs">Verify basic protocols matching border custom transit and vehicle allocations.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What is the typical transit duration for Chakan to Nepal border points?",
                a: "For Full Truck Loads (FTL) departing our Pune hubs, transit to the border gateway at Raxaul / Birgunj averages 4 to 5 days under standard dispatch cycles. We offer double-driver relays to compress dispatch schedules if required."
              },
              {
                q: "How does VXL handle food-grade transport hygiene?",
                a: "Our food grade fleet models (e.g., matching Parag Dairy, Govind Milk, Morde Confectioneries) undergo rigorous inspection. Vehicles are steam-washed and insulated internally to isolate chocolate compounds raw ingredients and milk powders from external weather contaminants."
              },
              {
                q: "Do you supply customized Over Dimensional Cargo (ODC) platforms?",
                a: "Yes, we maintain an independent fleet section of specialized chassis, drop decks, and multi-axle trailers. We coordinate administrative road permits, perform route mapping assessments, and handle escort protocols for large boilers and machinery turbines out of Chakan."
              },
              {
                q: "What digital tracking services does VXL provide?",
                a: "Every single VXL logistics asset is equipped with pre-authenticated satellite GPS transceivers. Customers receive instant live tracking status cards, digital geofencing dispatch triggers, and electronic Proof of Delivery (POD) confirmations instantly."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-[#121D2F] border border-gray-850 rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full py-4.5 px-6 text-left flex items-center justify-between focus:outline-none"
                >
                  <span className="text-xs sm:text-sm font-bold text-white pr-4">{faq.q}</span>
                  <ChevronDown className={`w-4.5 h-4.5 text-[#FF5A1F] transition-transform ${activeFaq === idx ? "rotate-180" : ""}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-5 pt-1 text-xs text-gray-300 leading-relaxed border-t border-gray-800/80">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CORE FOOTER SECTION */}
      <footer className="bg-[#050B13] text-gray-350 pt-20 pb-10 border-t border-gray-850/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-gray-800">
            
            {/* Column 1 - Corporate Brand */}
            <div className="lg:col-span-4 space-y-5">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                <div className="w-10 h-10 rounded-lg bg-[#0E4FB5] flex items-center justify-center text-white">
                  <Truck className="w-5.5 h-5.5 text-white" />
                </div>
                <div>
                  <span className="text-xl font-black text-white tracking-tight">VXL <span className="text-[#FF5A1F] text-xs font-bold uppercase block tracking-widest">Logistics</span></span>
                </div>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                VXL Logistics is a premier Indian transporter serving nationwide industrial sectors since 2001. Certified with high-hygiene food grade cabins, heavy axles ODC trailers, and digital POD services.
              </p>

              <div className="space-y-1">
                <p className="text-xs text-gray-305 font-bold">Pune Command Hotline Central:</p>
                <p className="text-sm font-black text-[#FFD400]">+91 9049105678 / 9325506667</p>
              </div>

              <div className="flex space-x-3">
                <a href="#vxl-site-root" className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-[#FF5A1F] hover:bg-[#FF5A1F] hover:text-white transition-all">
                  <Globe className="w-4.5 h-4.5" />
                </a>
                <button onClick={() => setIsChatOpen(true)} className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all">
                  <MessageSquare className="w-4.5 h-4.5" />
                </button>
                <button onClick={handleDownloadProfile} className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-blue-400 hover:bg-blue-500 hover:text-white transition-all">
                  <Download className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Column 2 - Links */}
            <div className="lg:col-span-2.5 space-y-4">
              <h4 className="text-xs font-black uppercase text-white tracking-widest">Navigation</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => scrollToId("about")} className="hover:text-white hover:underline transition-colors block text-left">Corporate Profile</button></li>
                <li><button onClick={() => scrollToId("services")} className="hover:text-white hover:underline transition-colors block text-left">Services Catalog</button></li>
                <li><button onClick={() => scrollToId("fleet")} className="hover:text-white hover:underline transition-colors block text-left">Our Heavy Fleet</button></li>
                <li><button onClick={() => scrollToId("network")} className="hover:text-white hover:underline transition-colors block text-left">Interactive Map</button></li>
                <li><button onClick={() => scrollToId("testimonials")} className="hover:text-white hover:underline transition-colors block text-left">Client Testimonials</button></li>
              </ul>
            </div>

            {/* Column 3 - Services */}
            <div className="lg:col-span-3.5 space-y-4">
              <h4 className="text-xs font-black uppercase text-white tracking-widest">Elite Services</h4>
              <ul className="space-y-2 text-xs text-gray-400 text-left">
                <li>• Full Truck Load (FTL) - Industrial</li>
                <li>• Part Truck Load (PTL) - Consolidated</li>
                <li>• Over Dimensional ODC Cargo Trailers</li>
                <li>• Sterile Sanitized Food Grade Transport</li>
                <li>• Temperature Monitored Pharmaceuticals</li>
                <li>• Double Relay Driver Express Longhaul</li>
                <li>• Custom clearances assisting (Nepal, Borders)</li>
              </ul>
            </div>

            {/* Column 4 - Local Presence */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-black uppercase text-[#FFD400] tracking-widest">Local Depots</h4>
              <ul className="space-y-2 text-[10.5px] text-gray-400">
                <li>📍 Pune - Chakan Industrial HQ</li>
                <li>📍 Mumbai - JNPT Shipping Gate</li>
                <li>📍 Thane - Murbad Manufacturing</li>
                <li>📍 Uttar Pradesh - Kanpur Depot</li>
                <li>📍 Bihar - Raxaul Border Post</li>
                <li>📍 Nepal - Birgunj Terminal Point</li>
              </ul>
            </div>

          </div>

          {/* Legal and Disclaimer */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500">
            <p>© 2026 VXL Logistics Private Limited. All Rights Reserved. Established 2001 in Pune.</p>
            
            <div className="flex space-x-6 mt-4 sm:mt-0 font-mono">
              <span className="hover:text-gray-300">GSTIN Verified</span>
              <span>•</span>
              <span className="hover:text-gray-300">ISO 9001 Compliant</span>
              <span>•</span>
              <button onClick={handleDownloadProfile} className="text-[#FF5A1F] hover:underline font-bold">Download Profile PDF</button>
            </div>
          </div>

        </div>
      </footer>

      {/* FLOAT AI DISPATCH CHATBOT CONTAINER */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="flex items-center space-x-2.5 bg-gradient-to-r from-[#FF5A1F] to-[#FFD400] hover:scale-105 text-white font-bold p-3.5 sm:px-5.5 sm:py-3.5 rounded-full shadow-2xl transition-all border border-white/10 group cursor-pointer"
          >
            <MessageSquare className="w-5.5 h-5.5 text-white animate-pulse" />
            <span className="hidden sm:inline text-xs tracking-wider uppercase font-sans">AI Dispatch Planner</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" />
          </button>
        ) : (
          <div className="bg-[#121D2F] border border-gray-800 rounded-2xl w-[320px] sm:w-[380px] shadow-2xl flex flex-col overflow-hidden animate-slideUp">
            
            {/* Chat header */}
            <div className="bg-gradient-to-r from-[#121D2F] to-[#0E4FB5] text-white p-4 flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8.5 h-8.5 rounded-lg bg-gray-900 flex items-center justify-center border border-gray-850">
                  <Sparkles className="w-4 h-4 text-[#FFD400] animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight flex items-center space-x-1">
                    <span>VXL AI Router Coordinator</span>
                  </h4>
                  <p className="text-[9.5px] text-gray-300">Real-time quote compiling desk</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="p-4 h-[280px] overflow-y-auto space-y-4 bg-[#070D18]/90">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-3 max-w-[85%] rounded-xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#0E4FB5] text-white rounded-br-none"
                      : "bg-[#121D2F] border border-gray-800 text-gray-200 rounded-bl-none"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isChatTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#121D2F] border border-gray-800 p-3 rounded-xl rounded-bl-none text-xs text-gray-400 flex items-center space-x-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF5A1F]" />
                    <span className="italic font-mono">VXL Agent is formulating logistics prospectus...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Quick Queries Selector */}
            <div className="px-3 py-2 bg-[#121D2F]/80 border-t border-gray-850 flex flex-wrap gap-1">
              <button
                onClick={() => {
                  setChatInput("What's the freight rate to Nepal Birgunj border?");
                  setTimeout(() => handleChatSend(), 100);
                }}
                className="text-[9.5px] bg-[#070D18] hover:bg-[#0E4FB5]/20 text-gray-300 py-1 px-2 rounded-md border border-gray-800 transition-colors shrink-0 text-left"
              >
                Rate to Nepal?
              </button>
              <button
                onClick={() => {
                  setChatInput("Do you support temperature controlled food-grade shipments?");
                  setTimeout(() => handleChatSend(), 100);
                }}
                className="text-[9.5px] bg-[#070D18] hover:bg-[#000]/20 text-gray-300 py-1 px-2 rounded-md border border-gray-800 transition-colors shrink-0 text-left"
              >
                Food Hygiene?
              </button>
              <button
                onClick={() => {
                  setChatInput("Can I get a dispatcher callback to my phone number immediately?");
                  setTimeout(() => handleChatSend(), 100);
                }}
                className="text-[9.5px] bg-[#0E4FB5]/20 hover:bg-[#FFD400]/20 text-white font-semibold py-1 px-2 rounded-md border border-[#0E4FB5]/40 transition-colors shrink-0 text-left"
              >
                Phone Callback
              </button>
            </div>

            {/* Chat direct click manager callback */}
            <div className="px-3 py-1.5 bg-[#0E4FB5]/10 border-t border-gray-850 flex items-center justify-between text-[10px]">
              <span className="text-gray-400 shrink-0">Direct support dispatcher:</span>
              <a 
                href="https://wa.me/919049105678" 
                target="_blank" 
                rel="noreferrer" 
                className="text-[#FFD400] font-bold hover:underline flex items-center space-x-0.5"
              >
                <span>WhatsApp Desk +919049105678</span>
                <ExternalLink className="w-3 h-3 inline" />
              </a>
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleChatSend} className="p-3 bg-[#121D2F] border-t border-gray-850 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type route details or phone number..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-[#070D18] border border-gray-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#0E4FB5] text-white placeholder:text-gray-605"
              />
              <button
                type="submit"
                disabled={isChatTyping}
                className="p-2 bg-[#FF5A1F] hover:bg-[#FF5A1F]/90 text-white rounded-lg transition-colors font-bold disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>

          </div>
        )}
      </div>

      {/* OPERATIONS PORTAL DRAWER IF OPEN */}
      {isDashboardOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-end justify-end">
          {/* Backdrop screen filter */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsDashboardOpen(false)} />
          
          <div className="relative bg-[#0B1320] text-gray-100 w-full max-w-4xl h-[92vh] rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none flex flex-col shadow-2xl border-t sm:border-l border-gray-800 animate-slideUp z-10 font-mono">
            
            {/* Header dashboard info */}
            <div className="p-5 bg-[#121D2F] border-b border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded bg-gray-900 border border-gray-800 text-[#FFD400]">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">VXL Operations Control Room</h3>
                  <p className="text-[10px] text-gray-400">Live Logistics ERP Enquiry Terminal</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => fetchEnquiries()}
                  className="p-1.5 bg-gray-900/60 border border-gray-850 hover:bg-gray-800 text-gray-300 rounded hover:text-white transition-colors"
                  title="Manual telemetry sync"
                  id="sync-telemetry-btn"
                >
                  <RefreshCw className={`w-4.5 h-4.5 ${isRefreshingEnquiries ? "animate-spin text-orange-400" : ""}`} />
                </button>

                <button
                  onClick={() => setIsDashboardOpen(false)}
                  className="p-1.5 bg-red-950/40 border border-red-900/60 hover:bg-red-900 text-red-200 rounded transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Stats board banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#070D18] border-b border-gray-850 text-xs py-4 shrink-0">
              <div className="p-3 bg-gray-900/80 rounded-lg border border-gray-850">
                <p className="text-gray-500 uppercase text-[9px] font-bold">Total Port Pipeline</p>
                <p className="text-lg font-black text-white mt-1">{enquiries.length + 8} Shipments</p>
              </div>
              <div className="p-3 bg-gray-900/80 rounded-lg border border-gray-850">
                <p className="text-gray-500 uppercase text-[9px] font-bold">Unassigned Leads</p>
                <p className="text-lg font-black text-amber-400 mt-1">
                  {enquiries.filter(e => e.status === "Pending" || !e.status).length} Pending
                </p>
              </div>
              <div className="p-3 bg-gray-900/80 rounded-lg border border-gray-850">
                <p className="text-gray-500 uppercase text-[9px] font-bold">Fleet Telemetry</p>
                <p className="text-lg font-black text-emerald-400 mt-1">98.4% On-time</p>
              </div>
              <div className="p-3 bg-gray-900/80 rounded-lg border border-gray-850">
                <p className="text-gray-500 uppercase text-[9px] font-bold">Regional Bases</p>
                <p className="text-lg font-black text-[#0E4FB5] mt-1">10 Depots active</p>
              </div>
            </div>

            {/* Enquiries live table list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-800">
                <span className="text-gray-300 font-bold uppercase tracking-wider">Registered Consignment Pipeline</span>
                <span className="text-gray-400">Total in database: {enquiries.length} requests</span>
              </div>

              {enquiries.length === 0 ? (
                <div className="text-center py-24 border border-dashed border-gray-800 rounded-xl space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-[#FF5A1F] mx-auto" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-300">Awaiting Server Registry sync...</h4>
                    <p className="text-[10px] text-gray-500 max-w-sm mx-auto mt-1">If this is compilation startup, submit a Quote Enquiry in the form first! It will instantly sync here.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {enquiries.map((enq, index) => (
                    <div
                      key={enq.id || index}
                      className="bg-gray-900/40 border border-gray-850 rounded-xl p-4 space-y-3 hover:border-gray-700 transition-colors"
                    >
                      {/* Top bar info */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-850 pb-2.5">
                        <div className="flex items-center space-x-2.5 text-xs">
                          <span className="bg-gray-800 text-gray-300 font-bold px-2 py-0.5 rounded font-mono">
                            {enq.id}
                          </span>
                          <span className="text-white font-bold">{enq.company || "Individual Operator"}</span>
                          <span className="text-gray-505">•</span>
                          <span className="text-gray-500 font-mono text-[10px]">{enq.timestamp}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[9px] font-mono text-gray-500 uppercase">Status:</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            enq.status === "Pending" ? "bg-amber-400/10 text-amber-300" :
                            enq.status === "Assigned" ? "bg-purple-400/10 text-purple-300" :
                            enq.status === "In Transit" ? "bg-blue-400/10 text-blue-300" :
                            "bg-emerald-400/10 text-emerald-300"
                          }`}>
                            {enq.status || "Pending"}
                          </span>

                          <span className="text-[10px] bg-gray-800 text-gray-400 py-0.5 px-2 rounded">
                            Source: {enq.source || "Form"}
                          </span>
                        </div>
                      </div>

                      {/* Consignment grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <p className="text-gray-500 text-[9px] uppercase font-bold">Contact Representative</p>
                          <p className="text-white font-bold mt-0.5">{enq.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">{enq.phone}</p>
                          {enq.email && <p className="text-[9.5px] text-[#0E4FB5] truncate font-mono">{enq.email}</p>}
                        </div>

                        <div>
                          <p className="text-gray-500 text-[9px] uppercase font-bold">Transit Origin</p>
                          <p className="text-[#FFD400] mt-0.5 font-bold truncate">{enq.origin}</p>
                        </div>

                        <div>
                          <p className="text-gray-500 text-[9px] uppercase font-bold">Transit Destination</p>
                          <p className="text-[#FF5A1F] mt-0.5 font-bold truncate">{enq.destination}</p>
                        </div>

                        <div>
                          <p className="text-gray-500 text-[9px] uppercase font-bold">Preferred Vehicle Range</p>
                          <p className="text-gray-300 mt-1 font-mono tracking-tight text-[11px] truncate">{enq.vehicleRequirement}</p>
                        </div>
                      </div>

                      {enq.message && enq.message !== "N/A" && (
                        <div className="p-3 bg-[#070D18] rounded-lg border border-gray-850 text-xs">
                          <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Prospectus Instructions:</p>
                          <p className="text-gray-300 italic">"{enq.message}"</p>
                        </div>
                      )}

                      {/* Control parameters */}
                      <div className="pt-2 border-t border-gray-850 flex flex-wrap items-center justify-between text-[11px] gap-2">
                        <span className="text-gray-505">Lead processed by automatic telemetry queue</span>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              alert(`Calling dispatcher back representative ${enq.phone} via Pune main desk...`);
                            }}
                            className="text-xs bg-[#0E4FB5] hover:bg-opacity-80 text-white font-bold py-1 px-3 rounded font-mono"
                          >
                            Call Rep
                          </button>
                          
                          <button
                            onClick={() => {
                              // Cycle through states
                              const nextStatusMap: Record<string, "Pending" | "Assigned" | "In Transit" | "Completed"> = {
                                "Pending": "Assigned",
                                "Assigned": "In Transit",
                                "In Transit": "Completed",
                                "Completed": "Pending"
                              };
                              const current = enq.status || "Pending";
                              const updatedStatus = nextStatusMap[current] || "Pending";
                              
                              setEnquiries(prev => prev.map((item, idx) => {
                                if (idx === index) {
                                  return { ...item, status: updatedStatus };
                                }
                                return item;
                              }));
                            }}
                            className="bg-gray-800 hover:bg-gray-700 text-gray-200 py-1 px-2.5 rounded text-xs border border-gray-750 flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Cycle State</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom info banner */}
            <div className="p-4 bg-gray-950 text-center text-xs text-gray-500 shrink-0 border-t border-gray-850 flex flex-col sm:flex-row items-center justify-between">
              <span>* Private Enterprise Console access mapped in securely. Data persists in live server memory.</span>
              <button 
                onClick={() => {
                  setFormData({
                    name: "Simulated Corp Client",
                    company: "Valvoline India Base",
                    phone: "9112233445",
                    email: "procure@valvoline.in",
                    origin: "Chakan, Maharashtra",
                    destination: "Rajasthan Depot",
                    vehicleRequirement: "Open Body Multi-Axle Trucks",
                    message: "Scheduled shift for specialized machinery casing oils."
                  });
                  setIsDashboardOpen(false);
                  scrollToId("quote");
                }}
                className="text-[#FF5A1F] hover:underline font-bold mt-2 sm:mt-0"
              >
                Insert Simulated Corp Lead Setup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
