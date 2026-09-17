export function EmptyCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid content-start gap-2 rounded-xl border border-border p-5">
      <h2 className="font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{children}</p>
    </section>
  );
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}
