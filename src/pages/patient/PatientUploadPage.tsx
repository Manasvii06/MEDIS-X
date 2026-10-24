import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Visit } from '../../types/visit.types';
import { DocumentUploadZone } from '../../components/documents/DocumentUploadZone';
import { VisitPicker } from '../../components/patient/VisitPicker';
import * as documentService from '../../services/document.service';
import * as visitService from '../../services/visit.service';
import { CheckCircleIcon, FileTextIcon, ActivityIcon, ArrowRightIcon, PillIcon } from '../../components/common/icons';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useActivePatient } from '../../hooks/useActivePatient';
import { ROUTES } from '../../constants/routes.constants';
import { API_BASE_URL } from '../../constants/api.constants';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface ExtractedDetails {
  doctorName: string;
  hospital: string;
  visitDate: string;
  visitReason: string;
  doctorSpecialization: string;
}

interface ExtractedMedication {
  name: string;
  dosage?: string;
  frequency?: string;
  durationDays?: number;
  notes?: string;
}

async function extractPrescriptionText(file: File): Promise<string> {
  if (file.type.startsWith('image/')) {
    const result = await Tesseract.recognize(file, 'eng');
    const text = result.data.text.trim();

    if (text.length < 5) {
      throw new Error(
        'No readable text found. Please upload a clearer prescription image.'
      );
    }

    return text;
  }

  if (
    file.type === 'application/pdf' ||
    file.name.toLowerCase().endsWith('.pdf')
  ) {
    const pdf = await pdfjsLib.getDocument({
      data: await file.arrayBuffer(),
    }).promise;

    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();

      const pageText = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');

      pages.push(pageText);
    }

    const extractedText = pages.join('\n').trim();

    if (extractedText.length >= 5) {
      return extractedText;
    }

    const scannedPages: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Could not process the scanned PDF.');
      }

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      await page.render({
        canvas,
        canvasContext: context,
        viewport,
      }).promise;

      const result = await Tesseract.recognize(canvas, 'eng');
      scannedPages.push(result.data.text.trim());
    }

    const scannedText = scannedPages.join('\n').trim();

    if (scannedText.length < 5) {
      throw new Error(
        'No readable prescription text found in the PDF. Please upload a clearer file.'
      );
    }

    return scannedText;
  }

  throw new Error('Please upload a JPG, PNG, or PDF prescription.');
}

export function PatientUploadPage() {
  const navigate = useNavigate();
  const { activePatientId, activePatientName, isViewingSelf } = useActivePatient();

  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoadingVisits, setIsLoadingVisits] = useState(true);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedName, setUploadedName] = useState('');
  const [error, setError] = useState('');
  const [ocrText, setOcrText] = useState('');
  const [summary, setSummary] = useState('');
  const [processingStatus, setProcessingStatus] = useState('');

  const [extractedDetails, setExtractedDetails] = useState<ExtractedDetails>({
    doctorName: 'Not available',
    hospital: 'Not available',
    visitDate: 'Not available',
    visitReason: 'Not available',
    doctorSpecialization: 'Not available',
  });

  const [extractedMedications, setExtractedMedications] = useState<ExtractedMedication[]>([]);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadVisits() {
      setIsLoadingVisits(true);
      setError('');

      try {
        const result = await visitService.getVisitsForPatient(activePatientId);
        if (cancelled) return;
        setVisits(result);
      } catch (err) {
        if (!cancelled) {
          console.warn('Could not load existing visits:', err);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingVisits(false);
        }
      }
    }

    if (activePatientId) {
      void loadVisits();
    } else {
      setVisits([]);
      setIsLoadingVisits(false);
    }

    return () => {
      cancelled = true;
    };
  }, [activePatientId]);

  const handleSelectExisting = (visitId: string) => {
    setSelectedVisitId(visitId);
    setError('');
  };

  const handleCreateNew = async (
    visitDetails: Omit<Visit, 'id' | 'patientId' | 'documentIds'>
  ) => {
    if (!activePatientId) {
      setError('Please select a patient before creating a visit.');
      return;
    }

    try {
      setError('');
      const createdVisit = await visitService.createVisit(activePatientId, visitDetails);
      setVisits((current) => [createdVisit, ...current]);
      setSelectedVisitId(createdVisit.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the visit.');
    }
  };

  const handleFileSelected = async (file: File) => {
    if (!activePatientId) {
      setError('Please select a patient before uploading a prescription.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('The file is too large. Please upload a file smaller than 25 MB.');
      return;
    }

    const isImage = file.type.startsWith('image/');
    const isPdf =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!isImage && !isPdf) {
      setError('Please upload a JPG, PNG, or PDF prescription.');
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);
    setError('');
    setUploadedName(file.name);
    setOcrText('');
    setSummary('');
    setExtractedMedications([]);
    setIsSavedSuccessfully(false);
    setProcessingStatus('Extracting text from prescription (OCR)...');

    try {
      const extractedText = await extractPrescriptionText(file);
      setOcrText(extractedText);

      setProcessingStatus('Analyzing prescription and generating AI summary & medications...');

      const response = await fetch(`${API_BASE_URL}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prescriptionText: extractedText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || 'The AI service could not summarize this prescription.'
        );
      }

      if (typeof data?.summary !== 'string' || !data.summary.trim()) {
        throw new Error('The AI service returned an empty summary.');
      }

      setSummary(data.summary);

      if (data.extractedDetails) {
        setExtractedDetails({
          doctorName: data.extractedDetails.doctorName || 'Not available',
          hospital: data.extractedDetails.hospital || 'Not available',
          visitDate: data.extractedDetails.visitDate || 'Not available',
          visitReason: data.extractedDetails.visitReason || 'Not available',
          doctorSpecialization: data.extractedDetails.doctorSpecialization || 'Not available',
        });
      }

      if (Array.isArray(data.medications)) {
        setExtractedMedications(data.medications);
      }

      setProcessingStatus('Prescription analyzed! Review details and click "Update My Profile" below to save.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(`Prescription processing failed: ${message}`);
      setProcessingStatus('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateMyProfile = async () => {
    if (!selectedFile) {
      setError('No prescription file to save. Please upload a prescription first.');
      return;
    }

    if (!activePatientId) {
      setError('No active patient selected.');
      return;
    }

    setIsSavingProfile(true);
    setError('');

    try {
      await documentService.savePrescription({
        file: selectedFile,
        patientId: activePatientId,
        extractedText: ocrText,
        aiSummary: summary,
        doctorName: extractedDetails.doctorName,
        hospital: extractedDetails.hospital,
        visitDate: extractedDetails.visitDate,
        visitReason: extractedDetails.visitReason,
        doctorSpecialization: extractedDetails.doctorSpecialization,
        visitId: selectedVisitId || undefined,
        medications: extractedMedications,
      });

      setIsSavedSuccessfully(true);
      setProcessingStatus('Prescription, visit details, and medications successfully saved to your profile!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      setError(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadedName('');
    setOcrText('');
    setSummary('');
    setError('');
    setProcessingStatus('');
    setIsSavedSuccessfully(false);
    setExtractedMedications([]);
    setExtractedDetails({
      doctorName: 'Not available',
      hospital: 'Not available',
      visitDate: 'Not available',
      visitReason: 'Not available',
      doctorSpecialization: 'Not available',
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-slate-100">Upload Prescription</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Upload a printed prescription to extract its text, generate an AI summary, and update your records, timeline & medications.
        </p>

        {activePatientName && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Active patient: <strong className="text-brand-600 dark:text-brand-400">{activePatientName}</strong>
            {!isViewingSelf && ' (managing family member)'}
          </p>
        )}
      </div>

      {/* Upload Zone */}
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Prescription Document</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Supported formats: JPG, PNG, and PDF. Maximum file size: 25 MB.
        </p>

        <DocumentUploadZone
          onFileSelected={handleFileSelected}
          isUploading={isProcessing || isSavingProfile}
        />
      </section>

      {/* Progress / Status feedback */}
      {isProcessing && (
        <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-4 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900">
          <LoadingSpinner />
          <p className="text-sm font-medium">{processingStatus || 'Processing prescription...'}</p>
        </div>
      )}

      {!isProcessing && processingStatus && !error && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900">
          <CheckCircleIcon />
          <p className="text-sm font-medium">{processingStatus}</p>
        </div>
      )}

      {uploadedName && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Selected Document</p>
          <p className="mt-1 font-medium text-slate-800 dark:text-slate-100">{uploadedName}</p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
        >
          <p className="font-semibold text-sm">Something went wrong</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      {/* AI Summary and Extracted Details */}
      {summary && (
        <div className="space-y-6">
          {/* Extracted Visit Details Card */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Extracted Visit Details
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Extracted directly from the prescription. Shows "Not available" for unstated items.
            </p>

            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50">
                <dt className="text-xs font-medium text-slate-400">Doctor</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {extractedDetails.doctorName}
                </dd>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50">
                <dt className="text-xs font-medium text-slate-400">Hospital / Clinic</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {extractedDetails.hospital}
                </dd>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50">
                <dt className="text-xs font-medium text-slate-400">Visit Date</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {extractedDetails.visitDate}
                </dd>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50">
                <dt className="text-xs font-medium text-slate-400">Visit Reason</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {extractedDetails.visitReason}
                </dd>
              </div>
            </dl>
          </section>

          {/* Extracted Prescribed Medications */}
          {extractedMedications.length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <PillIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  Parsed Prescribed Medications ({extractedMedications.length})
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                These medicines will be saved to your Medications list and tracked as active/completed courses.
              </p>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {extractedMedications.map((med, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-700 dark:bg-slate-900/40">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{med.name}</p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      <strong>Dose:</strong> {med.dosage || 'Standard'} · <strong>Frequency:</strong> {med.frequency || 'As directed'}
                    </p>
                    {med.durationDays && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        <strong>Duration:</strong> {med.durationDays} days
                      </p>
                    )}
                    {med.notes && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 italic">
                        {med.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* AI Summary Section */}
          <section className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200">
              AI Prescription Summary
            </h2>

            <div className="whitespace-pre-wrap break-words rounded-xl bg-white p-4 text-sm leading-6 text-slate-800 shadow-xs dark:bg-slate-900 dark:text-slate-200">
              {summary}
            </div>

            <p className="text-xs text-amber-700 dark:text-amber-400">
              Important: This AI-generated summary is for informational guidance only. Verify
              medicines, doses, and instructions with your doctor or pharmacist.
            </p>
          </section>

          {/* Optional: Link to Existing Visit Picker if desired */}
          {visits.length > 0 && (
            <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Link to an existing visit (Optional)
                  </h3>
                  <p className="text-xs text-slate-400">
                    By default, a new visit is automatically created from the extracted prescription details.
                  </p>
                </div>
                {selectedVisitId && (
                  <button
                    type="button"
                    onClick={() => setSelectedVisitId(null)}
                    className="text-xs text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Use auto-created visit
                  </button>
                )}
              </div>

              {isLoadingVisits ? (
                <LoadingSpinner />
              ) : (
                <VisitPicker
                  visits={visits}
                  selectedVisitId={selectedVisitId}
                  onSelectExisting={handleSelectExisting}
                  onCreateNew={handleCreateNew}
                />
              )}
            </section>
          )}

          {/* UPDATE MY PROFILE BUTTON */}
          <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-900/50 dark:bg-brand-950/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-brand-950 dark:text-brand-100">
                  Ready to update your records?
                </h3>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                  Clicking "Update My Profile" will save this uploaded prescription, its extracted text, AI summary, visit details, and medications to your profile, timeline, and medications list.
                </p>
              </div>

              {!isSavedSuccessfully ? (
                <button
                  type="button"
                  onClick={handleUpdateMyProfile}
                  disabled={isSavingProfile}
                  className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-brand-700 disabled:opacity-50 sm:flex-shrink-0"
                >
                  {isSavingProfile ? (
                    <>
                      <LoadingSpinner />
                      <span>Saving to Profile...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5" />
                      <span>Update My Profile</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.PATIENT_RECORDS)}
                    className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    <FileTextIcon className="h-4 w-4" />
                    <span>View in My Records</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.PATIENT_TIMELINE)}
                    className="flex items-center gap-1.5 rounded-lg border border-brand-300 bg-white px-4 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50 dark:border-brand-700 dark:bg-slate-800 dark:text-brand-300"
                  >
                    <ActivityIcon className="h-4 w-4" />
                    <span>View Timeline</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.PATIENT_MEDICATIONS)}
                    className="flex items-center gap-1.5 rounded-lg border border-brand-300 bg-white px-4 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50 dark:border-brand-700 dark:bg-slate-800 dark:text-brand-300"
                  >
                    <PillIcon className="h-4 w-4" />
                    <span>View Medications</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400"
                  >
                    Upload Another
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Extracted Text collapsible / preview */}
          {ocrText && (
            <details className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <summary className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200">
                View Raw Extracted Text ({ocrText.length} characters)
              </summary>
              <pre className="mt-3 whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-3 text-xs font-mono text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {ocrText}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

export default PatientUploadPage;
