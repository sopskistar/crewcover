export function CrewCoverMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
    >
      <rect width="36" height="36" rx="10" fill="currentColor" />
      <path d="M25 10H15a8 8 0 0 0 0 16h10" stroke="#a4e7ce" strokeWidth="3" />
      <path
        d="m17 18 3 3 6-7"
        stroke="#a4e7ce"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
