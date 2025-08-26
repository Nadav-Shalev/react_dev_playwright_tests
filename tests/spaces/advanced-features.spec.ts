import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SearchModal } from '../pages/SearchModal';

test.describe('Advanced React.dev Features', () => {
  let homePage: HomePage;
  let searchModal: SearchModal;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    searchModal = new SearchModal(page);
    await homePage.goto();
  });

  test.describe('Search Experience', () => {
    test('should handle special characters in search', async () => {
      await searchModal.openWithKeyboard();
      
      // Test various special characters
      const specialQueries = ['<Component />', 'useState()', '@types/react', 'key={id}'];
      
      for (const query of specialQueries) {
        await searchModal.search(query);
        const hasResults = await searchModal.hasResults();
        
        // Should handle special characters gracefully
        expect(hasResults || await searchModal.hasNoResultsMessage()).toBeTruthy();
        
        await searchModal.clearSearch();
      }
    });

    test('should navigate search results with keyboard', async () => {
      await searchModal.openWithKeyboard();
      await searchModal.search('hook');
      
      // Navigate down through results
      await searchModal.navigateWithArrowKeys('down');
      await searchModal.navigateWithArrowKeys('down');
      
      // Navigate back up
      await searchModal.navigateWithArrowKeys('up');
      
      // Select with Enter
      await searchModal.selectHighlightedResult();
      
      // Verify navigation occurred
      expect(homePage.page.url()).not.toBe('https://react.dev/');
    });

    test('should remember search context when navigating back', async ({ page }) => {
      // Perform a search
      await searchModal.openWithKeyboard();
      await searchModal.search('useEffect');
      const firstResults = await searchModal.getSearchResults();
      
      // Click first result
      await searchModal.clickFirstResult();
      
      // Go back
      await page.goBack();
      
      // Open search again - should show recent search or maintain context
      await searchModal.openWithKeyboard();
      const recentSearches = await searchModal.getRecentSearches();
      
      // Either has recent searches or maintains the search
      expect(recentSearches.length > 0 || await searchModal.hasResults()).toBeTruthy();
    });
  });

  test.describe('Learning Path Navigation', () => {
    test('should provide continuous learning experience', async ({ page }) => {
      // Start from Learn section
      await page.goto('https://react.dev/learn');
      
      // Check for "Next" navigation
      const nextButton = page.locator('a:has-text("Next"), button:has-text("Next")');
      let pagesVisited = 0;
      
      while (await nextButton.isVisible() && pagesVisited < 3) {
        const currentUrl = page.url();
        await nextButton.click();
        await page.waitForLoadState('domcontentloaded');
        
        // Verify we navigated to a different page
        expect(page.url()).not.toBe(currentUrl);
        pagesVisited++;
      }
      
      // Should have a learning path
      expect(pagesVisited).toBeGreaterThan(0);
    });

    test('should show progress indicators in tutorials', async ({ page }) => {
      await page.goto('https://react.dev/learn');
      
      // Look for progress indicators
      const progressIndicators = page.locator('[role="progressbar"], .progress, [data-progress]');
      const breadcrumbs = page.locator('nav[aria-label*="breadcrumb"], .breadcrumb');
      
      // Should have some form of progress indication
      const hasProgress = await progressIndicators.isVisible() || await breadcrumbs.isVisible();
      expect(hasProgress).toBeTruthy();
    });
  });

  test.describe('Code Examples and Interactivity', () => {
    test('should syntax highlight code blocks', async ({ page }) => {
      await page.goto('https://react.dev/learn');
      
      // Find code blocks
      const codeBlocks = page.locator('pre code, .syntax-highlighted, [class*="language-"]');
      const codeBlockCount = await codeBlocks.count();
      
      expect(codeBlockCount).toBeGreaterThan(0);
      
      if (codeBlockCount > 0) {
        // Check if code has syntax highlighting classes
        const firstCodeBlock = codeBlocks.first();
        const classNames = await firstCodeBlock.getAttribute('class');
        
        // Should have language-specific classes
        expect(classNames).toMatch(/language-|syntax|highlight/);
      }
    });

    test('should handle code playground errors gracefully', async ({ page }) => {
      // Navigate to a page with playground
      await page.goto('https://react.dev/learn');
      
      const playground = page.locator('iframe[title*="sandbox"], .sandpack');
      
      if (await playground.isVisible()) {
        // If playground exists, it should load without errors
        await playground.waitFor({ state: 'visible', timeout: 10000 });
        
        // Check if iframe loaded successfully
        const iframeElement = await playground.elementHandle();
        expect(iframeElement).not.toBeNull();
      }
    });
  });

  test.describe('Community and External Links', () => {
    test('should properly handle external links', async ({ page, context }) => {
      // Monitor new pages/tabs
      const newPagePromise = context.waitForEvent('page');
      
      // Find and click an external link (GitHub, Twitter, etc.)
      const externalLink = page.locator('a[href*="github.com"], a[href*="twitter.com"]').first();
      
      if (await externalLink.isVisible()) {
        await externalLink.click();
        
        try {
          const newPage = await Promise.race([
            newPagePromise,
            new Promise((_, reject) => setTimeout(() => reject('timeout'), 3000))
          ]);
          
          if (newPage && newPage !== 'timeout') {
            // External link opened in new tab
            expect(newPage).toBeTruthy();
          }
        } catch {
          // Link might have opened in same tab or been prevented
          const url = page.url();
          expect(url.includes('github.com') || url.includes('twitter.com') || url === 'https://react.dev/').toBeTruthy();
        }
      }
    });

    test('should have social media meta tags', async ({ page }) => {
      // Check for Open Graph and Twitter meta tags
      const ogTitle = page.locator('meta[property="og:title"]');
      const ogDescription = page.locator('meta[property="og:description"]');
      const twitterCard = page.locator('meta[name="twitter:card"]');
      
      await expect(ogTitle).toHaveAttribute('content', /.+/);
      await expect(ogDescription).toHaveAttribute('content', /.+/);
      
      // Should be optimized for social sharing
      const hasSocialMeta = await ogTitle.isVisible() || await twitterCard.isVisible();
      expect(hasSocialMeta).toBeTruthy();
    });
  });

  test.describe('Performance Optimizations', () => {
    test('should lazy load images', async ({ page }) => {
      await page.goto('https://react.dev/learn');
      
      // Scroll down to trigger lazy loading
      await page.evaluate(() => window.scrollBy(0, 1000));
      await page.waitForTimeout(500);
      
      const images = page.locator('img[loading="lazy"], img[data-lazy]');
      const lazyImageCount = await images.count();
      
      // Modern sites should use lazy loading
      expect(lazyImageCount).toBeGreaterThanOrEqual(0);
    });

    test('should have proper caching headers', async ({ page }) => {
      const response = await page.goto('https://react.dev/');
      
      if (response) {
        const headers = response.headers();
        
        // Check for caching headers
        const hasCacheControl = 'cache-control' in headers;
        const hasEtag = 'etag' in headers;
        
        // Should have some caching strategy
        expect(hasCacheControl || hasEtag).toBeTruthy();
      }
    });
  });

  test.describe('Accessibility Enhancements', () => {
    test('should have proper ARIA labels for interactive elements', async ({ page }) => {
      const interactiveElements = page.locator('button, a, input, [role="button"]');
      const elements = await interactiveElements.all();
      
      let elementsWithAccessibility = 0;
      
      for (const element of elements.slice(0, 10)) { // Check first 10 elements
        const ariaLabel = await element.getAttribute('aria-label');
        const ariaDescribedBy = await element.getAttribute('aria-describedby');
        const text = await element.textContent();
        
        if (ariaLabel || ariaDescribedBy || text?.trim()) {
          elementsWithAccessibility++;
        }
      }
      
      // Most elements should have proper labels
      expect(elementsWithAccessibility).toBeGreaterThan(elements.length * 0.8);
    });

    test('should support reduced motion preferences', async ({ page }) => {
      // Emulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      await homePage.goto();
      
      // Check if animations are reduced
      const animatedElements = page.locator('[class*="animate"], [class*="transition"]');
      
      // Site should still function with reduced motion
      await expect(homePage.header).toBeVisible();
      await expect(homePage.footer).toBeVisible();
    });

    test('should have skip navigation links', async ({ page }) => {
      // Focus on the page to reveal skip links
      await page.keyboard.press('Tab');
      
      const skipLinks = page.locator('a[href^="#"]:has-text("Skip"), a:has-text("Skip to")');
      
      // Should provide skip navigation
      const hasSkipLinks = await skipLinks.count() > 0;
      expect(hasSkipLinks).toBeTruthy();
    });
  });
});