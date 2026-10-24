// Central route path constants so paths are never hand-typed across the app.

export const ROUTES = {
  LOGIN: '/login',
  OTP_VERIFY: '/verify-otp',

  PATIENT_ROOT: '/patient',
  PATIENT_PROFILE: '/patient/profile',
  PATIENT_RECORDS: '/patient/records',
  PATIENT_UPLOAD: '/patient/upload',
  PATIENT_TIMELINE: '/patient/timeline',
  PATIENT_MEDICATIONS: '/patient/medications',

  DOCTOR_ROOT: '/doctor',
  DOCTOR_DASHBOARD: '/doctor/dashboard',
  DOCTOR_PATIENT_DETAIL: '/doctor/patient/:patientId',

  ADMIN_ROOT: '/admin',
} as const;

export const buildDoctorPatientDetailPath = (patientId: string) =>
  `/doctor/patient/${patientId}`;
