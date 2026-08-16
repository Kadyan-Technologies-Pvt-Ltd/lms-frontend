import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

import { ADMIN_EMAIL, ADMIN_PASSWORD } from './credentials'

export async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(ADMIN_EMAIL)
  await page.getByLabel('Password').fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/admin/)
}

export async function loginAsMember(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page).toHaveURL(/\/member/)
}

/** Fails the test if the page logs a browser console error while `action`
 * runs — the same class of bug (silently-broken query, unhandled
 * rejection) that earlier code-review passes in this project kept missing
 * because nothing was actually watching the browser console. */
export async function expectNoConsoleErrors(page: Page, action: () => Promise<void>) {
  const errors: string[] = []
  const listener = (msg: import('@playwright/test').ConsoleMessage) => {
    if (msg.type() === 'error') errors.push(msg.text())
  }
  page.on('console', listener)
  try {
    await action()
  } finally {
    page.off('console', listener)
  }
  expect(errors, `Console errors during action: ${errors.join('\n')}`).toEqual([])
}
