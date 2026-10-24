# MEDIS-X — Medical Extraction, Documentation & Intelligent Systems

**MEDIS-X** is a full-stack, AI-powered healthcare application designed to simplify prescription processing, medical record management, medication tracking, and doctor verification. It uses Optical Character Recognition (OCR) and Google Gemini AI to extract prescription information, generate plain-language clinical summaries, and organize medical data in one centralized platform.

## 🌟 Key Features

### 👤 1. Patient Portal
- **Prescription Upload:** Upload printed or digital prescriptions in PDF, PNG, and JPEG formats.
- **OCR Extraction:** Extract text using Tesseract.js and PDF.js.
- **AI Clinical Summaries:** Use Google Gemini to summarize prescriptions and extract doctor details, hospital, visit date, reason, and prescribed medications.
- **Medical Records:** View saved visits, original documents, and AI-generated summaries.
- **Medication Tracking:** Manage prescriptions with dosage, frequency, food instructions, and duration.
- **Dose Logging:** Mark medications as taken and track daily intake.
- **Patient Timeline:** View medical visits chronologically.
- **Doctor Approval:** Request verification and monitor approval status.

### 🩺 2. Doctor Portal
- **Approval Dashboard:** View prescription review requests from patients.
- **Clinical Review:** Examine patient details, AI summaries, medications, and original documents.
- **Approval & Rejection:** Approve records or reject requests with clinical notes.
- **Status Synchronization:** Display doctor decisions in the patient's portal.

### 💾 3. Persistent Backend
- RESTful APIs built with Express.js.
- SQLite database using `node:sqlite`.
- Local storage for uploaded prescription documents.
- CRUD operations for visits, documents, and medications.
- Persistent medical records across application reloads.

## 🛠️ Technology Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Node.js, Express.js
- **Database:** SQLite (`node:sqlite`)
- **AI Integration:** Google Gemini API
- **OCR:** Tesseract.js
- **PDF Processing:** PDF.js
- **File Uploads:** Multer

## 📁 Project Structure

```text
MEDIS-X/
├── medis-backend/
│   ├── server.js
│   ├── db.js
│   ├── medis.db
│   └── uploads/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── types/
│   └── utils/
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js v24 recommended
- npm v9 or later
- Google Gemini API key

### 1. Configure the Backend

```bash
cd medis-backend
npm install
```

Create `medis-backend/.env`:

```env
PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key
```

Start the backend:

```bash
node server.js
```

Backend URL: `http://localhost:5000`

### 2. Configure the Frontend

Open a new terminal in the project root:

```bash
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## 📡 API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/summarize` | Generate AI summaries |
| POST | `/api/prescriptions/save` | Save prescription records |
| GET | `/api/patients/:patientId/visits` | Retrieve patient visits |
| GET | `/api/patients/:patientId/documents` | Retrieve documents |
| GET | `/api/patients/:patientId/medications` | Retrieve medications |
| DELETE | `/api/visits/:visitId` | Delete a visit |
| POST | `/api/documents/:documentId/request-approval` | Request doctor review |
| GET | `/api/doctors/approval-log` | View approval requests |
| POST | `/api/documents/:documentId/approve` | Approve a prescription |
| POST | `/api/documents/:documentId/reject` | Reject a prescription |

## 🔄 Development Role Switcher

Switch between Patient, Doctor, and Admin views during development to explore the application's features. The doctor dashboard provides access to prescription review requests.

## 🔐 Security & Privacy

- Store API keys in environment variables.
- Exclude `.env`, private medical records, uploaded files, and sensitive database files from public repositories.
- Doctor verification should be performed by qualified healthcare professionals.
- AI-generated summaries are intended to support clinical review, not replace professional medical judgment.

## 📄 License

Private and confidential proprietary application. Unauthorized use, reproduction, or distribution is prohibited.
