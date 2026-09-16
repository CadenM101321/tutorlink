// Shown on every page until launch. Remove it as part of the launch checklist.
export function DemoBanner() {
  return (
    <div
      role="note"
      className="border-b border-border bg-muted px-4 py-2 text-center text-sm text-muted-foreground"
    >
      <span className="font-medium text-foreground">Demo mode:</span> no real
      charges are made.
    </div>
  );
}
