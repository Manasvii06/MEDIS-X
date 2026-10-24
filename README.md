
MEDIS-X --- Medical Extraction, Documentation & Intelligent Systems
MEDIS-X is a full-stack, AI-powered healthcare application designed to
simplify prescription processing, medical record management, medication
tracking, and doctor verification. It uses Optical Character Recognition
(OCR) and Google Gemini AI to extract prescription information, generate
plain-language clinical summaries, and organize medical data in one
centralized platform.

Key Features
1. Patient Portal
Upload printed or digital prescriptions in PDF, PNG, and JPEG
formats.
Extract text from documents using Tesseract.js and PDF.js.
Generate AI-assisted clinical summaries with Google Gemini,
including doctor, hospital, visit date, reason, and prescribed
medication details.
View saved visits, original documents, and AI-generated summaries.
Track medication dosage, frequency, food instructions, and duration.
Mark doses as taken and track daily intake.
View medical visits in chronological order.
Request doctor verification and view approval status.
2. Doctor Portal
View prescription review requests in the doctor approval dashboard.
Review patient details, AI-generated summaries, prescribed
medications, and original documents.
Approve prescription records or reject requests with clinical notes.
Synchronize review decisions with the patient's portal.
3. Persistent Backend
REST API built with Node.js and Express.
SQLite database using node:sqlite.
Local storage for uploaded prescription documents.
CRUD operations for visits, documents, and medications.
Persistent records across application reloads.
Technology Stack
Frontend: React, TypeScript, Tailwind CSS, Vite
Backend: Node.js, Express.js
Database: SQLite (node:sqlite)
AI integration: Google Gemini API
OCR: Tesseract.js
PDF processing: PDF.js
File uploads: Multer
Project Structure
MEDIS-X/
├── medis-backend/
│   ├── server.js
│   ├── db.js
│   ├── .env.example
│   └── uploads/              # Uploaded documents; keep private
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── types/
│   └── utils/
├── public/
├── package.json
├── README.md
└── .gitignore
The exact folders and files may vary slightly by project version. The
SQLite database and uploaded medical documents may be created locally
when the application runs.

Getting Started
Prerequisites
Node.js (version 24 recommended for native node:sqlite)
npm (version 9 or later)
A Google Gemini API key
1. Configure the Backend
Open a terminal in the project root, then run:

cd medis-backend
npm install
Create a file named .env inside medis-backend/ and add your local
configuration:

PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key
Replace the placeholder with your own API key. Never commit the real
.env file or publish API keys.

Start the backend:

node server.js
The backend should be available at http://localhost:5000.

2. Configure the Frontend
Open a second terminal in the project root and run:

npm install
npm run dev
Vite typically serves the frontend at http://localhost:5173.

API Endpoints
Prescriptions and Processing
POST /api/summarize --- Generate an AI clinical summary and
extract prescription metadata and medication details.
POST /api/prescriptions/save --- Save the uploaded file and create
related visit, document, and medication records.
Patient and Records
GET /api/patients/:patientId/visits --- Retrieve a patient's
visits.
DELETE /api/visits/:visitId --- Delete a visit and associated
records, subject to backend implementation.
GET /api/patients/:patientId/documents --- Retrieve a patient's
documents.
DELETE /api/documents/:documentId --- Delete a document.
GET /api/patients/:patientId/medications --- Retrieve a patient's
medications.
DELETE /api/medications/:medicationId --- Delete a medication
record.
Doctor Approvals
POST /api/documents/:documentId/request-approval --- Request
doctor review.
GET /api/doctors/approval-log --- Retrieve prescription review
requests.
POST /api/documents/:documentId/approve --- Approve a prescription
document.
POST /api/documents/:documentId/reject --- Reject a prescription
document with a reason.
Confirm endpoint paths and behavior against the current backend
implementation before relying on them.

Development Role Switcher
In development mode, the application may provide a role switcher for
exploring Patient, Doctor, and Admin views. The available roles and
sample profiles depend on the current project configuration.

Security and Privacy
Keep API keys, passwords, and other secrets in environment
variables.
Do not commit .env files, real patient records, uploaded
prescriptions, or sensitive database files to a public repository.
Ensure .gitignore excludes local secrets, uploaded medical
documents, and private database files.
Use only synthetic or properly de-identified medical data for
demonstrations.
Doctor verification should be performed by qualified healthcare
professionals.
AI-generated summaries support clinical review and must not replace
professional medical judgment.
License
Private and confidential proprietary application. Unauthorized use,
reproduction, or distribution is prohibited.

