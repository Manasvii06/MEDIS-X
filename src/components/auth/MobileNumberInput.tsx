import { useState } from 'react';

interface MobileNumberInputProps {
  onSubmit: (mobileNumber: string) => void;
  isLoading?: boolean;
}

export function MobileNumberInput({ onSubmit, isLoading }: MobileNumberInputProps) {
  const [value, setValue] = useState('');

  const isValid = /^\d{10}$/.test(value.trim());

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid) onSubmit(`+91 ${value.trim()}`);
      }}
      className="space-y-3"
    >
      <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Mobile number</label>
      <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:ring-brand-900">
        <span className="border-r border-slate-200 px-3 py-2.5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">+91</span>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          placeholder="98765 43210"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
          className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
        />
      </div>
      <button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'Sending OTP…' : 'Send OTP'}
      </button>
    </form>
  );
}
