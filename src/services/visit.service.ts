import type { Visit } from '../types/visit.types';
import { API_BASE_URL } from '../constants/api.constants';

export async function getVisitsForPatient(patientId: string): Promise<Visit[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/patients/${patientId}/visits`);
    if (!res.ok) {
      throw new Error(`Failed to load visits: ${res.statusText}`);
    }
    const data = (await res.json()) as Visit[];
    return data.sort((a, b) => {
      const timeA = new Date(a.visitDate).getTime();
      const timeB = new Date(b.visitDate).getTime();
      if (isNaN(timeA) || isNaN(timeB)) return 0;
      return timeB - timeA;
    });
  } catch (err) {
    console.error('getVisitsForPatient error:', err);
    throw err;
  }
}

export async function createVisit(
  patientId: string,
  visit: Omit<Visit, 'id' | 'patientId' | 'documentIds'>
): Promise<Visit> {
  const res = await fetch(`${API_BASE_URL}/patients/${patientId}/visits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(visit),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error || 'Could not create the visit.');
  }

  return await res.json();
}

export async function deleteVisit(visitId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/visits/${visitId}`, {
      method: 'DELETE',
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    return !!data?.success;
  } catch (err) {
    console.error('deleteVisit error:', err);
    return false;
  }
}
