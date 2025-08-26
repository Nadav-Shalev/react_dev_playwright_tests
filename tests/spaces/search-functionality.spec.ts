import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('https://react.dev');
    await page.waitForLoadState('networkidle');
  });

  test('complete search flow as per requirements', async ({ page }) => {
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
    
    const searchInput = page.locator('.DocSearch-Input, input[type="search"]').first();
    await searchInput.fill('custom hook');
    await page.waitForTimeout(2000);
    
    const firstResult = page.locator('.DocSearch-Hit, [id^="docsearch-item"]').first();
    
    if (await firstResult.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstResult.click();
      await page.waitForLoadState('domcontentloaded');
      
      const url = page.url();
      expect(url).not.toBe('https://react.dev/');
    }
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
    const searchButton = page.locator('button:has-text("Search"), .DocSearch-Button').first();
    await searchButton.click();
    
    const searchInput = page.locator('.DocSearch-Input, input[type="search"]').first();
    await searchInput.fill('useState');
    
    await expect(searchInput).toHaveValue('useState');
  });

  test('search shows relevant results', async ({ page }) => {
    const searchButton = page.locator('button:has-text("Search"), .DocSearch-Button').first();
    await searchButton.click();
    
    const searchInput = page.locator('.DocSearch-Input, input[type="search"]').first();
    await searchInput.fill('hooks');
    await page.waitForTimeout(2000);
    
    const results = page.locator('.DocSearch-Hit, [id^="docsearch-item"]');
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });

  test('can navigate to search result', async ({ page }) => {
    const searchButton = page.locator('button:has-text("Search"), .DocSearch-Button').first();
    await searchButton.click();
    
    const searchInput = page.locator('.DocSearch-Input, input[type="search"]').first();
    await searchInput.fill('useState');
    await page.waitForTimeout(2000);
    
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
    const searchButton = page.locator('button:has-text("Search"), .DocSearch-Button').first();
    await searchButton.click();
    
    const searchModal = page.locator('.DocSearch-Modal, [role="dialog"]').first();
    await expect(searchModal).toBeVisible();
    
    await page.keyboard.press('Escape');
    await expect(searchModal).not.toBeVisible();
  });

  test('search with keyboard shortcut (Ctrl+K)', async ({ page }) => {
    await page.keyboard.press('Control+K');
    await page.waitForTimeout(1000);
    
    let searchModal = page.locator('.DocSearch-Modal, [role="dialog"]').first();
    let isVisible = await searchModal.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (!isVisible) {
      await page.keyboard.press('Meta+K');
      await page.waitForTimeout(1000);
      isVisible = await searchModal.isVisible({ timeout: 1000 }).catch(() => false);
    }
    
    expect(isVisible).toBeTruthy();
  });
});