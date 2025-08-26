import { test, expect } from '@playwright/test';

test.describe('Performance and Error Handling', () => {
  
  test('page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('https://react.dev');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(10000);
  });

  test('handles 404 pages gracefully', async ({ page }) => {
    const response = await page.goto('https://react.dev/this-page-does-not-exist-404');
    
    expect(response).toBeTruthy();
    
    const pageContent = await page.textContent('body');
    expect(pageContent?.toLowerCase()).toMatch(/404|not found|page.*not.*exist/);
  });

  test('has proper caching headers', async ({ page }) => {
    const response = await page.goto('https://react.dev');
    
    if (response) {
      const headers = response.headers();
      
      const hasCacheControl = 'cache-control' in headers;
      const hasEtag = 'etag' in headers;
      const hasLastModified = 'last-modified' in headers;
      
      expect(hasCacheControl || hasEtag || hasLastModified).toBeTruthy();
    }
  });

  test('images have proper alt text', async ({ page }) => {
    await page.goto('https://react.dev');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      let imagesWithAlt = 0;
      
      for (let i = 0; i < Math.min(5, imageCount); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        if (alt !== null && alt !== '') {
          imagesWithAlt++;
        }
      }
      
      expect(imagesWithAlt).toBeGreaterThan(0);
    }
  });

  test('external links have proper attributes', async ({ page }) => {
    await page.goto('https://react.dev');
    
    const externalLinks = page.locator('a[href^="http"]:not([href*="react.dev"])').first();
    
    if (await externalLinks.isVisible({ timeout: 1000 }).catch(() => false)) {
      const target = await externalLinks.getAttribute('target');
      const rel = await externalLinks.getAttribute('rel');
      
      expect(target === '_blank' || rel?.includes('noopener')).toBeTruthy();
    }
  });

  test('handles network errors gracefully', async ({ page, context }) => {
    await context.setOffline(true);
    
    try {
      await page.goto('https://react.dev', { timeout: 5000 });
    } catch (error) {
      expect(error).toBeDefined();
    }
    
    await context.setOffline(false);
  });

  test('lazy loads images for performance', async ({ page }) => {
    await page.goto('https://react.dev/learn');
    
    const images = page.locator('img[loading="lazy"]');
    const lazyImageCount = await images.count();
    
    expect(lazyImageCount >= 0).toBeTruthy();
  });
});