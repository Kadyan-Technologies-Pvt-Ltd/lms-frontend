import { expect, test } from '@playwright/test'

import { createTestMember, deleteTestMember, getAdminToken } from './api-helpers'
import { ADMIN_EMAIL } from './credentials'
import { loginAsAdmin, loginAsMember } from './ui-helpers'

test('admin can log in and reach the dashboard', async ({ page }) => {
  await loginAsAdmin(page)
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await expect(page.getByText('Admin Panel')).toBeVisible()
})

test('invalid credentials show an error and do not navigate', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill(ADMIN_EMAIL)
  await page.getByLabel('Password').fill('wrong-password')
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByText('Invalid email or password.')).toBeVisible()
  await expect(page).toHaveURL(/\/login/)
})

test('member can log in and reach their dashboard', async ({ page, request }) => {
  const adminToken = await getAdminToken(request)
  const member = await createTestMember(request, adminToken)
  try {
    await loginAsMember(page, member.email, member.generated_password)
    await expect(page.getByText('Member Portal')).toBeVisible()
    await expect(page.getByText(`Welcome, ${member.full_name}`)).toBeVisible()
  } finally {
    await deleteTestMember(request, adminToken, member.id)
  }
})
