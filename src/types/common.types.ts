export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  errorMessage?: string;
}
