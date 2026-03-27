import { Page, expect } from '@playwright/test';

/**
 * Login helper function for authenticated tests
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/auth/login');

  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  const submitButton = page.locator('button[type="submit"]');

  await emailInput.fill(email);
  await passwordInput.fill(password);
  await submitButton.click();

  // Wait for navigation or error
  await page.waitForNavigation({ timeout: 5000 }).catch(() => {
    // Navigation might not happen
  });

  return page;
}

/**
 * Signup helper function
 */
export async function signup(page: Page, email: string, password: string) {
  await page.goto('/auth/register');

  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  const submitButton = page.locator('button[type="submit"]');

  await emailInput.fill(email);
  await passwordInput.fill(password);
  await submitButton.click();

  // Wait for navigation or success message
  await page.waitForNavigation({ timeout: 5000 }).catch(() => {
    // Navigation might not happen
  });

  return page;
}

/**
 * Generate a unique email for testing
 */
export function generateTestEmail(prefix = 'test'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const currentUrl = page.url();
  const isProtectedPage = currentUrl.includes('/dashboard') || currentUrl.includes('/projects');

  if (isProtectedPage) {
    return true;
  }

  // Check for user menu or profile button
  const profileButton = page.locator('[aria-label*="profile"], [aria-label*="user"], [aria-label*="menu"]').first();
  return await profileButton.isVisible().catch(() => false);
}

/**
 * Logout user
 */
export async function logout(page: Page) {
  // Click on user menu/profile
  const profileButton = page.locator('[aria-label*="profile"], [aria-label*="user"], [aria-label*="menu"]').first();

  if (await profileButton.isVisible()) {
    await profileButton.click();

    // Click on logout
    const logoutButton = page.locator('button:has-text("logout"), button:has-text("sign out"), a:has-text("logout")').first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    }
  }
}

/**
 * Wait for element with better error message
 */
export async function waitForElement(page: Page, selector: string, timeout = 5000) {
  try {
    await page.locator(selector).first().waitFor({ timeout });
    return page.locator(selector).first();
  } catch (error) {
    throw new Error(`Element "${selector}" not found after ${timeout}ms`);
  }
}

/**
 * Get error message from page
 */
export async function getErrorMessage(page: Page): Promise<string | null> {
  const errorElement = page.locator('[role="alert"], .error, .text-red-500, .text-destructive').first();

  if (await errorElement.isVisible().catch(() => false)) {
    return await errorElement.textContent();
  }

  return null;
}

/**
 * Fill form and submit
 */
export async function fillAndSubmit(page: Page, formData: Record<string, string>) {
  for (const [selector, value] of Object.entries(formData)) {
    const input = page.locator(selector);
    if (await input.isVisible()) {
      await input.fill(value);
    }
  }

  const submitButton = page.locator('button[type="submit"]');
  if (await submitButton.isVisible()) {
    await submitButton.click();
  }
}
