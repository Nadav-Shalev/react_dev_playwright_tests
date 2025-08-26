import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('https://react.dev');
    await page.waitForLoadState('networkidle');
  });

  test('adapts to mobile viewport (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const nav = page.locator('nav').first();
    const hamburger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]');
    
    const navVisible = await nav.isVisible();
    const hamburgerVisible = await hamburger.isVisible({ timeout: 1000 }).catch(() => false);
    
    expect(navVisible || hamburgerVisible).toBeTruthy();
  });

  test('adapts to tablet viewport (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
    
    const mainContent = page.locator('main, [role="main"]').first();
    await expect(mainContent).toBeVisible();
  });

  test('displays properly on desktop (1920px)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
    
    const hamburger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]');
    const hamburgerVisible = await hamburger.isVisible({ timeout: 500 }).catch(() => false);
    
    await expect(nav).toBeVisible();
  });

  test('mobile menu toggle works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const hamburger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]');
    
    if (await hamburger.isVisible({ timeout: 1000 }).catch(() => false)) {
      await hamburger.click();
      await page.waitForTimeout(500);
      
      const navItems = page.locator('nav a');
      const visibleItems = await navItems.count();
      expect(visibleItems).toBeGreaterThan(0);
    }
  });

  test('content remains readable on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    
    const fontSize = await heading.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    expect(parseInt(fontSize)).toBeGreaterThanOrEqual(16);
  });

  test('images are responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      const firstImage = images.first();
      const width = await firstImage.evaluate(el => (el as HTMLElement).offsetWidth);
      
      expect(width).toBeLessThanOrEqual(375);
    }
  });

  test('horizontal scrolling is not required', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBeFalsy();
  });
});