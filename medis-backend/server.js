import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import {
  initDb,
  getPatientById,
  getPatientByMobile,
  getAllPatients,
  upsertPatient,
  getFamilyMembers,
  addFamilyMember,
  getVisitsByPatientId,
  getVisitById,
  createVisit,
  deleteVisit,
  getDocumentsByPatientId,
  getDocumentById,
  createDocument,
  deleteDocument,
  updateDocumentStatus,
  requestDocumentApproval,
  getAllApprovalRequests,
  getMedicationsByPatientId,
  createMedication,
  deleteMedication,
} from "./db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database
initDb();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || (file.mimetype.includes("pdf") ? ".pdf" : ".jpg");
    const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const unique = `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    cb(null, `${safeName}-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static route to serve uploaded prescription documents
app.use("/uploads", express.static(uploadsDir));

if (!process.env.GEMINI_API_KEY) {
  console.error("ERROR: GEMINI_API_KEY is missing from medis-backend/.env");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Helper regex fallback extraction for missing details
function fallbackExtract(text) {
  let doctorName = "Not available";
  let hospital = "Not available";
  let visitDate = "Not available";
  let visitReason = "Not available";
  let doctorSpecialization = "Not available";
  const medications = [];

  // Doctor match
  const docMatch = text.match(/(?:Dr\.|Doctor)\s+([A-Z][a-zA-Z\.\s]{2,30})/i);
  if (docMatch && docMatch[1].trim().length > 2) {
    doctorName = `Dr. ${docMatch[1].trim().replace(/\s+/g, " ")}`;
  }

  // Hospital / Clinic match
  const hospMatch = text.match(/([A-Z][A-Za-z0-9\s&'-]+(?:Hospital|Clinic|Medical Center|Healthcare|Dispensary|Care Hospital|Apollo|Fortis|Max))/i);
  if (hospMatch && hospMatch[1].trim().length > 3) {
    hospital = hospMatch[1].trim().replace(/\s+/g, " ");
  }

  // Date match
  const dateMatch = text.match(/\b(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})\b/) ||
                    text.match(/\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b/i);
  if (dateMatch) {
    const raw = dateMatch[1];
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) {
      visitDate = parsed.toISOString().split("T")[0];
    } else {
      visitDate = raw;
    }
  }

  // Visit Reason match
  if (/follow[-\s]?up/i.test(text)) {
    visitReason = "Follow-up consultation";
  } else if (/routine|regular\s+check[-\s]?up|general\s+check[-\s]?up/i.test(text)) {
    visitReason = "Routine checkup";
  } else if (/emergency/i.test(text)) {
    visitReason = "Emergency consultation";
  } else if (/review/i.test(text)) {
    visitReason = "Prescription review";
  } else if (/fever|cough|cold|infection/i.test(text)) {
    visitReason = "Acute illness consultation";
  }

  // Regex medicine search
  const medMatches = text.matchAll(/(?:(?:\d+\.|\*|-)\s*)?(?:Tab|Cap|Tablet|Capsule|Syr|Syrup|Inj)?\.?\s*([A-Z][a-zA-Z0-9\s-]{2,25}(?:\d+\s*(?:mg|ml|mcg|g))?)/gi);
  for (const m of medMatches) {
    const name = m[1]?.trim();
    if (name && name.length > 3 && !/hospital|clinic|doctor|patient|date|reason/i.test(name)) {
      medications.push({
        name,
        dosage: "Standard dose",
        frequency: "As prescribed",
        durationDays: 7,
        notes: "",
      });
    }
  }

  return { doctorName, hospital, visitDate, visitReason, doctorSpecialization, medications };
}

app.get("/", (req, res) => {
  res.send("MEDIS backend is running!");
});

// Summarize and Extract details from prescription
app.post("/api/summarize", async (req, res) => {
  console.log("1. Summary & Extraction request received");

  try {
    const { prescriptionText } = req.body;

    if (
      typeof prescriptionText !== "string" ||
      prescriptionText.trim().length < 5
    ) {
      return res.status(400).json({
        error: "Please provide readable prescription text.",
      });
    }

    console.log("2. Sending request to Gemini for extraction & summary...");

    const fallback = fallbackExtract(prescriptionText);

    let summaryText = "";
    let extractedDetails = { ...fallback };
    let extractedMedications = [];

    try {
      const result = await Promise.race([
        ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: `You are an expert clinical medical assistant analyzing a patient's prescription.
Perform tasks with utmost clinical accuracy:
1. Extract visit metadata from the prescription text.
2. Extract all prescribed medications with dose, frequency, and duration.
3. Explain this prescription in simple, patient-friendly language.

ACCURACY RULES:
- doctorName: Extract the doctor's full name (e.g., "Dr. Ramesh Gupta"). If not clearly stated, output "Not available". NEVER invent a doctor name.
- hospital: Extract the hospital, clinic, or medical practice name. If not clearly stated, output "Not available". NEVER invent a hospital name.
- visitDate: Extract the date of the prescription/visit in YYYY-MM-DD format if identifiable, or as written in the text. If not clearly stated, output "Not available". NEVER invent a date.
- visitReason: Identify the reason for visit (such as "Follow-up", "Routine checkup", or symptoms/condition mentioned). If not identifiable, output "Not available". NEVER invent a visit reason.
- doctorSpecialization: Specialization if clearly stated, otherwise "Not available". NEVER invent.
- medications: Array of objects for EACH medicine mentioned:
  - name: Brand or generic name with strength (e.g., "Telmisartan 40mg", "Amoxicillin 500mg").
  - dosage: e.g. "1 tablet", "1 capsule", "5ml".
  - frequency: e.g. "Once daily in morning", "Twice daily after meals", "Three times a day".
  - durationDays: duration in days as an integer number (e.g. 5, 7, 10, 14, 30). If not clearly stated, default to 7 for acute or 30 for daily chronic maintenance meds.
  - notes: Specific intake instructions (e.g. "Take after food", "At bedtime").
- summary: Clear, plain-language patient explanation preserving medicine names, strengths, doses, frequency, and duration.

OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "doctorName": "...",
  "hospital": "...",
  "visitDate": "...",
  "visitReason": "...",
  "doctorSpecialization": "...",
  "medications": [
    {
      "name": "...",
      "dosage": "...",
      "frequency": "...",
      "durationDays": 7,
      "notes": "..."
    }
  ],
  "summary": "..."
}

Prescription text:
${prescriptionText}`,
        }),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Gemini request timed out after 45 seconds")),
            45000
          )
        ),
      ]);

      const raw = result.text.trim();
      console.log("3. Gemini raw response received");

      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        summaryText = parsed.summary || raw;
        extractedDetails = {
          doctorName: parsed.doctorName && parsed.doctorName !== "null" ? parsed.doctorName : fallback.doctorName,
          hospital: parsed.hospital && parsed.hospital !== "null" ? parsed.hospital : fallback.hospital,
          visitDate: parsed.visitDate && parsed.visitDate !== "null" ? parsed.visitDate : fallback.visitDate,
          visitReason: parsed.visitReason && parsed.visitReason !== "null" ? parsed.visitReason : fallback.visitReason,
          doctorSpecialization: parsed.doctorSpecialization && parsed.doctorSpecialization !== "null" ? parsed.doctorSpecialization : fallback.doctorSpecialization,
        };
        if (Array.isArray(parsed.medications)) {
          extractedMedications = parsed.medications;
        }
      } else {
        summaryText = raw;
      }
    } catch (geminiErr) {
      console.warn("Gemini call failed or timed out, falling back to local extraction:", geminiErr.message);
      summaryText = `AI summary generated locally. Please verify with doctor or pharmacist: ${prescriptionText.slice(0, 100)}...`;
      extractedMedications = fallback.medications;
    }

    res.json({
      summary: summaryText,
      extractedDetails,
      medications: extractedMedications,
    });
  } catch (error) {
    console.error("Summarize error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: error.message || "Prescription processing failed",
      });
    }
  }
});

// Save uploaded prescription, visit, extracted text, AI summary, and medications
app.post("/api/prescriptions/save", upload.single("file"), async (req, res) => {
  try {
    const {
      patientId,
      extractedText,
      aiSummary,
      doctorName,
      hospital,
      visitDate,
      visitReason,
      doctorSpecialization,
      visitId,
      medications,
    } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: "patientId is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No prescription file uploaded" });
    }

    // Ensure patient exists in db
    let patient = getPatientById(patientId);
    if (!patient) {
      patient = upsertPatient({
        id: patientId,
        name: "Patient",
        dateOfBirth: "1995-01-01",
        gender: "Other",
        bloodGroup: "O+",
        allergies: [],
        chronicConditions: [],
      });
    }

    const host = req.get("host") || "localhost:5000";
    const protocol = req.protocol || "http";
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    const fileType = req.file.mimetype === "application/pdf" ? "pdf" : "image";

    // Determine visit
    let targetVisitId = visitId;
    let visit = null;

    if (targetVisitId && targetVisitId !== "new") {
      visit = getVisitById(targetVisitId);
    }

    let validDate = visitDate && visitDate !== "Not available" ? visitDate : new Date().toISOString().split("T")[0];

    if (!visit) {
      // Create a new visit automatically from the prescription details
      let vType = "Routine";
      const reasonLower = (visitReason || "").toLowerCase();
      if (reasonLower.includes("follow")) vType = "Follow-up";
      else if (reasonLower.includes("emergency")) vType = "Emergency";
      else if (reasonLower.includes("initial") || reasonLower.includes("first")) vType = "Initial";

      visit = createVisit({
        patientId,
        visitDate: validDate,
        visitType: vType,
        doctorName: doctorName && doctorName.trim() ? doctorName.trim() : "Not available",
        doctorSpecialization: doctorSpecialization && doctorSpecialization.trim() ? doctorSpecialization.trim() : "Not available",
        hospital: hospital && hospital.trim() ? hospital.trim() : "Not available",
        reasonForVisit: visitReason && visitReason.trim() ? visitReason.trim() : "Prescription check",
        notes: `Prescription uploaded: ${req.file.originalname}`,
      });
      targetVisitId = visit.id;
    }

    // Create the document
    const summaryPayload = {
      id: `SUM-${Date.now()}`,
      text: aiSummary || "",
      extractedEntities: [],
      confidence: 0.95,
      generatedAt: new Date().toISOString(),
    };

    const document = createDocument({
      patientId,
      visitId: targetVisitId,
      fileName: req.file.originalname,
      fileType,
      fileUrl,
      uploadedAt: new Date().toISOString(),
      documentLabel: "Prescription",
      processingStatus: "completed",
      approvalStatus: "not_requested",
      extractedText: extractedText || "",
      aiSummary: summaryPayload,
    });

    // Parse and save extracted medications
    let medsList = [];
    if (medications) {
      try {
        medsList = typeof medications === "string" ? JSON.parse(medications) : medications;
      } catch (err) {
        console.warn("Could not parse medications payload:", err);
      }
    }

    const savedMedications = [];
    if (Array.isArray(medsList)) {
      for (const m of medsList) {
        if (!m.name) continue;
        const duration = Number(m.durationDays) || 7;
        const startDate = validDate;
        let endDate = startDate;
        try {
          const s = new Date(startDate);
          if (!isNaN(s.getTime())) {
            const e = new Date(s.getTime() + duration * 24 * 60 * 60 * 1000);
            endDate = e.toISOString().split("T")[0];
          }
        } catch {}

        const createdMed = createMedication({
          patientId,
          visitId: targetVisitId,
          name: m.name,
          dosage: m.dosage || "",
          frequency: m.frequency || "",
          durationDays: duration,
          startDate,
          endDate,
          prescribedBy: doctorName || "Not available",
          hospital: hospital || "Not available",
          notes: m.notes || undefined,
          status: new Date(endDate).getTime() >= new Date().setHours(0, 0, 0, 0) ? "active" : "completed",
        });
        savedMedications.push(createdMed);
      }
    }

    res.json({
      success: true,
      visit,
      document,
      fileUrl,
      medications: savedMedications,
    });
  } catch (error) {
    console.error("Prescription save error:", error);
    res.status(500).json({ error: error.message || "Could not save prescription" });
  }
});

// Patient endpoints
app.get("/api/patients/me", (req, res) => {
  const patient = getPatientById("PATIENT-001");
  if (!patient) return res.status(404).json({ error: "Profile not found" });
  res.json(patient);
});

app.get("/api/patients/:patientId", (req, res) => {
  const patient = getPatientById(req.params.patientId);
  if (!patient) {
    const created = upsertPatient({
      id: req.params.patientId,
      name: "Patient",
      dateOfBirth: "1995-01-01",
      gender: "Other",
      bloodGroup: "O+",
      allergies: [],
      chronicConditions: [],
    });
    return res.json(created);
  }
  res.json(patient);
});

app.patch("/api/patients/:patientId", (req, res) => {
  const updated = upsertPatient({
    id: req.params.patientId,
    ...req.body,
  });
  res.json(updated);
});

// Family members
app.get("/api/patients/:patientId/family", (req, res) => {
  const members = getFamilyMembers(req.params.patientId);
  res.json(members);
});

app.post("/api/patients/:patientId/family", (req, res) => {
  const member = addFamilyMember(req.params.patientId, req.body);
  res.json(member);
});

// Visits
app.get("/api/patients/:patientId/visits", (req, res) => {
  const visits = getVisitsByPatientId(req.params.patientId);
  res.json(visits);
});

app.post("/api/patients/:patientId/visits", (req, res) => {
  const visit = createVisit({
    patientId: req.params.patientId,
    ...req.body,
  });
  res.json(visit);
});

app.delete("/api/visits/:visitId", (req, res) => {
  const success = deleteVisit(req.params.visitId);
  res.json({ success });
});

// Documents
app.get("/api/patients/:patientId/documents", (req, res) => {
  const documents = getDocumentsByPatientId(req.params.patientId);
  res.json(documents);
});

app.delete("/api/documents/:documentId", (req, res) => {
  const success = deleteDocument(req.params.documentId);
  res.json({ success });
});

app.post("/api/documents/:documentId/approve", (req, res) => {
  const { doctorId } = req.body;
  const doc = updateDocumentStatus(req.params.documentId, "approved", doctorId || "DOC-001");
  if (!doc) return res.status(404).json({ error: "Document not found" });
  res.json(doc);
});

app.post("/api/documents/:documentId/reject", (req, res) => {
  const { doctorId, reason } = req.body;
  const doc = updateDocumentStatus(req.params.documentId, "rejected", doctorId || "DOC-001", reason || "");
  if (!doc) return res.status(404).json({ error: "Document not found" });
  res.json(doc);
});

app.post("/api/documents/:documentId/request-approval", (req, res) => {
  const doc = requestDocumentApproval(req.params.documentId);
  if (!doc) return res.status(404).json({ error: "Document not found" });
  res.json(doc);
});

// Medications
app.get("/api/patients/:patientId/medications", (req, res) => {
  const meds = getMedicationsByPatientId(req.params.patientId);
  res.json(meds);
});

app.delete("/api/medications/:medicationId", (req, res) => {
  const success = deleteMedication(req.params.medicationId);
  res.json({ success });
});

// Auth OTP verification
app.post("/api/auth/verify-otp", (req, res) => {
  const { mobileNumber, otpCode } = req.body;
  if (otpCode !== "123456") {
    return res.status(400).json({ error: "Incorrect OTP. Please try again." });
  }

  let patient = getPatientByMobile(mobileNumber || "");
  if (!patient) {
    const newId = `PID-${Date.now()}`;
    patient = upsertPatient({
      id: newId,
      name: "Aditi Sharma",
      mobileNumber: mobileNumber || "+91 98765 43210",
      dateOfBirth: "1992-04-15",
      gender: "Female",
      bloodGroup: "B+",
      email: "aditi.sharma@example.com",
      allergies: [],
      chronicConditions: [],
    });
  }

  res.json({
    user: {
      id: patient.id,
      role: "PATIENT",
      name: patient.name,
      mobileNumber: patient.mobileNumber,
    },
  });
});

// Doctor queue / all patients
app.get("/api/doctors/queue", (req, res) => {
  const patients = getAllPatients();
  const queue = patients.map((p) => ({
    patientId: p.id,
    patientName: p.name,
    pendingCount: getDocumentsByPatientId(p.id).filter((d) => d.approvalStatus === "pending").length,
    lastVisitDate: getVisitsByPatientId(p.id)[0]?.visitDate || "None",
  }));
  res.json(queue);
});

// Doctor Approval Log (all prescription review requests with AI summary & medications)
app.get("/api/doctors/approval-log", (req, res) => {
  try {
    const requests = getAllApprovalRequests();
    res.json(requests);
  } catch (err) {
    console.error("approval-log error:", err);
    res.status(500).json({ error: "Failed to fetch doctor approval log" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MEDIS backend running on http://localhost:${PORT}`);
});
