// Load .env.local for tests, the same file Next.js reads during development.
// It's missing on machines without secrets; integration tests then skip.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local: nothing to load.
}
