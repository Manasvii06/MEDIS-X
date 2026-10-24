# IMPS — Integrated Medical Records & Prescription Portal

A full-stack, AI-powered healthcare application built with **React**, **TypeScript**, **Tailwind CSS**, **Node.js**, **Express**, and **SQLite**.

IMPS enables patients to upload printed or digital prescriptions, extract text via OCR, generate plain-language AI clinical summaries with **Google Gemini**, track medications with interactive dose logging, and request clinical verification from doctors through a centralized approval log.

---

## 🌟 Key Features

### 1. Patient Portal
- **Prescription Upload & Extraction**:
  - Drag-and-drop or file upload for PDFs and images (PNG, JPEG).
  - Client-side OCR text extraction using Tesseract.js and PDF.js.
  - **Gemini 3.1 Flash Lite** AI summarization extracting visit metadata (Doctor, Hospital, Date, Visit Reason) and an array of prescribed medications.
  - **"Update My Profile"** button saves original files, parsed visits, documents, and medications directly to persistent storage.
- **My Records**:
  - Displays all saved visits with doctor, hospital, visit date, and reason.
  - **Single Bin Icon**: Placed on the right side below the visit date with an in-app confirmation modal popup (`ConfirmDialogModal`).
  - **Actions**: Clickable buttons to view the AI summary modal or open the original uploaded PDF/image in a new tab.
  - **Doctor Approval**: Includes a **"Request Doctor Approval"** button. Once requested, displays live status (*Pending Approval* → *Doctor Approved*).
- **Patient Timeline**:
  - Chronological timeline of all medical visits (newest first).
  - Retains history across reloads and displays linked documents.
- **Medications (Unified Prescription Box)**:
  - Prescriptions containing multiple medicines are grouped into **one clean card** instead of separate bloated cards.
  - Streamlined pills for dosage, frequency (e.g., `2x daily`, `4x daily`), food instructions (`Before food`, `After food`), and duration (`10d`).
  - **Interactive Dose Checkbox**: Tap any row to toggle its daily intake status (`✓ Taken`), persisted locally.
  - Single bin icon below the date to remove prescription medications with confirmation.

### 2. Doctor Portal
- **Doctor's Approval Log** (`/doctor/dashboard`):
  - Common login log displaying all patient prescription review requests.
  - For each request:
    - **Patient Profile**: Name, ID, visit date, and doctor details.
    - **Generated AI Summary**: Highlighted plain-language summary.
    - **Prescribed Medications**: Structured table showing all extracted medicines, dosages, and instructions.
    - **Original Document**: Direct links to open original PDF/image.
    - **Clinical Actions**: One-click **"Approve Summary & Medications"** or **"Reject"** (with clinical notes).
  - Approving instantly synchronizes across the database and displays **"✓ Doctor Approved"** in the patient's view.

### 3. Persistent Backend Storage (`medis-backend`)
- Built-in synchronous SQLite database (`node:sqlite`) with zero external native driver dependencies.
- Local disk storage for original uploaded PDFs and images (`medis-backend/uploads/`).
- Complete removal of all mock-data files; all operations perform real database CRUD.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v20+ (Node v24 recommended for native `node:sqlite`)
- **npm** v9+

### 1. Backend Setup
```bash
cd medis-backend
npm install
```

Configure your environment variables in `medis-backend/.env`:
```env
PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key_here
```

Start the backend server:
```bash
node server.js
```
The backend will run on `http://localhost:5000`.

### 2. Frontend Setup
From the project root:
```bash
npm install
npm run dev
```
The frontend will launch at `http://localhost:5173`.

---

## 🔄 Development Role Switcher

In development mode (`npm run dev`), a floating role switcher is pinned to the bottom-left corner of the screen:
- **PATIENT**: Switches to patient view (`Aditi Sharma` / `PATIENT-001`).
- **DOCTOR**: Switches to doctor view (`Dr. Rhea Menon` / `DOC-001`) to access the **Doctor's Approval Log**.
- **ADMIN**: Access administrative views.

---

## 📁 Project Architecture

```
imps-frontend/
├── medis-backend/                 # Express + SQLite Backend
│   ├── server.js                  # Express API routes, multer upload, Gemini AI
│   ├── db.js                      # SQLite schema, tables & CRUD operations
│   ├── medis.db                   # SQLite persistent database file
│   └── uploads/                   # Stored PDF and image prescription files
│
├── src/
│   ├── components/
│   │   ├── common/                # Reusable icons, modals, status badges
│   │   │   ├── ConfirmDialogModal.tsx # In-app delete confirmation modal
│   │   │   ├── StatusBadge.tsx    # Doctor approval & processing badges
│   │   │   └── icons.tsx          # Minimal SVG icon library
│   │   ├── documents/             # DocumentCard, DocumentPreviewModal, AISummaryPanel
│   │   ├── patient/               # VisitGroupCard, MedicationGroupCard, VisitTimelineList
│   │   └── doctor/                # AnalyticsStatCard, PatientQueueRow
│   ├── pages/
│   │   ├── patient/               # PatientUploadPage, PatientRecordsPage, PatientMedicationsPage
│   │   ├── doctor/                # DoctorDashboardPage (Doctor's Approval Log)
│   │   └── auth/                  # LoginPage
│   ├── services/                  # Real API services (document, visit, medication, doctor)
│   ├── types/                     # TypeScript definitions (document, visit, medication, doctor)
│   └── utils/                     # Formatting utilities (date, status styles, OCR)
```

---

## 📡 API Endpoints

### Prescriptions & Processing
- `POST /api/summarize` — Generates Gemini clinical summary and extracts metadata + medications.
- `POST /api/prescriptions/save` — Stores uploaded file on disk, creates visit, document, and medication entries.

### Patient & Records
- `GET /api/patients/:patientId/visits` — Lists all patient visits (newest first).
- `DELETE /api/visits/:visitId` — Permanently deletes a visit and all associated documents & medications.
- `GET /api/patients/:patientId/documents` — Retrieves documents for a patient.
- `DELETE /api/documents/:documentId` — Deletes a specific document.
- `GET /api/patients/:patientId/medications` — Retrieves all medications for a patient.
- `DELETE /api/medications/:medicationId` — Deletes an individual medication record.

### Doctor Approvals
- `POST /api/documents/:documentId/request-approval` — Submits a prescription record for doctor review.
- `GET /api/doctors/approval-log` — Returns all prescription requests with patient details, AI summaries, and medications.
- `POST /api/documents/:documentId/approve` — Marks a prescription document as approved.
- `POST /api/documents/:documentId/reject` — Marks a prescription document as rejected with reason.

---

## 🛡️ License
Private and confidential proprietary application.
