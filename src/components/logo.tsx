import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-[15px] font-semibold tracking-tight"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-6 text-primary"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
      >
        <rect x="2" y="7" width="12" height="10" rx="5" />
        <rect x="10" y="7" width="12" height="10" rx="5" />
      </svg>
      TutorLink
    </Link>
  );
}
