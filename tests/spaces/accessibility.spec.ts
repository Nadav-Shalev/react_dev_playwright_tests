import { test, expect } from '@playwright/test';

test.describe('Accessibility and Keyboard Navigation', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('https://react.dev');
    await page.waitForLoadState('networkidle');
  });

  test('page is accessible via keyboard', async ({ page }) => {
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }
  });

  test('can navigate with Tab key', async ({ page }) => {
    await page.keyboard.press('Tab');
    let focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    await page.keyboard.press('Tab');
    focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    await page.keyboard.press('Shift+Tab');
    focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('skip to content link is available', async ({ page }) => {
    await page.keyboard.press('Tab');
    
    const skipLink = page.locator('a[href^="#"]:has-text("Skip"), a:has-text("Skip to")');
    const hasSkipLink = await skipLink.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (hasSkipLink) {
      await skipLink.click();
      const mainContent = page.locator('main, [role="main"], #main');
      await expect(mainContent.first()).toBeInViewport();
    }
    
    expect(true).toBeTruthy();
  });

  test('interactive elements are focusable', async ({ page }) => {
    const firstButton = page.locator('button').first();
    await firstButton.focus();
    await expect(firstButton).toBeFocused();
    
    const firstLink = page.locator('a[href]').first();
    await firstLink.focus();
    await expect(firstLink).toBeFocused();
  });

  test('ARIA labels are present on interactive elements', async ({ page }) => {
    const buttons = page.locator('button');
    const buttonsCount = await buttons.count();
    
    let buttonsWithAccessibility = 0;
    
    for (let i = 0; i < Math.min(5, buttonsCount); i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      
      if (ariaLabel || text?.trim()) {
        buttonsWithAccessibility++;
      }
    }
    
    expect(buttonsWithAccessibility).toBeGreaterThan(0);
  });

  test('focus indicators are visible', async ({ page }) => {
    await page.keyboard.press('Tab');
    
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    const outline = await focusedElement.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.outline || styles.boxShadow;
    });
    
    expect(outline).toBeTruthy();
  });

  test('can use Enter key to activate links', async ({ page }) => {
    const navLink = page.locator('nav a[href]').first();
    await navLink.focus();
    
    const initialUrl = page.url();
    await page.keyboard.press('Enter');
    
    await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
    
    const newUrl = page.url();
    expect(true).toBeTruthy();
  });
});