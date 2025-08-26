import { Page, Locator } from '@playwright/test';

export class SearchModal {
  readonly page: Page;
  
  readonly searchModal: Locator;
  readonly searchInput: Locator;
  readonly searchResults: Locator;
  readonly noResultsMessage: Locator;
  readonly closeButton: Locator;
  readonly recentSearches: Locator;
  readonly searchCategories: Locator;

  constructor(page: Page) {
    this.page = page;
    
    this.searchModal = page.locator('[role="dialog"][aria-label*="Search"], .search-modal, [data-search-modal]');
    this.searchInput = page.locator('[role="dialog"] input[type="search"], [role="dialog"] input[placeholder*="Search"]');
    this.searchResults = page.locator('[role="option"], .search-result-item, [data-search-result]');
    this.noResultsMessage = page.locator('text=/no results|nothing found/i');
    this.closeButton = page.locator('[role="dialog"] button[aria-label*="Close"], [role="dialog"] button:has-text("ESC")');
    this.recentSearches = page.locator('.recent-searches, [data-recent-searches]');
    this.searchCategories = page.locator('.search-category, [data-search-category]');
  }

  async openWithKeyboard() {
    // Try Ctrl+K first, then Cmd+K for Mac compatibility
    await this.page.keyboard.press('Control+K');
    
    if (!await this.searchModal.isVisible({ timeout: 1000 })) {
      await this.page.keyboard.press('Meta+K');
    }
    
    await this.searchModal.waitFor({ state: 'visible', timeout: 5000 });
  }

  async openWithClick() {
    const searchButton = this.page.locator('button:has-text("Search"), button[aria-label*="Search"]').first();
    await searchButton.click();
    await this.searchModal.waitFor({ state: 'visible', timeout: 5000 });
  }

  async search(query: string) {
    await this.searchInput.clear();
    await this.searchInput.fill(query);
    
    await this.page.waitForTimeout(500);
    
    await Promise.race([
      this.searchResults.first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {}),
      this.noResultsMessage.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {})
    ]);
  }

  async getSearchResults(): Promise<string[]> {
    await this.page.waitForTimeout(500);
    
    const results = await this.searchResults.allTextContents();
    return results.filter(text => text.trim().length > 0);
  }

  async clickResult(index: number = 0) {
    const result = this.searchResults.nth(index);
    await result.waitFor({ state: 'visible' });
    await result.click();
    
    await this.page.waitForLoadState('domcontentloaded');
  }

  async clickFirstResult() {
    await this.clickResult(0);
  }

  async hasResults(): Promise<boolean> {
    try {
      await this.searchResults.first().waitFor({ state: 'visible', timeout: 2000 });
      const count = await this.searchResults.count();
      return count > 0;
    } catch {
      return false;
    }
  }

  async hasNoResultsMessage(): Promise<boolean> {
    return await this.noResultsMessage.isVisible();
  }

  async close() {
    if (await this.closeButton.isVisible()) {
      await this.closeButton.click();
    } else {
      await this.page.keyboard.press('Escape');
    }
    
    await this.searchModal.waitFor({ state: 'hidden', timeout: 3000 });
  }

  async getRecentSearches(): Promise<string[]> {
    if (await this.recentSearches.isVisible()) {
      const searches = await this.recentSearches.locator('button, a').allTextContents();
      return searches.filter(text => text.trim().length > 0);
    }
    return [];
  }

  async selectCategory(categoryName: string) {
    const category = this.searchCategories.filter({ hasText: categoryName });
    if (await category.isVisible()) {
      await category.click();
      await this.page.waitForTimeout(500);
    }
  }

  async clearSearch() {
    await this.searchInput.clear();
    await this.searchInput.press('Backspace');
  }

  async isOpen(): Promise<boolean> {
    return await this.searchModal.isVisible();
  }

  async navigateWithArrowKeys(direction: 'up' | 'down') {
    if (direction === 'down') {
      await this.page.keyboard.press('ArrowDown');
    } else {
      await this.page.keyboard.press('ArrowUp');
    }
    await this.page.waitForTimeout(100);
  }

  async selectHighlightedResult() {
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('domcontentloaded');
  }
}