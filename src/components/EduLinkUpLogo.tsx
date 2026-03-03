export function EduLinkUpLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 180 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="EduLinkUp"
    >
      {/* Graduation cap icon */}
      <g transform="translate(2, 4)">
        {/* Cap top */}
        <polygon points="14,4 0,12 14,20 28,12" fill="#6366f1" />
        {/* Cap brim */}
        <polygon points="14,20 28,12 28,18 14,26 0,18 0,12" fill="#4f46e5" opacity="0.7" />
        {/* Tassel */}
        <line x1="24" y1="12" x2="26" y2="22" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
        <circle cx="26" cy="23" r="2" fill="#eab308" />
      </g>
      {/* "Edu" in indigo */}
      <text x="34" y="25" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="20" fill="#6366f1">
        Edu
      </text>
      {/* "Link" in white */}
      <text x="78" y="25" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="20" fill="#ffffff">
        Link
      </text>
      {/* "Up" in yellow/amber */}
      <text x="126" y="25" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="20" fill="#eab308">
        Up
      </text>
    </svg>
  )
}
