// Shared look for the sign-up and login pages. No auth checks here: layouts
// don't re-run on navigation, so each page checks for itself.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
