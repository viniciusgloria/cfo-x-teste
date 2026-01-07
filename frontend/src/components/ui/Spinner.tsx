export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M22 12a10 10 0 00-10-10" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
