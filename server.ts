import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());

const PORT = 3000;

// Shared in-memory list of enquiries for simulation & premium dashboard
interface Enquiry {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  origin: string;
  destination: string;
  vehicleRequirement: string;
  message: string;
  timestamp: string;
  status: "Pending" | "Assigned" | "In Transit" | "Completed";
  source: "Form" | "Chatbot";
}

const enquiriesList: Enquiry[] = [
  {
    id: "ENQ-1024",
    name: "Rajesh Sharma",
    company: "Tata Motors Suppliers",
    phone: "9876543210",
    email: "sharma.r@tatamotors-vendor.co.in",
    origin: "Chakan, Pune",
    destination: "JNPT, Mumbai",
    vehicleRequirement: "32ft Containers",
    message: "Need regular logistics transport for automotive castings. Daily movement.",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    status: "Pending",
    source: "Form"
  },
  {
    id: "ENQ-1025",
    name: "Amit Patel",
    company: "Morde Chocolates",
    phone: "9123456789",
    email: "patel.amit@morde.com",
    origin: "Murbad, Thane",
    destination: "Pune",
    vehicleRequirement: "Food Grade Transportation (Reefer)",
    message: "Requirement for temperature controlled food grade shipping of chocolate raw ingredients.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    status: "Assigned",
    source: "Chatbot"
  }
];

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Secure Gemini SDK initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Gemini Client:", error);
  }
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined in environment. Chatbot will run in simulation mode.");
}

// REST APIs section
// 1. Get all enquiries
app.get("/api/enquiries", (req, res) => {
  res.json(enquiriesList);
});

// 2. Submit new enquiry
app.post("/api/enquiries", (req, res) => {
  const { name, company, phone, email, origin, destination, vehicleRequirement, message, source } = req.body;
  if (!name || !phone) {
    res.status(400).json({ error: "Name and Phone are required." });
    return;
  }
  const newEnquiry: Enquiry = {
    id: `ENQ-${Math.floor(1000 + Math.random() * 9000).toString()}`,
    name,
    company: company || "Individual",
    phone,
    email: email || "N/A",
    origin: origin || "N/A",
    destination: destination || "N/A",
    vehicleRequirement: vehicleRequirement || "Standard Flatbed",
    message: message || "N/A",
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    status: "Pending",
    source: source === "Chatbot" ? "Chatbot" : "Form"
  };
  enquiriesList.unshift(newEnquiry);
  res.status(201).json({ success: true, enquiry: newEnquiry });
});

// 3. AI Chatbot endpoint (proxied and secured server-side)
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "Invalid request payload. 'messages' array is required." });
    return;
  }

  const systemInstruction = `You are a reliable, elite AI Logistics Planner for VXL Logistics. 
VXL Logistics was founded in 2001 in Pune (Chakan), Maharashtra, and has over 24 years of experience delivering top-tier Nationwide transport and border services to Nepal.

Key Company Facts to guide customer inquires:
- Tagline: "Reliable Transport. Nationwide Reach. Since 2001."
- Major hub offices in: Pune, Chakan, Mumbai (JNPT), Murbad, Kanpur, Lucknow, MP Region, Gujarat, Rajasthan, with pan-India network.
- Fleet selection: 22ft Trucks, 24ft Trucks, 32ft Containers, Open Body, ODC Vehicles, Custom solutions.
- Target Specialities: FTL (Full Truck Load), PTL (Part Truck Load), ODC Transportation, Food Grade Cargo (Milk, confectionery), Pharmaceutical Transportation (temperature controlled), Express Cargo.
- Customers: Govind Milk, Parag, Morde, Prabhat Dairy, ITC, Mahindra Logistics, Tata Motors, Tata Steel, Cummins, Thermax, Valvoline, etc.
- Contacts: Phone (9049105678, 9325506667), Email (vxl.logistics@yahoo.com, vxllogisticspune@gmail.com).

YOUR BEHAVIOR:
1. Speak with elite professional composure. Welcome the customer warmly and helpfully.
2. Politely extract shipment details to book their transport:
   - Origin City & Destination City
   - Company Name
   - Preferred Vehicle (e.g., 22ft/24ft/32ft or ODC) or material type (Food, Pharma, Industrial)
   - Contact Phone Number (Mandatory) and Name
3. Always provide clear, direct guidance and format listings cleanly.
4. When you have collected details (or the user wishes to connect), guide them that we can generate an official callback. Let them know they can connect directly to Pune managers on WhatsApp (+919049105678).
5. If the user asks a question about general pan-India transit, answer with confidence referencing our Pune/Chakan manufacturing roots.`;

  // Map request messages to Gemini's dynamic Content parts structure
  const formattedContents = messages.map((m: any) => ({
    role: m.role === "model" || m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  if (!ai) {
    // Elegant fallback simulation if API key is missing
    const lastUserMsg = messages[messages.length - 1]?.content || "";
    let simulatedReply = "";

    if (lastUserMsg.toLowerCase().includes("quote") || lastUserMsg.toLowerCase().includes("enquiry") || lastUserMsg.toLowerCase().includes("book")) {
      simulatedReply = "I can definitely help configure your VXL Logistics enquiry! Could you please provide your **Origin**, **Destination**, and **Contact Number**? I will build a lead profile for you instantly.";
    } else {
      simulatedReply = `Thank you for contacting VXL Logistics. We provide top-class transport across India, Nepal, and border regions since 2001. [Simulation Mode] You said: "${lastUserMsg}". Please verify your API Key in Settings to activate the full smart neural assistant! For direct bookings, please call our dispatch office at 9049105678 or email vxl.logistics@yahoo.com.`;
    }

    res.json({ text: simulatedReply });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I apologize, I could not generate a response. Please try contacting our help desk directly.";
    res.json({ text: replyText });
  } catch (error: any) {
    console.error("Gemini API Error in chat proxy:", error);
    res.status(500).json({ error: "Failed to communicate with our AI engine. Please try again shortly." });
  }
});

// Setup Vite Dev server or static middleware for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server loaded as Express middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled static production files from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VXL Logistics server is running on http://localhost:${PORT}`);
  });
}

startServer();
