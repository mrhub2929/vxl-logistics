export interface FleetVehicle {
  id: string;
  name: string;
  category: string;
  capacity: string;
  dimensions: string;
  primaryUse: string;
  features: string[];
  imageUrl: string;
}

export interface LogisticsService {
  id: string;
  title: string;
  description: string;
  icon: string;
  benefits: string[];
  industryApplicability: string;
}

export interface ClientCompany {
  name: string;
  category: "Auto & Heavy Engineering" | "FMCG & Dairy" | "Logistics & Steel" | "Industrial & Energy";
}

export interface Testimonial {
  id: string;
  author: string;
  designation: string;
  company: string;
  quote: string;
  rating: number;
}

export interface EnquiryData {
  id?: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  origin: string;
  destination: string;
  vehicleRequirement: string;
  message: string;
  timestamp?: string;
  status?: "Pending" | "Assigned" | "In Transit" | "Completed";
  source?: "Form" | "Chatbot";
}
