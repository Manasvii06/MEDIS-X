import type { AISummary } from '../../types/document.types';
import { SparklesIcon } from '../common/icons';

export function AISummaryPanel({ summary }: { summary?: AISummary }) {
  if (!summary) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400 dark:border-slate-700">
        AI summary not generated yet — processing is still in progress.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4 dark:border-brand-500/20 dark:bg-brand-500/5">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          <SparklesIcon className="h-3.5 w-3.5" />
          AI-generated summary
        </div>
        <span className="text-xs text-slate-400">{Math.round(summary.confidence * 100)}% confidence</span>
      </div>
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{summary.text}</p>
      {summary.extractedEntities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {summary.extractedEntities.map((entity) => (
            <span
              key={entity}
              className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
            >
              {entity}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
