// Placeholder for legal pages during the demo phase. The real documents are
// written and reviewed by a lawyer before launch (Slice 9).
export function DraftLegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto grid w-full max-w-2xl flex-1 content-start gap-6 px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="rounded-lg border border-border bg-muted px-4 py-3 text-sm">
        <span className="font-medium">Draft.</span> TutorLink is a demo. This page will be
        replaced with the full, reviewed version before launch.
      </p>
      <div className="grid gap-4 leading-relaxed text-muted-foreground">{children}</div>
    </main>
  );
}
