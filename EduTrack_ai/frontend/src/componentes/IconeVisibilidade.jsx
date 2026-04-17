export function IconeVisibilidade({ visivel }) {
  if (visivel) {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
        <path
          d="M3 3l18 18M10.58 10.58a2 2 0 102.83 2.83M9.88 5.08A11.18 11.18 0 0112 4.9c5.08 0 9.29 3.11 10.61 7.1a11.46 11.46 0 01-4.05 5.69M6.32 6.32A11.71 11.71 0 001.4 12a11.4 11.4 0 004.75 5.55A10.91 10.91 0 0012 19.1c.9 0 1.78-.1 2.62-.29"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path
        d="M1.4 12C2.72 8.01 6.92 4.9 12 4.9c5.08 0 9.29 3.11 10.61 7.1-1.32 3.99-5.53 7.1-10.61 7.1-5.08 0-9.28-3.11-10.6-7.1z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}
