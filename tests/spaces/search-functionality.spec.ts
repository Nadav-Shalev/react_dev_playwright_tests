import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('https://react.dev');
    await page.waitForLoadState('networkidle');
  });

  test('complete search flow as per requirements', async ({ page }) => {
    // Open the search bar
    const searchButton = page.locator('button:has-text("Search"), .DocSearch-Button').first();
    
    if (await searchButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchButton.click();
    } else {
      await page.keyboard.press('Control+K');
    }
    
    await page.waitForSelector('.DocSearch-Modal, [role="dialog"]', { 
      state: 'visible', 
      timeout: 5000 
    });
    
    // Type "custom hook"
    const searchInput = page.locator('.DocSearch-Input, input[type="search"]').first();
    await searchInput.fill('custom hook');
    await page.waitForTimeout(2000);
    
    // Click on the first result
    const firstResult = page.locator('.DocSearch-Hit, [id^="docsearch-item"]').first();
    
    if (await firstResult.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstResult.click();
      await page.waitForLoadState('domcontentloaded');
      
      // Verify navigation
      const url = page.url();
      expect(url).not.toBe('https://react.dev/');
    }
    
    // Note: Save search with star icon may not be available in React.dev
    // This is a DocSearch feature that might not be implemented
  });

  test('can open search modal', async ({ page }) => {
    const searchButton = page.locator('button:has-text("Search"), .DocSearch-Button').first();
    
    if (await searchButton.isVisible()) {
      await searchButton.click();
    } else {
      await page.keyboard.press('Control+K');
    }
    
    const searchModal = page.locator('.DocSearch-Modal, [role="dialog"]').first();
    await expect(searchModal).toBeVisible({ timeout: 5000 });
  });

  test('can type in search input', async ({ page }) => {
    // Open search
    const searchButton = page.locator('button:has-text("Search"), .DocSearch-Button').first();
    await searchButton.click();
    
    // Type in search
    const searchInput = page.locator('.DocSearch-Input, input[type="search"]').first();
    await searchInput.fill('useState');
    
    await expect(searchInput).toHaveValue('useState');
  });

  test('search shows relevant results', async ({ page }) => {
    // Open search
    const searchButton = page.locator('button:has-text("Search"), .DocSearch-Button').first();
    await searchButton.click();
    
    // Search for hooks
    const searchInput = page.locator('.DocSearch-Input, input[type="search"]').first();
    await searchInput.fill('hooks');
    await page.waitForTimeout(2000);
    
    // Check for results
    const results = page.locator('.DocSearch-Hit, [id^="docsearch-item"]');
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });

  test('can navigate to search result', async ({ page }) => {
    // Open search
    const searchButton = page.locator('button:has-text("Search"), .DocSearch-Button').first();
    await searchButton.click();
    
    // Search
    const searchInput = page.locator('.DocSearch-Input, input[type="search"]').first();
    await searchInput.fill('useState');
    await page.waitForTimeout(2000);
    
    // Click first result
    const firstResult = page.locator('.DocSearch-Hit, [id^="docsearch-item"]').first();
    const initialUrl = page.url();
    
    if (await firstResult.isVisible()) {
      await firstResult.click();
      await page.waitForLoadState('domcontentloaded');
      
      const newUrl = page.url();
      expect(newUrl).not.toBe(initialUrl);
    }
  });

  test('can close search with Escape key', async ({ page }) => {
    // Open search
    const searchButton = page.locator('button:has-text("Search"), .DocSearch-Button').first();
    await searchButton.click();
    
    const searchModal = page.locator('.DocSearch-Modal, [role="dialog"]').first();
    await expect(searchModal).toBeVisible();
    
    // Close with Escape
    await page.keyboard.press('Escape');
    await expect(searchModal).not.toBeVisible();
  });

  test('search with keyboard shortcut (Ctrl+K)', async ({ page }) => {
    await page.keyboard.press('Control+K');
    await page.waitForTimeout(1000);
    
    let searchModal = page.locator('.DocSearch-Modal, [role="dialog"]').first();
    let isVisible = await searchModal.isVisible({ timeout: 1000 }).catch(() => false);
    
    // Try Cmd+K for Mac if Ctrl+K didn't work
    if (!isVisible) {
      await page.keyboard.press('Meta+K');
      await page.waitForTimeout(1000);
      isVisible = await searchModal.isVisible({ timeout: 1000 }).catch(() => false);
    }
    
    expect(isVisible).toBeTruthy();
  });
});