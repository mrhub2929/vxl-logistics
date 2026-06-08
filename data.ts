import { LogisticsService, FleetVehicle, ClientCompany, Testimonial } from "./types";

export const STATS = [
  { value: "24+", label: "Years Experience", description: "Serving Indian industries since 2001" },
  { value: "30+", label: "Vehicles", description: "Heavy container fleet & ODC cargo units" },
  { value: "10,000+", label: "Deliveries", description: "Successful transit cycles completed" },
  { value: "500+", label: "Cities Covered", description: "Across Pan India & Nepal border" },
  { value: "100+", label: "Business Clients", description: "Leading manufacturers & FMCG brands" }
];

export const SERVICES: LogisticsService[] = [
  {
    id: "ftl",
    title: "Full Truck Load (FTL)",
    description: "Door-to-door full payload transportation with point-to-point security, customized routes, and direct dispatch for bulk cargo.",
    icon: "Truck",
    benefits: ["Zero trans-shipment risk", "Faster transit cycles", "Direct point-of-delivery"],
    industryApplicability: "Automotive, FMCG, Steel, Heavy Machinery"
  },
  {
    id: "ptl",
    title: "Part Truck Load (PTL)",
    description: "Smarter, consolidated payload booking for smaller volume requirements, optimizing transit expenses across busy corridors.",
    icon: "PackageCheck",
    benefits: ["Highly cost effective", "Flexible scheduling", "Payload consolidation"],
    industryApplicability: "SMEs, Consumer Goods, Retail Distributors"
  },
  {
    id: "odc",
    title: "ODC Transportation",
    description: "Specialized movement for Over-Dimensional Cargo, heavy engineering units, monolithic power structures, and columns.",
    icon: "ShieldAlert",
    benefits: ["Custom specialized chassis", "Route surveys & permissions", "Trained heavy operators"],
    industryApplicability: "Infrastructure, Energy, Power Projects, Heavy Engineering"
  },
  {
    id: "food-grade",
    title: "Food Grade Transportation",
    description: "Strictly sanitized transport units tailored for food raw supplies, dairy products, milk, and chocolate ingredients preserving quality.",
    icon: "Milk",
    benefits: ["FSSAI-compliant cleanliness", "Zero contaminant isolation", "Daily inspection protocols"],
    industryApplicability: "Morde Chocolates, Govind Milk, Prabhat Dairy, FMCG Leaders"
  },
  {
    id: "pharma",
    title: "Pharmaceutical Logistics",
    description: "Temperature-monitored, secure transport solutions for delicate life-saving drugs, medical accessories, and raw material chemicals.",
    icon: "ThermometerSnowflake",
    benefits: ["Thermoregulated environments", "Real-time temperature telemetry", "Priority express route tracking"],
    industryApplicability: "Pharmaceutical Brands, Lab Suppliers, Chemicals"
  },
  {
    id: "express-cargo",
    title: "Express Cargo",
    description: "Time-critical delivery solutions with dedicated, double-driver long-haul fleets to compress transit schedules for rapid demand.",
    icon: "Zap",
    benefits: ["Guaranteed transit bracket", "Dual driver relays", "Real-time dispatch focus"],
    industryApplicability: "Daily Manufacturing Supply Chains, Urgent Parts"
  },
  {
    id: "industrial",
    title: "Industrial Logistics",
    description: "End-to-end transport support for factories, shifting castings, tooling machinery, and foundry containers from Pune hubs.",
    icon: "Factory",
    benefits: ["Crane loading coordination", "Multi-axle compatibility", "Heavy load calculations"],
    industryApplicability: "Cummins, Thermax, Valvoline, Heavy Engineering"
  },
  {
    id: "cross-border",
    title: "Cross Border (Nepal)",
    description: "Reliable cross-border transit logistics connecting Indian industrial zones directly with distribution centers in Nepal.",
    icon: "Globe",
    benefits: ["Border custom clearances assistance", "Bilateral permit navigation", "Multilingual regional dispatchers"],
    industryApplicability: "FMCG, Fertilizers, Agro Goods, Consumer Durables"
  },
  {
    id: "supply-chain",
    title: "Supply Chain Solutions",
    description: "Integrated routing planners, empty return optimization, multi-node scheduling, and dispatch coordination directly out of Chakan.",
    icon: "Layers",
    benefits: ["Lean supply chain engineering", "Reduced warehouse dwell times", "Optimized round-trips"],
    industryApplicability: "Corporate Giants, Multi-factory Manufacturers"
  },
  {
    id: "gps-tracked",
    title: "GPS Tracked Transportation",
    description: "Every shipment is secured with advanced GPS transceivers providing instant location, geofencing coordinates, and speed reports.",
    icon: "Navigation",
    benefits: ["Real-time digital maps view", "Automated geofence dispatch alert", "Instant customer status delivery"],
    industryApplicability: "Standard for all VXL vehicles"
  }
];

export const FLEET: FleetVehicle[] = [
  {
    id: "fl-32ft",
    name: "32ft Container Truck (Single/Multi-Axle)",
    category: "32ft Containers",
    capacity: "15 - 20 Tons",
    dimensions: "32ft x 8.5ft x 9ft",
    primaryUse: "FMCG, White Goods, Auto Parts, High-Value Cargo",
    features: ["All-Weather Secure Body", "Double Driver relays", "Live GPS Telemetry", "Leak-Proof Aluminum Cover"],
    imageUrl: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "fl-24ft",
    name: "24ft Closed Body Container",
    category: "24ft Trucks",
    capacity: "10 - 12 Tons",
    dimensions: "24ft x 8ft x 8.5ft",
    primaryUse: "FMCG, Dairy/Confectionery raw products, Electronics",
    features: ["Sanitized Internal Panels", "Ideal for intermediate payloads", "Robust locking chassis"],
    imageUrl: "https://images.unsplash.com/photo-1516576885502-772153cb7e30?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "fl-22ft",
    name: "22ft Container/Open Body Truck",
    category: "22ft Trucks",
    capacity: "7.5 - 9 Tons",
    dimensions: "22ft x 7.5ft x 8ft",
    primaryUse: "Industrial castings, steel pipes, packaging material",
    features: ["Heavy duty shock absorption", "Tarpaulin weatherproofing", "Shorter city transit layout"],
    imageUrl: "https://images.unsplash.com/photo-1592838064575-70ed626d3a1e?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "fl-open",
    name: "Open Body Multi-Axle Trucks",
    category: "Open Body Trucks",
    capacity: "15 - 25 Tons",
    dimensions: "Flexible (20ft - 32ft formats)",
    primaryUse: "Raw steel, coils, construction girders, agricultural bulks",
    features: ["Reinforced floor plates", "Lashing ring connectors", "Easy overhead crane accessibility"],
    imageUrl: "https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "fl-odc",
    name: "ODC Semi-Trailer & Flatbeds",
    category: "ODC Vehicles",
    capacity: "25 - 60 Tons",
    dimensions: "Extra-wide, Expandable length",
    primaryUse: "Boilers, monolithic tanks, turbine rotors, concrete pillars",
    features: ["Hydraulic self-leveling", "Multi-point tiedowns", "Beacon escorts compatible"],
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800"
  }
];

export const CLIENTS: ClientCompany[] = [
  { name: "Govind Milk", category: "FMCG & Dairy" },
  { name: "Parag", category: "FMCG & Dairy" },
  { name: "Morde Chocolates", category: "FMCG & Dairy" },
  { name: "Prabhat Dairy", category: "FMCG & Dairy" },
  { name: "ITC", category: "FMCG & Dairy" },
  { name: "Mahindra Logistics", category: "Logistics & Steel" },
  { name: "Tata Motors", category: "Auto & Heavy Engineering" },
  { name: "Tata Steel", category: "Logistics & Steel" },
  { name: "Cummins", category: "Auto & Heavy Engineering" },
  { name: "Thermax", category: "Industrial & Energy" },
  { name: "Valvoline", category: "Industrial & Energy" },
  { name: "Ashok Leyland", category: "Auto & Heavy Engineering" },
  { name: "Eicher", category: "Auto & Heavy Engineering" },
  { name: "JOSTS", category: "Industrial & Energy" },
  { name: "ADM Logistics", category: "Logistics & Steel" }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    author: "Sanjay Deshpande",
    designation: "General Manager (Outbound Logistics)",
    company: "Morde Confectioneries",
    quote: "VXL Logistics has been our primary food grade carrier for raw chocolate transit out of Pune. Their attention to wagon sanitation, scheduling, and driver discipline matches Global DHL and Maersk benchmarks. 24 years in transport truly reflects in their execution.",
    rating: 5
  },
  {
    id: "test-2",
    author: "Rakesh K. Mehta",
    designation: "Executive Director (Supply Chain)",
    company: "Thermax Industrial Projects",
    quote: "Moving monolithic boilers and ODC machinery parts is highly complex. VXL Logistics' engineering ODC team handles surveys, routes permission, and double axles trailers with precision. Their base in Chimbali Phata, Chakan keeps them linked deeply with Pune industries.",
    rating: 5
  },
  {
    id: "test-3",
    author: "Pranab Sengupta",
    designation: "Regional Procurement Head",
    company: "ITC FMCG Distribution",
    quote: "Highly reliable dispatch. Even during tough cross-border weather, the Nepal cargo arrived on time to Birgunj with digital PODs and complete GPS transparency. Excellent dedicated support team.",
    rating: 5
  }
];

export const MAP_HUBS = [
  { name: "Pune (HQ)", coords: { x: 30, y: 72 }, description: "Central Command, Operations & Fleet base near Chakan Industrial belt.", phone: "9049105678" },
  { name: "Chakan Depot", coords: { x: 28, y: 70 }, description: "Mahalaxmi Warehouse hub catering to heavy manufacturing and auto OEMs.", phone: "9325506667" },
  { name: "JNPT Port Office", coords: { x: 25, y: 65 }, description: "Mumbai container dispatch & custom import coordination center.", phone: "9049105678" },
  { name: "Murbad Hub", coords: { x: 26, y: 62 }, description: "Consolidation yard for north-Maharashtra manufacturing pipelines.", phone: "9325506667" },
  { name: "Gujarat Depot (Vadodara)", coords: { x: 22, y: 55 }, description: "Western corridor hub connecting heavy chemicals and steel cargo.", phone: "9049105678" },
  { name: "Rajasthan Depot (Jaipur)", coords: { x: 25, y: 40 }, description: "Northern route command for fast-corridor FTL distribution.", phone: "9049105678" },
  { name: "Kanpur", coords: { x: 45, y: 38 }, description: "Strategic central India hub for FMCG, leather, and parts transfer.", phone: "9325506667" },
  { name: "Lucknow", coords: { x: 48, y: 36 }, description: "Uttar Pradesh network connector with overnight border shuttle links.", phone: "9049105678" },
  { name: "MP Region (Indore)", coords: { x: 35, y: 52 }, description: "Central dispatch hub for pharmaceutical and heavy agri transit.", phone: "9325506667" },
  { name: "Nepal Gate (Raxaul/Birgunj)", coords: { x: 60, y: 32 }, description: "Custom clearance assistance and cross-border freight consolidation.", phone: "9049105678" }
];
