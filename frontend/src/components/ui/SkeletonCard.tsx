export function SkeletonCard({ className = '' }: { className?: string }) {
  // Cores mais visíveis para skeleton, especialmente no dark mode
  const base = 'bg-gray-200 dark:bg-gray-800/80';
  const accent = 'bg-gray-300 dark:bg-gray-700/90';
  return (
    <div
      className={`animate-pulse rounded-lg shadow-sm p-6 flex flex-col gap-3 ${className}`}
      style={{
        backgroundColor: 'var(--card-bg, #f3f4f6)',
        border: '1px solid var(--card-border, #e5e7eb)',
        minHeight: 96,
      }}
    >
      <div className={`h-5 w-2/3 mb-2 rounded ${base}`} />
      <div className={`h-4 w-1/3 mb-4 rounded ${accent}`} />
      <div className="flex gap-2">
        <div className={`h-8 w-1/4 rounded ${base}`} />
        <div className={`h-8 w-1/4 rounded ${base}`} />
        <div className={`h-8 w-1/4 rounded ${base}`} />
        <div className={`h-8 w-1/4 rounded ${base}`} />
      </div>
    </div>
  );
}
