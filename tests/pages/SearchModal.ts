import { Page, Locator } from '@playwright/test';

export class SearchModal {
  readonly page: Page;
  
  // Search modal specific locators
  readonly searchModal: Locator;
  readonly searchInput: Locator;
  readonly searchResults: Locator;
  readonly noResultsMessage: Locator;
  readonly closeButton: Locator;
  readonly recentSearches: Locator;
  readonly searchCategories: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators for search modal
    this.searchModal = page.locator('[role="dialog"][aria-label*="Search"], .search-modal, [data-search-modal]');
    this.searchInput = page.locator('[role="dialog"] input[type="search"], [role="dialog"] input[placeholder*="Search"]');
    this.searchResults = page.locator('[role="option"], .search-result-item, [data-search-result]');
    this.noResultsMessage = page.locator('text=/no results|nothing found/i');
    this.closeButton = page.locator('[role="dialog"] button[aria-label*="Close"], [role="dialog"] button:has-text("ESC")');
    this.recentSearches = page.locator('.recent-searches, [data-recent-searches]');
    this.searchCategories = page.locator('.search-category, [data-search-category]');
  }

  // Open search using keyboard shortcut
  async openWithKeyboard() {
    // Try Ctrl+K (Windows/Linux) first
    await this.page.keyboard.press('Control+K');
    
    // If not visible, try Cmd+K (Mac)
    if (!await this.searchModal.isVisible({ timeout: 1000 })) {
      await this.page.keyboard.press('Meta+K');
    }
    
    // Wait for modal to be fully visible
    await this.searchModal.waitFor({ state: 'visible', timeout: 5000 });
  }

  // Open search by clicking button
  async openWithClick() {
    const searchButton = this.page.locator('button:has-text("Search"), button[aria-label*="Search"]').first();
    await searchButton.click();
    await this.searchModal.waitFor({ state: 'visible', timeout: 5000 });
  }

  // Perform a search
  async search(query: string) {
    await this.searchInput.clear();
    await this.searchInput.fill(query);
    
    // Wait for debounce and results to load
    await this.page.waitForTimeout(500);
    
    // Wait for either results or no results message
    await Promise.race([
      this.searchResults.first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {}),
      this.noResultsMessage.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {})
    ]);
  }

  // Get all search results
  async getSearchResults(): Promise<string[]> {
    // Wait a bit for results to stabilize
    await this.page.waitForTimeout(500);
    
    const results = await this.searchResults.allTextContents();
    return results.filter(text => text.trim().length > 0);
  }

  // Click on a specific result by index
  async clickResult(index: number = 0) {
    const result = this.searchResults.nth(index);
    await result.waitFor({ state: 'visible' });
    await result.click();
    
    // Wait for navigation
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Click on the first result
  async clickFirstResult() {
    await this.clickResult(0);
  }

  // Check if there are any results
  async hasResults(): Promise<boolean> {
    try {
      await this.searchResults.first().waitFor({ state: 'visible', timeout: 2000 });
      const count = await this.searchResults.count();
      return count > 0;
    } catch {
      return false;
    }
  }

  // Check if no results message is shown
  async hasNoResultsMessage(): Promise<boolean> {
    return await this.noResultsMessage.isVisible();
  }

  // Close the search modal
  async close() {
    // Try multiple ways to close
    if (await this.closeButton.isVisible()) {
      await this.closeButton.click();
    } else {
      // Try ESC key
      await this.page.keyboard.press('Escape');
    }
    
    // Wait for modal to disappear
    await this.searchModal.waitFor({ state: 'hidden', timeout: 3000 });
  }

  // Get recent searches if available
  async getRecentSearches(): Promise<string[]> {
    if (await this.recentSearches.isVisible()) {
      const searches = await this.recentSearches.locator('button, a').allTextContents();
      return searches.filter(text => text.trim().length > 0);
    }
    return [];
  }

  // Filter by category if available
  async selectCategory(categoryName: string) {
    const category = this.searchCategories.filter({ hasText: categoryName });
    if (await category.isVisible()) {
      await category.click();
      await this.page.waitForTimeout(500); // Wait for filter to apply
    }
  }

  // Clear search input
  async clearSearch() {
    await this.searchInput.clear();
    // Trigger change event
    await this.searchInput.press('Backspace');
  }

  // Check if search modal is currently open
  async isOpen(): Promise<boolean> {
    return await this.searchModal.isVisible();
  }

  // Navigate results with keyboard
  async navigateWithArrowKeys(direction: 'up' | 'down') {
    if (direction === 'down') {
      await this.page.keyboard.press('ArrowDown');
    } else {
      await this.page.keyboard.press('ArrowUp');
    }
    await this.page.waitForTimeout(100); // Small delay for focus change
  }

  // Select current highlighted result with Enter
  async selectHighlightedResult() {
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('domcontentloaded');
  }
}