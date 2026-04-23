interface LogoProps {
  className?: string;
}

export default function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 290 70"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="HNBK"
      fill="none"
    >
      {/* Crown body */}
      <path
        fill="#A23BEC"
        d="M 2,58 L 2,48 L 6,32 L 13,44 L 20,16 L 29,30 L 38,6 L 47,30 L 56,16 L 63,44 L 70,32 L 74,48 L 74,58 Q 38,68 2,58 Z"
      />
      {/* Crown orb balls at each spike tip */}
      <circle fill="#A23BEC" cx="6"  cy="32" r="5" />
      <circle fill="#A23BEC" cx="20" cy="16" r="5" />
      <circle fill="#A23BEC" cx="38" cy="6"  r="6" />
      <circle fill="#A23BEC" cx="56" cy="16" r="5" />
      <circle fill="#A23BEC" cx="70" cy="32" r="5" />
      {/* HNBK wordmark */}
      <text
        x="88"
        y="60"
        fill="#FAFBFC"
        fontFamily="Georgia, 'Palatino Linotype', serif"
        fontSize="54"
        fontWeight="normal"
      >
        HNBK
      </text>
    </svg>
  );
}
