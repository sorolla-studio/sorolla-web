export default function Logo({ size = 27 }: { size?: number }) {
  return (
    <svg viewBox="40 36 178 175" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="27" strokeLinecap="round" aria-hidden="true">
      <path d="M190 50H103a49 49 0 0 0 0 98h47" />
      <path d="M109 99h46a49 49 0 0 1 0 98H66" />
    </svg>
  );
}
