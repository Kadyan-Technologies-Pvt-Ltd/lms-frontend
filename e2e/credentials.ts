/**
 * Admin credentials for the e2e suite, read from the environment.
 *
 * These deliberately do NOT live in the repository. The suite signs in as a
 * real admin against a real running backend, so a hardcoded password here is
 * a live credential — and this repository is public.
 *
 * Set them before running the suite:
 *
 *   # PowerShell
 *   $env:E2E_ADMIN_PASSWORD = "..."; npm run e2e
 *
 *   # bash
 *   E2E_ADMIN_PASSWORD="..." npm run e2e
 *
 * Point them at a local development admin, never a production account.
 */
export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin@lms.com'

export const ADMIN_PASSWORD = (() => {
  const password = process.env.E2E_ADMIN_PASSWORD
  if (!password) {
    // Thrown at import time on purpose: failing immediately with an
    // explanation beats every test failing later with an opaque "Invalid
    // email or password" that looks like an app bug.
    throw new Error(
      'E2E_ADMIN_PASSWORD is not set. The e2e suite signs in as a real admin, ' +
        'so the password must come from the environment rather than the repo. ' +
        'See frontend/e2e/credentials.ts for how to set it.',
    )
  }
  return password
})()
