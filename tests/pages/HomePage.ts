import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly header: Locator;
  readonly footer: Locator;
  readonly searchButton: Locator;
  readonly searchInput: Locator;
  readonly themeToggle: Locator;
  readonly navigationMenu: Locator;
  readonly logo: Locator;

  constructor(page: Page) {
    this.page = page;

    this.header = page.locator('nav[role="navigation"]').first();
    this.footer = page.locator('footer, .footer, div[class*="footer"]').first();

    this.searchButton = page.locator('button:has-text("Search"), [aria-label*="Search"], .DocSearch-Button').first();
    this.searchInput = page.locator('.DocSearch-Input, [class*="DocSearch"] input').first();
    
    this.themeToggle = page.locator('button:has(svg[aria-label*="Sun"]), button:has(svg[aria-label*="Moon"]), button[aria-label*="appearance"], button[title*="theme"]').first();
    
    this.navigationMenu = page.locator('nav[role="navigation"], nav').first();
    this.logo = page.locator('a[aria-label*="React"], a[href="/"] svg, .logo').first();
  }

  async goto() {
    await this.page.goto('https://react.dev');
    await this.page.waitForLoadState('networkidle', { timeout: 15000 });
  }

  async openSearch() {
    const searchBtn = await this.searchButton.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (searchBtn) {
      await this.searchButton.click();
      await this.page.waitForSelector('.DocSearch-Modal, [role="dialog"]', { state: 'visible', timeout: 5000 });
    } else {
      await this.page.keyboard.press('Control+K');
      await this.page.waitForTimeout(500);
      const modalVisible = await this.page.locator('.DocSearch-Modal, [role="dialog"]').isVisible({ timeout: 500 }).catch(() => false);
      if (!modalVisible) {
        await this.page.keyboard.press('Meta+K');
      }
    }
  }

  async searchFor(query: string) {
    const searchInputSelector = '.DocSearch-Input, [role="dialog"] input[type="search"], [role="searchbox"]';
    await this.page.waitForSelector(searchInputSelector, { state: 'visible', timeout: 5000 });
    const input = this.page.locator(searchInputSelector).first();
    await input.fill(query);
    await this.page.waitForTimeout(1500);
  }

  async clickFirstSearchResult() {
    const firstResult = this.page.locator('.DocSearch-Hit, [id^="docsearch-item"]').first();
    await firstResult.waitFor({ state: 'visible', timeout: 5000 });
    await firstResult.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async toggleTheme() {
    const themeSelectors = [
      'button[title*="theme"]',
      'button[aria-label*="appearance"]',
      'button:has(svg[class*="sun"])',
      'button:has(svg[class*="moon"])',
      '[data-theme-toggle]',
      'button[class*="theme"]'
    ];
    
    for (const selector of themeSelectors) {
      const button = this.page.locator(selector).first();
      if (await button.isVisible({ timeout: 500 }).catch(() => false)) {
        await button.click();
        await this.page.waitForTimeout(500);
        return;
      }
    }
    
    throw new Error('Theme toggle button not found');
  }

  async getCurrentTheme(): Promise<'light' | 'dark'> {
    const html = this.page.locator('html');
    const htmlClass = await html.getAttribute('class') || '';
    const htmlDataTheme = await html.getAttribute('data-theme') || '';
    const bodyClass = await this.page.locator('body').getAttribute('class') || '';
    
    if (htmlClass.includes('dark') || htmlDataTheme.includes('dark') || bodyClass.includes('dark')) {
      return 'dark';
    }
    
    const isDark = await this.page.evaluate(() => {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    
    return isDark ? 'dark' : 'light';
  }

  async getNavigationItems(): Promise<string[]> {
    const navItems = await this.navigationMenu.locator('a').allTextContents();
    return navItems.filter(text => text.trim().length > 0);
  }

  async openMobileMenu() {
    const hamburgerMenu = this.page.locator('button[aria-label*="Menu"], button[aria-label*="menu"], button.menu-toggle, [data-mobile-menu]');
    if (await hamburgerMenu.isVisible({ timeout: 1000 }).catch(() => false)) {
      await hamburgerMenu.click();
      await this.page.waitForTimeout(500);
      return true;
    }
    return false;
  }

  async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible({ timeout: 3000 });
    } catch {
      return false;
    }
  }

  async scrollToFooter() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(500);
  }
}