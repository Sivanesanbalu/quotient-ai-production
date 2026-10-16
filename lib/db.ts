import postgres from 'postgres';
let client: ReturnType<typeof postgres> | undefined;
export function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  const url = new URL(process.env.DATABASE_URL);
  const disposableLocal =
    process.env.E2E_DISPOSABLE_DB === 'YES' &&
    process.env.CI === 'true' &&
    ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  return client ??= postgres(process.env.DATABASE_URL, {
    ssl: disposableLocal ? false : 'require',
    max: 5,
    idle_timeout: 20,
  });
}
