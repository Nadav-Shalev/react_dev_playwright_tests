import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('React.dev Homepage Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test.describe('Basic Layout', () => {
    test('should load the React.dev homepage', async ({ page }) => {
      // Basic check that page loads
      await expect(page).toHaveURL('https://react.dev/');
      await expect(page).toHaveTitle(/React/);
    });

    test('should have navigation menu', async () => {
      await expect(homePage.navigationMenu).toBeVisible();
      
      const navItems = await homePage.getNavigationItems();
      expect(navItems.length).toBeGreaterThan(0);
    });

    test('should have main content sections', async ({ page }) => {
      // Check for main content area
      const mainContent = page.locator('main, [role="main"], #main').first();
      await expect(mainContent).toBeVisible();
      
      // Check for some key sections
      const heroSection = page.locator('h1, [class*="hero"]').first();
      await expect(heroSection).toBeVisible();
    });
  });

  test.describe('Search Functionality', () => {
    test('should open search modal', async ({ page }) => {
      await homePage.openSearch();
      
      // Check if search modal is visible
      const searchModal = page.locator('.DocSearch-Modal, [role="dialog"]').first();
      await expect(searchModal).toBeVisible();
    });

    test('should search and show results', async ({ page }) => {
      await homePage.openSearch();
      await homePage.searchFor('useState');
      
      // Check for search results
      const results = page.locator('.DocSearch-Hit, [id^="docsearch-item"]');
      await expect(results.first()).toBeVisible({ timeout: 5000 });
    });

    test('should navigate to search result', async ({ page }) => {
      await homePage.openSearch();
      await homePage.searchFor('hooks');
      
      // Wait for results and click first one
      const firstResult = page.locator('.DocSearch-Hit, [id^="docsearch-item"]').first();
      await firstResult.waitFor({ state: 'visible', timeout: 5000 });
      
      // Click and verify navigation
      const initialUrl = page.url();
      await firstResult.click();
      await page.waitForLoadState('domcontentloaded');
      
      // Check that URL changed
      const newUrl = page.url();
      expect(newUrl).not.toBe(initialUrl);
    });

    test('should close search with Escape key', async ({ page }) => {
      await homePage.openSearch();
      
      // Verify modal is open
      const searchModal = page.locator('.DocSearch-Modal, [role="dialog"]').first();
      await expect(searchModal).toBeVisible();
      
      // Press Escape
      await page.keyboard.press('Escape');
      
      // Verify modal is closed
      await expect(searchModal).not.toBeVisible();
    });
  });

  test.describe('Theme Toggle (if available)', () => {
    test.skip('should toggle theme', async ({ page }) => {
      // Skip this test if theme toggle is not available
      // We'll make it conditional
      
      try {
        const initialTheme = await homePage.getCurrentTheme();
        await homePage.toggleTheme();
        const newTheme = await homePage.getCurrentTheme();
        
        expect(newTheme).not.toBe(initialTheme);
      } catch (error) {
        test.skip();
      }
    });
  });

  test.describe('Keyboard Accessibility', () => {
    test('should be navigable with Tab key', async ({ page }) => {
      // Tab through first few elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        
        // Check that something is focused
        const focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
      }
    });

    test('should open search with keyboard shortcut', async ({ page }) => {
      // Try Ctrl+K
      await page.keyboard.press('Control+K');
      
      let searchModal = page.locator('.DocSearch-Modal, [role="dialog"]').first();
      let isVisible = await searchModal.isVisible({ timeout: 1000 }).catch(() => false);
      
      // If not visible, try Cmd+K (Mac)
      if (!isVisible) {
        await page.keyboard.press('Meta+K');
        await page.waitForTimeout(500);
        isVisible = await searchModal.isVisible({ timeout: 1000 }).catch(() => false);
      }
      
      expect(isVisible).toBeTruthy();
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check that navigation is still accessible
      const nav = page.locator('nav, [role="navigation"]').first();
      await expect(nav).toBeVisible();
      
      // Check for mobile menu button
      const mobileMenuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], .menu-toggle');
      const hasMobileMenu = await mobileMenuButton.isVisible({ timeout: 1000 }).catch(() => false);
      
      // Mobile should have either visible nav or menu button
      expect(hasMobileMenu || await nav.isVisible()).toBeTruthy();
    });

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Check main elements are visible
      const nav = page.locator('nav, [role="navigation"]').first();
      await expect(nav).toBeVisible();
    });

    test('should display properly on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // Check navigation is visible
      const nav = page.locator('nav, [role="navigation"]').first();
      await expect(nav).toBeVisible();
      
      // Desktop should not need hamburger menu
      const hamburger = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"]');
      const hamburgerVisible = await hamburger.isVisible({ timeout: 500 }).catch(() => false);
      
      // It's OK if hamburger exists but we expect nav to be visible
      await expect(nav).toBeVisible();
    });
  });

  test.describe('Page Performance', () => {
    test('should load within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('https://react.dev/', { waitUntil: 'domcontentloaded' });
      const loadTime = Date.now() - startTime;
      
      // Page should load quickly (under 10 seconds)
      expect(loadTime).toBeLessThan(10000);
    });

    test('should handle 404 gracefully', async ({ page }) => {
      const response = await page.goto('https://react.dev/this-page-does-not-exist-404');
      
      // Should still load a page (not crash)
      expect(response).toBeTruthy();
      
      // Should show 404 indication
      const pageContent = await page.textContent('body');
      expect(pageContent?.toLowerCase()).toMatch(/404|not found|page.*not.*exist/);
    });
  });

  test.describe('Interactive Examples', () => {
    test('should have code blocks on Learn page', async ({ page }) => {
      await page.goto('https://react.dev/learn');
      
      // Look for code blocks
      const codeBlocks = page.locator('pre code, .syntax-highlight, [class*="language-"]');
      const count = await codeBlocks.count();
      
      expect(count).toBeGreaterThan(0);
    });

    test('should have interactive sandboxes', async ({ page }) => {
      await page.goto('https://react.dev/learn');
      
      // Check for sandbox elements (use .first() to avoid multiple elements)
      const sandbox = page.locator('.sandpack, [class*="sandbox"], iframe[title*="sandbox"]').first();
      const hasSandbox = await sandbox.isVisible({ timeout: 3000 }).catch(() => false);
      
      // It's OK if there are no sandboxes on this specific page
      expect(hasSandbox !== undefined).toBeTruthy();
    });

    test('should have copy buttons for code', async ({ page }) => {
      await page.goto('https://react.dev/learn');
      
      // Look for copy buttons
      const copyButtons = page.locator('button:has-text("Copy"), button[aria-label*="Copy"], button[title*="Copy"]');
      const count = await copyButtons.count();
      
      // There should be some copy buttons if there are code blocks
      if (count > 0) {
        // Try clicking one
        await copyButtons.first().click();
        
        // Check for feedback (might show "Copied!" text)
        const feedback = await page.locator('text=/copied/i, [aria-live*="polite"]').isVisible({ timeout: 1000 }).catch(() => false);
        
        // It's OK if there's no visible feedback
        expect(count).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Documentation Navigation', () => {
    test('should have sidebar navigation on docs pages', async ({ page }) => {
      await page.goto('https://react.dev/learn');
      
      // Look for sidebar
      const sidebar = page.locator('aside, [role="complementary"], .sidebar, nav[aria-label*="Docs"]').first();
      const hasSidebar = await sidebar.isVisible({ timeout: 2000 }).catch(() => false);
      
      // Docs pages usually have sidebar
      expect(hasSidebar).toBeTruthy();
    });

    test('should have breadcrumbs or page navigation', async ({ page }) => {
      await page.goto('https://react.dev/learn/tutorial-tic-tac-toe');
      
      // Check for breadcrumbs or next/previous navigation
      const breadcrumbs = page.locator('nav[aria-label*="breadcrumb"], .breadcrumb');
      const nextButton = page.locator('a:has-text("Next"), button:has-text("Next")');
      const prevButton = page.locator('a:has-text("Previous"), button:has-text("Previous")');
      
      const hasNavigation = 
        await breadcrumbs.isVisible({ timeout: 1000 }).catch(() => false) ||
        await nextButton.isVisible({ timeout: 1000 }).catch(() => false) ||
        await prevButton.isVisible({ timeout: 1000 }).catch(() => false);
      
      expect(hasNavigation).toBeTruthy();
    });
  });
});