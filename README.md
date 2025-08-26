React.dev Automated Testing Suite

Project Overview:
    This project contains an automated testing suite for the React.dev website, built using Playwright with TypeScript and implementing the Page Object Model design pattern. The test suite validates various functionalities including search, navigation, accessibility, and responsive design.

Technologies Used:
    Playwright - Modern end-to-end testing framework
    TypeScript - Type-safe JavaScript for better code quality
    Page Object Model - Design pattern for maintainable test architecture
    GitHub Actions - CI/CD pipeline for automated test execution

Installation & Setup:
    - Prerequisites:
        Node.js (v16 or higher)
        npm or yarn

    - Install Dependencies:
        "npm install"

    - Install Playwright Browsers:
        "npx playwright install"

Running Tests:
    - Run All Tests:
        "npx playwright test"

    - Run Tests in UI Mode (Recommended for Development):
        "npx playwright test --ui"

    - Run Specific Test File:
        "npx playwright test homepage.spec.ts"

    - Run Tests in Specific Browser:
        "npx playwright test --project=chromium"
        "npx playwright test --project=firefox"
        "npx playwright test --project=webkit"

    - Run Tests in Debug Mode:
        "npx playwright test --debug"

    - Generate HTML Report:
        "npx playwright test --reporter=html"
        "npx playwright show-report"

Test Coverage:

    Implemented Test Scenarios:

    - Basic Layout & Navigation:
        Homepage loads successfully
        Navigation menu is visible and functional
        Main content sections are present

    - Search Functionality:
        Search modal opens correctly
        Search returns relevant results
        Navigation to search results works
        Search modal closes with Escape key
        Keyboard shortcuts (Ctrl+K) - environment dependent

    - Accessibility:
        Keyboard navigation with Tab key
        Focus indicators are visible
        ARIA labels are present

    - Responsive Design:
        Mobile viewport adaptation (375px)
        Tablet viewport adaptation (768px)
        Desktop viewport display (1920px)

    - Performance:
        Page loads within acceptable time
        404 pages handled gracefully

    - Interactive Examples:
        Code blocks present on documentation pages
        Interactive sandboxes detected
        Copy buttons for code snippets

    - Documentation Navigation:
        Sidebar navigation on docs pages
        Breadcrumb/pagination navigation

Test Results Summary:
    Total Tests: 20
    Passed: 18
    Failed: 1 (keyboard shortcut - browser specific)
    Skipped: 1 (theme toggle - optional feature)
    Success Rate: 90%

Architecture Decisions:

    - Page Object Model (POM):
        The project implements POM pattern for better:
        Maintainability - Changes to UI require updates in one place
        Readability - Tests read like natural language
        Reusability - Common actions are defined once

        Example:
        Instead of:
            "await page.click('.DocSearch-Button');"
            "await page.fill('.DocSearch-Input', 'hooks');"

        We use:
            "await homePage.openSearch();"
            "await homePage.searchFor('hooks');"

    - TypeScript Benefits:
        Type safety prevents runtime errors
        IntelliSense support for better development experience
        Self-documenting code with interfaces and types

    - Error Handling:
        Graceful fallbacks for missing elements
        Timeout configurations for slow networks
        Try-catch blocks for optional features

Creative Test Scenarios:
    Beyond the required test cases, I've implemented:

    1. 404 Error Handling - Verifies graceful degradation
    2. Code Block Detection - Ensures documentation quality
    3. Sidebar Navigation - Tests documentation structure
    4. Performance Monitoring - Tracks page load times
    5. Multi-viewport Testing - Ensures responsive design
    6. Keyboard-only Navigation - Validates accessibility

Configuration:
    Key configurations in playwright.config.ts:
    - Timeout: 30 seconds per test
    - Retries: 1 retry on failure
    - Browsers: Chrome, Firefox, WebKit
    - Parallel Execution: 4 workers
    - Screenshots: On failure
    - Videos: On first retry

Known Issues & Limitations:
    1. Keyboard Shortcuts: May not work in all browser environments
    2. Theme Toggle: Feature availability varies
    3. Search Results: Timing dependent on network speed

CI/CD Integration:
    GitHub Actions workflow runs tests on:
    - Every push to main branch
    - Pull requests
    - Manual trigger option

Future Improvements:
    - Add visual regression testing
    - Implement API testing for search
    - Add performance metrics collection
    - Create custom test reports
    - Add cross-browser compatibility matrix
    - Implement test data management

Development Tips:

    - Finding Selectors:
        "npx playwright codegen https://react.dev"

    - Debugging Failed Tests:
        "npx playwright test --headed --slowmo=1000"

    - View Test Traces:
        "npx playwright show-trace"

Resources:
    Playwright Documentation: https://playwright.dev
    React.dev Website: https://react.dev
    Page Object Model Pattern: https://martinfowler.com/bliki/PageObject.html
    TypeScript Best Practices: https://www.typescriptlang.org/docs/