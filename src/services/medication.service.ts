import type { Medication } from '../types/medication.types';
import { API_BASE_URL } from '../constants/api.constants';

export async function getMedicationsForPatient(patientId: string): Promise<Medication[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/patients/${patientId}/medications`);
    if (!res.ok) {
      return [];
    }
    const data = (await res.json()) as Medication[];
    return data.sort((a, b) => {
      const timeA = new Date(a.startDate).getTime();
      const timeB = new Date(b.startDate).getTime();
      if (isNaN(timeA) || isNaN(timeB)) return 0;
      return timeB - timeA;
    });
  } catch (err) {
    console.error('getMedicationsForPatient error:', err);
    return [];
  }
}

export async function deleteMedication(medicationId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/medications/${medicationId}`, {
      method: 'DELETE',
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    return !!data?.success;
  } catch (err) {
    console.error('deleteMedication error:', err);
    return false;
  }
}
