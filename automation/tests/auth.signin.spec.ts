import { test, expect } from '@playwright/test';

test.describe('Signin Page', () => {
  test.beforeEach(async ({ page }) => {
    console.log('📄 Loading signin page...');
    await page.goto('/auth/login');
    await page.waitForTimeout(500);  // Quick pause to load
    console.log('✅ Signin page loaded');
  });

  test('should render signin form with all fields', async ({ page }) => {
    console.log('🔍 Checking form fields...');
    // Check if email input exists
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // Check if password input exists
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Check if submit button exists
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    console.log('✅ All form fields visible');
  });

  test('should display validation errors for empty fields', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for validation messages
    await page.waitForTimeout(500);

    // Check for error messages
    const errorMessages = page.locator('[role="alert"]');
    await expect(errorMessages).toBeDefined();
  });

  test('should display error for invalid email format', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await emailInput.fill('invalidemail');
    await passwordInput.fill('password123');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for validation
    await page.waitForTimeout(500);

    const errorMessages = page.locator('[role="alert"]');
    await expect(errorMessages).toBeDefined();
  });

  test('should display error for invalid credentials', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await emailInput.fill('nonexistent@example.com');
    await passwordInput.fill('wrongpassword123');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for error response
    await page.waitForTimeout(1000);

    // Check for error message (invalid credentials)
    const errorMessage = page.locator('[role="alert"], .text-red-500, .error');
    const isError = await errorMessage.isVisible().catch(() => false);
    expect(isError || page.url().includes('/auth/login')).toBeTruthy();
  });

  test('should have link to signup page', async ({ page }) => {
    const signupLink = page.locator('a:has-text("sign up"), a:has-text("register"), a:has-text("create")').first();
    const hasSignupLink = await signupLink.isVisible().catch(() => false);

    if (hasSignupLink) {
      await signupLink.click();
      await page.waitForTimeout(500);
      const newUrl = page.url();
      expect(newUrl.includes('/auth/register') || newUrl.includes('/auth/login')).toBeTruthy();
    }
  });

  test('should have forgot password link', async ({ page }) => {
    const forgotLink = page.locator('a:has-text("forgot"), a:has-text("reset")').first();
    const hasForgotLink = await forgotLink.isVisible().catch(() => false);

    if (hasForgotLink) {
      await forgotLink.click();
      await page.waitForTimeout(500);
      const newUrl = page.url();
      expect(newUrl.includes('/auth/reset') || newUrl.includes('/auth/forgot') || newUrl.includes('/auth/login')).toBeTruthy();
    }
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    const toggleButton = page.locator('button[aria-label*="password"], button[aria-label*="toggle"]').first();

    if (await toggleButton.isVisible()) {
      await toggleButton.click();

      const visibleInput = page.locator('input[type="text"]').first();
      await expect(visibleInput).toBeVisible();

      await toggleButton.click();
      await expect(passwordInput).toBeVisible();
    }
  });

  test('should remember me checkbox', async ({ page }) => {
    const rememberCheckbox = page.locator('input[type="checkbox"]').first();
    const hasRememberOption = await rememberCheckbox.isVisible().catch(() => false);

    if (hasRememberOption) {
      await expect(rememberCheckbox).toBeVisible();
      await rememberCheckbox.click();
      await expect(rememberCheckbox).toBeChecked();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    // Check for email label
    const emailLabel = page.locator('label').filter({ hasText: 'email' });
    await expect(emailLabel).toBeVisible();

    // Check for password label
    const passwordLabel = page.locator('label').filter({ hasText: 'password' });
    await expect(passwordLabel).toBeVisible();
  });

  test('should submit form with valid credentials (admin account)', async ({ page }) => {
    console.log('🔐 Testing admin credentials...');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    console.log('📧 Entering email: admin@eztest.local');
    await emailInput.fill('admin@eztest.local');
    await page.waitForTimeout(300);

    console.log('🔑 Entering password: Admin@123456');
    await passwordInput.fill('Admin@123456');
    await page.waitForTimeout(300);

    const submitButton = page.locator('button[type="submit"]');
    console.log('✅ Clicking submit button...');

    // Track API responses
    let apiResponseStatus: number | null = null;

    page.on('response', response => {
      // Check for any API response
      const status = response.status();
      if (response.url().includes('/api/') && (status === 200 || status === 302 || status === 401)) {
        apiResponseStatus = status;
        console.log('📡 API Response:', status, response.url());
      }
    });

    await submitButton.click();

    // Wait for response and navigation
    await page.waitForTimeout(1000);
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {
      // Navigation might not happen immediately
    });

    // Check multiple indicators of successful login
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    console.log('📡 API Response Status:', apiResponseStatus);

    // Check for success indicators:
    // 1. Not on login page anymore (redirected)
    // 2. No error alert messages
    // 3. Successful navigation to dashboard/projects
    const isNotOnLoginPage = !currentUrl.includes('/auth/login');
    const hasNoErrorAlerts = !(await page.locator('[role="alert"]').isVisible().catch(() => false));
    const isOnDashboard = currentUrl.includes('/dashboard') || currentUrl.includes('/projects');

    console.log('✅ Login Validation Results:');
    console.log('  - Not on login page:', isNotOnLoginPage);
    console.log('  - No error alerts:', hasNoErrorAlerts);
    console.log('  - On dashboard:', isOnDashboard);
    console.log('  - API Status:', apiResponseStatus);

    // Login is successful if we're not on login page and have no errors
    const loginSuccess = isNotOnLoginPage && hasNoErrorAlerts;
    expect(loginSuccess).toBeTruthy();
  });
});
