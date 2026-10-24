import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'medis.db');

export const db = new DatabaseSync(dbPath);

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      date_of_birth TEXT,
      gender TEXT,
      blood_group TEXT,
      mobile_number TEXT,
      email TEXT,
      address TEXT,
      allergies TEXT,
      chronic_conditions TEXT,
      emergency_contact TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS family_members (
      id TEXT PRIMARY KEY,
      primary_patient_id TEXT NOT NULL,
      linked_patient_id TEXT NOT NULL,
      name TEXT NOT NULL,
      relation TEXT NOT NULL,
      date_of_birth TEXT,
      gender TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS visits (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      visit_date TEXT NOT NULL,
      visit_type TEXT NOT NULL,
      doctor_name TEXT NOT NULL,
      doctor_specialization TEXT,
      hospital TEXT NOT NULL,
      reason_for_visit TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      visit_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_url TEXT NOT NULL,
      uploaded_at TEXT NOT NULL,
      document_label TEXT NOT NULL,
      processing_status TEXT NOT NULL,
      approval_status TEXT NOT NULL,
      reviewed_by TEXT,
      reviewed_at TEXT,
      rejection_reason TEXT,
      extracted_text TEXT,
      ai_summary TEXT
    );

    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      visit_id TEXT,
      name TEXT NOT NULL,
      dosage TEXT,
      frequency TEXT,
      duration_days INTEGER,
      start_date TEXT,
      end_date TEXT,
      prescribed_by TEXT,
      hospital TEXT,
      notes TEXT,
      status TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Migration: safely ensure extra columns exist in medications if older table exists
  try { db.exec('ALTER TABLE medications ADD COLUMN visit_id TEXT;'); } catch {}
  try { db.exec('ALTER TABLE medications ADD COLUMN duration_days INTEGER;'); } catch {}
  try { db.exec('ALTER TABLE medications ADD COLUMN hospital TEXT;'); } catch {}
  try { db.exec('ALTER TABLE medications ADD COLUMN notes TEXT;'); } catch {}

  // Ensure default patient profile exists
  const defaultPatient = getPatientById('PATIENT-001');
  if (!defaultPatient) {
    upsertPatient({
      id: 'PATIENT-001',
      name: 'Aditi Sharma',
      dateOfBirth: '1992-04-15',
      gender: 'Female',
      bloodGroup: 'B+',
      mobileNumber: '+91 98765 43210',
      email: 'aditi.sharma@example.com',
      address: 'Indiranagar, Bengaluru, Karnataka 560038',
      allergies: ['Penicillin'],
      chronicConditions: ['Hypertension (Stage 1)'],
      emergencyContact: {
        name: 'Rohan Sharma',
        relation: 'Spouse',
        mobileNumber: '+91 98765 43211',
      },
    });
  }

  const mockAlias = getPatientById('mock-patient-id');
  if (!mockAlias) {
    upsertPatient({
      id: 'mock-patient-id',
      name: 'Aditi Sharma',
      dateOfBirth: '1992-04-15',
      gender: 'Female',
      bloodGroup: 'B+',
      mobileNumber: '+91 98765 43210',
      email: 'aditi.sharma@example.com',
      address: 'Indiranagar, Bengaluru, Karnataka 560038',
      allergies: ['Penicillin'],
      chronicConditions: ['Hypertension (Stage 1)'],
      emergencyContact: {
        name: 'Rohan Sharma',
        relation: 'Spouse',
        mobileNumber: '+91 98765 43211',
      },
    });
  }
}

// Patient helpers
export function getPatientById(id) {
  const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
  if (!row) return null;
  return formatPatientRow(row);
}

export function getPatientByMobile(mobileNumber) {
  const clean = mobileNumber.replace(/\D/g, '');
  const rows = db.prepare('SELECT * FROM patients').all();
  for (const row of rows) {
    if (row.mobile_number && row.mobile_number.replace(/\D/g, '').includes(clean)) {
      return formatPatientRow(row);
    }
  }
  return null;
}

export function getAllPatients() {
  const rows = db.prepare('SELECT * FROM patients ORDER BY created_at DESC').all();
  return rows.map(formatPatientRow);
}

export function upsertPatient(p) {
  const existing = getPatientById(p.id);
  const now = new Date().toISOString();
  if (existing) {
    db.prepare(`
      UPDATE patients SET
        name = ?,
        date_of_birth = ?,
        gender = ?,
        blood_group = ?,
        mobile_number = ?,
        email = ?,
        address = ?,
        allergies = ?,
        chronic_conditions = ?,
        emergency_contact = ?
      WHERE id = ?
    `).run(
      p.name ?? existing.name,
      p.dateOfBirth ?? existing.dateOfBirth,
      p.gender ?? existing.gender,
      p.bloodGroup ?? existing.bloodGroup,
      p.mobileNumber ?? existing.mobileNumber,
      p.email ?? existing.email,
      p.address ?? existing.address,
      JSON.stringify(p.allergies ?? existing.allergies ?? []),
      JSON.stringify(p.chronicConditions ?? existing.chronicConditions ?? []),
      JSON.stringify(p.emergencyContact ?? existing.emergencyContact ?? null),
      p.id
    );
  } else {
    db.prepare(`
      INSERT INTO patients (
        id, name, date_of_birth, gender, blood_group, mobile_number, email, address,
        allergies, chronic_conditions, emergency_contact, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      p.id,
      p.name || 'Patient',
      p.dateOfBirth || '1995-01-01',
      p.gender || 'Other',
      p.bloodGroup || 'O+',
      p.mobileNumber || '',
      p.email || '',
      p.address || '',
      JSON.stringify(p.allergies || []),
      JSON.stringify(p.chronicConditions || []),
      JSON.stringify(p.emergencyContact || null),
      now
    );
  }
  return getPatientById(p.id);
}

function formatPatientRow(row) {
  let allergies = [];
  let chronicConditions = [];
  let emergencyContact = undefined;

  try { allergies = row.allergies ? JSON.parse(row.allergies) : []; } catch {}
  try { chronicConditions = row.chronic_conditions ? JSON.parse(row.chronic_conditions) : []; } catch {}
  try { emergencyContact = row.emergency_contact ? JSON.parse(row.emergency_contact) : undefined; } catch {}

  return {
    id: row.id,
    name: row.name,
    dateOfBirth: row.date_of_birth || '',
    gender: row.gender || 'Other',
    bloodGroup: row.blood_group || '',
    mobileNumber: row.mobile_number || '',
    email: row.email || undefined,
    address: row.address || undefined,
    allergies,
    chronicConditions,
    emergencyContact: emergencyContact || undefined,
  };
}

// Family members
export function getFamilyMembers(primaryPatientId) {
  const rows = db.prepare('SELECT * FROM family_members WHERE primary_patient_id = ?').all(primaryPatientId);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    relation: r.relation,
    dateOfBirth: r.date_of_birth,
    gender: r.gender,
    linkedPatientId: r.linked_patient_id,
  }));
}

export function addFamilyMember(primaryPatientId, member) {
  const id = `FAM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const linkedPatientId = `PID-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  upsertPatient({
    id: linkedPatientId,
    name: member.name,
    dateOfBirth: member.dateOfBirth,
    gender: member.gender,
    bloodGroup: 'Unknown',
    mobileNumber: '',
    allergies: [],
    chronicConditions: [],
  });

  db.prepare(`
    INSERT INTO family_members (id, primary_patient_id, linked_patient_id, name, relation, date_of_birth, gender, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, primaryPatientId, linkedPatientId, member.name, member.relation, member.dateOfBirth, member.gender, now);

  return {
    id,
    name: member.name,
    relation: member.relation,
    dateOfBirth: member.dateOfBirth,
    gender: member.gender,
    linkedPatientId,
  };
}

// Visits
export function getVisitsByPatientId(patientId) {
  const rows = db.prepare('SELECT * FROM visits WHERE patient_id = ? ORDER BY visit_date DESC, created_at DESC').all(patientId);
  return rows.map((r) => {
    const docRows = db.prepare('SELECT id FROM documents WHERE visit_id = ?').all(r.id);
    return {
      id: r.id,
      patientId: r.patient_id,
      visitDate: r.visit_date,
      visitType: r.visit_type,
      doctorName: r.doctor_name,
      doctorSpecialization: r.doctor_specialization || 'Not available',
      hospital: r.hospital,
      reasonForVisit: r.reason_for_visit,
      notes: r.notes || undefined,
      documentIds: docRows.map((d) => d.id),
    };
  });
}

export function getVisitById(id) {
  const row = db.prepare('SELECT * FROM visits WHERE id = ?').get(id);
  if (!row) return null;
  const docRows = db.prepare('SELECT id FROM documents WHERE visit_id = ?').all(row.id);
  return {
    id: row.id,
    patientId: row.patient_id,
    visitDate: row.visit_date,
    visitType: row.visit_type,
    doctorName: row.doctor_name,
    doctorSpecialization: row.doctor_specialization || 'Not available',
    hospital: row.hospital,
    reasonForVisit: row.reason_for_visit,
    notes: row.notes || undefined,
    documentIds: docRows.map((d) => d.id),
  };
}

export function createVisit(visit) {
  const id = visit.id || `VISIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO visits (id, patient_id, visit_date, visit_type, doctor_name, doctor_specialization, hospital, reason_for_visit, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    visit.patientId,
    visit.visitDate || now.split('T')[0],
    visit.visitType || 'Routine',
    visit.doctorName || 'Not available',
    visit.doctorSpecialization || 'Not available',
    visit.hospital || 'Not available',
    visit.reasonForVisit || 'Not available',
    visit.notes || null,
    now
  );
  return getVisitById(id);
}

export function deleteVisit(visitId) {
  // Delete associated documents
  db.prepare('DELETE FROM documents WHERE visit_id = ?').run(visitId);
  // Delete associated medications
  db.prepare('DELETE FROM medications WHERE visit_id = ?').run(visitId);
  // Delete the visit
  const res = db.prepare('DELETE FROM visits WHERE id = ?').run(visitId);
  return res.changes > 0;
}

// Documents
export function getDocumentsByPatientId(patientId) {
  const rows = db.prepare('SELECT * FROM documents WHERE patient_id = ? ORDER BY uploaded_at DESC').all(patientId);
  return rows.map(formatDocumentRow);
}

export function getDocumentById(id) {
  const row = db.prepare('SELECT * FROM documents WHERE id = ?').get(id);
  if (!row) return null;
  return formatDocumentRow(row);
}

export function createDocument(doc) {
  const id = doc.id || `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  let aiSummaryJson = null;
  if (doc.aiSummary) {
    aiSummaryJson = typeof doc.aiSummary === 'string' ? doc.aiSummary : JSON.stringify(doc.aiSummary);
  }

  db.prepare(`
    INSERT INTO documents (
      id, patient_id, visit_id, file_name, file_type, file_url, uploaded_at,
      document_label, processing_status, approval_status, reviewed_by, reviewed_at,
      rejection_reason, extracted_text, ai_summary
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    doc.patientId,
    doc.visitId,
    doc.fileName,
    doc.fileType,
    doc.fileUrl,
    doc.uploadedAt || now,
    doc.documentLabel || 'Prescription',
    doc.processingStatus || 'completed',
    doc.approvalStatus || 'pending',
    doc.reviewedBy || null,
    doc.reviewedAt || null,
    doc.rejectionReason || null,
    doc.extractedText || null,
    aiSummaryJson
  );

  return getDocumentById(id);
}

export function deleteDocument(documentId) {
  const doc = getDocumentById(documentId);
  if (!doc) return false;

  db.prepare('DELETE FROM documents WHERE id = ?').run(documentId);

  // If visit has no more documents, clean up visit and its medications
  if (doc.visitId) {
    const remaining = db.prepare('SELECT COUNT(*) as count FROM documents WHERE visit_id = ?').get(doc.visitId);
    if (!remaining || remaining.count === 0) {
      db.prepare('DELETE FROM visits WHERE id = ?').run(doc.visitId);
      db.prepare('DELETE FROM medications WHERE visit_id = ?').run(doc.visitId);
    }
  }

  return true;
}

export function updateDocumentStatus(id, approvalStatus, reviewedBy, rejectionReason = null) {
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE documents SET
      approval_status = ?,
      reviewed_by = ?,
      reviewed_at = ?,
      rejection_reason = ?
    WHERE id = ?
  `).run(approvalStatus, reviewedBy, now, rejectionReason, id);

  return getDocumentById(id);
}

export function requestDocumentApproval(id) {
  db.prepare(`
    UPDATE documents SET
      approval_status = 'pending',
      rejection_reason = NULL
    WHERE id = ?
  `).run(id);
  return getDocumentById(id);
}

export function getAllApprovalRequests() {
  const docRows = db.prepare('SELECT * FROM documents ORDER BY uploaded_at DESC').all();
  return docRows.map((docRow) => {
    const doc = formatDocumentRow(docRow);
    const patient = getPatientById(doc.patientId) || { id: doc.patientId, name: 'Patient' };
    const visit = getVisitById(doc.visitId) || {
      id: doc.visitId,
      visitDate: doc.uploadedAt ? doc.uploadedAt.split('T')[0] : '',
      doctorName: 'Not available',
      doctorSpecialization: 'Not available',
      hospital: 'Not available',
      reasonForVisit: 'Not available',
    };
    const medRows = db.prepare('SELECT * FROM medications WHERE visit_id = ?').all(doc.visitId);
    const medications = medRows.map((r) => ({
      id: r.id,
      name: r.name,
      dosage: r.dosage || '',
      frequency: r.frequency || '',
      durationDays: r.duration_days != null ? Number(r.duration_days) : 7,
      startDate: r.start_date || '',
      endDate: r.end_date || '',
      notes: r.notes || undefined,
    }));

    return {
      documentId: doc.id,
      document: doc,
      patient: {
        id: patient.id,
        name: patient.name,
        mobileNumber: patient.mobileNumber,
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth,
      },
      visit: {
        id: visit.id,
        visitDate: visit.visitDate,
        doctorName: visit.doctorName,
        doctorSpecialization: visit.doctorSpecialization,
        hospital: visit.hospital,
        reasonForVisit: visit.reasonForVisit,
      },
      medications,
      approvalStatus: doc.approvalStatus,
      reviewedBy: doc.reviewedBy,
      reviewedAt: doc.reviewedAt,
      rejectionReason: doc.rejectionReason,
    };
  });
}


function formatDocumentRow(row) {
  let aiSummary = undefined;
  if (row.ai_summary) {
    try {
      aiSummary = JSON.parse(row.ai_summary);
    } catch {
      aiSummary = {
        id: `SUM-${row.id}`,
        text: row.ai_summary,
        extractedEntities: [],
        confidence: 0.95,
        generatedAt: row.uploaded_at,
      };
    }
  }

  return {
    id: row.id,
    patientId: row.patient_id,
    visitId: row.visit_id,
    fileName: row.file_name,
    fileType: row.file_type,
    fileUrl: row.file_url,
    uploadedAt: row.uploaded_at,
    documentLabel: row.document_label,
    processingStatus: row.processing_status,
    approvalStatus: row.approval_status,
    reviewedBy: row.reviewed_by || undefined,
    reviewedAt: row.reviewed_at || undefined,
    rejectionReason: row.rejection_reason || undefined,
    extractedText: row.extracted_text || undefined,
    aiSummary,
  };
}

// Medications
export function getMedicationsByPatientId(patientId) {
  const rows = db.prepare('SELECT * FROM medications WHERE patient_id = ? ORDER BY start_date DESC, created_at DESC').all(patientId);
  return rows.map((r) => ({
    id: r.id,
    patientId: r.patient_id,
    visitId: r.visit_id || '',
    name: r.name,
    dosage: r.dosage || '',
    frequency: r.frequency || '',
    durationDays: r.duration_days != null ? Number(r.duration_days) : 7,
    startDate: r.start_date || new Date().toISOString().split('T')[0],
    endDate: r.end_date || new Date().toISOString().split('T')[0],
    prescribedBy: r.prescribed_by || 'Not available',
    hospital: r.hospital || 'Not available',
    notes: r.notes || undefined,
  }));
}

export function createMedication(med) {
  const id = med.id || `MED-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO medications (
      id, patient_id, visit_id, name, dosage, frequency, duration_days,
      start_date, end_date, prescribed_by, hospital, notes, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    med.patientId,
    med.visitId || null,
    med.name,
    med.dosage || '',
    med.frequency || '',
    med.durationDays || 7,
    med.startDate || now.split('T')[0],
    med.endDate || now.split('T')[0],
    med.prescribedBy || 'Not available',
    med.hospital || 'Not available',
    med.notes || null,
    med.status || 'active',
    now
  );
  return { id, ...med };
}

export function deleteMedication(medicationId) {
  const res = db.prepare('DELETE FROM medications WHERE id = ?').run(medicationId);
  return res.changes > 0;
}
