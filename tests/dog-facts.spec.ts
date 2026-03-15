import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Fixture data — deterministic facts used by every mocked test
// ---------------------------------------------------------------------------
const MOCK_FACTS = [
  { id: 0, fact: 'Dogs have sweat glands in between their paws.' },
  { id: 1, fact: 'Ancient Egyptians revered their dogs.' },
  { id: 2, fact: "A dog's nose print is unique, much like a human fingerprint." },
  { id: 3, fact: 'Dogs can hear sounds four times farther away than humans.' },
  { id: 4, fact: 'The Basenji dog is the only breed that cannot bark.' },
  { id: 5, fact: 'Dogs have three eyelids.' },
  { id: 6, fact: 'The average dog can run about 19 mph.' },
  { id: 7, fact: 'Dogs dream just like people do.' },
  { id: 8, fact: 'Dogs can smell about 1,000 times better than humans.' },
  { id: 9, fact: 'The tallest dog ever recorded was a Great Dane.' },
];

// Helper — registers a route intercept; latest registration wins in Playwright.
const mockApi = async (page: Page, facts: typeof MOCK_FACTS) => {
  await page.route('**/dog-facts/api**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ facts }),
    });
  });
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
test.describe('Dog Facts page', () => {
  // ── Initial State ──────────────────────────────────────────────────────────

  test('shows empty state on initial load', async ({ page }) => {
    await page.goto('/dog-facts');

    await expect(page.getByTestId('empty-state')).toBeVisible();
    await expect(page.getByTestId('dog-fact')).toHaveCount(0);
  });

  test('default amount is 3', async ({ page }) => {
    await page.goto('/dog-facts');

    await expect(page.getByTestId('amount-select')).toHaveValue('3');
  });

  test('page title reflects the default amount', async ({ page }) => {
    await page.goto('/dog-facts');

    await expect(page).toHaveTitle('3 Dog Facts');
  });

  test('select has 10 options with correct singular/plural labels', async ({ page }) => {
    await page.goto('/dog-facts');

    const options = page.getByTestId('amount-select').locator('option');
    await expect(options).toHaveCount(10);
    await expect(options.nth(0)).toHaveText('1 Fact');
    for (let i = 2; i <= 10; i++) {
      await expect(options.nth(i - 1)).toHaveText(`${i} Facts`);
    }
  });

  // ── URL Query Parameter ────────────────────────────────────────────────────

  test('?amount=5 pre-selects the dropdown', async ({ page }) => {
    await page.goto('/dog-facts?amount=5');

    await expect(page.getByTestId('amount-select')).toHaveValue('5');
  });

  test('?amount=5 sets the page title', async ({ page }) => {
    await page.goto('/dog-facts?amount=5');

    await expect(page).toHaveTitle('5 Dog Facts');
  });

  // ── Fetch Functionality ────────────────────────────────────────────────────

  test('fetches 3 facts by default', async ({ page }) => {
    await mockApi(page, MOCK_FACTS.slice(0, 3));
    await page.goto('/dog-facts');

    await page.getByTestId('fetch-button').click();

    await expect(page.getByTestId('dog-fact')).toHaveCount(3);
  });

  test('empty state disappears after fetching facts', async ({ page }) => {
    await mockApi(page, MOCK_FACTS.slice(0, 3));
    await page.goto('/dog-facts');

    await page.getByTestId('fetch-button').click();

    await expect(page.getByTestId('dog-fact')).toHaveCount(3);
    await expect(page.getByTestId('empty-state')).not.toBeVisible();
  });

  test('each fact card shows its heading and fact text', async ({ page }) => {
    const facts = MOCK_FACTS.slice(0, 2);
    await mockApi(page, facts);
    await page.goto('/dog-facts');

    await page.getByTestId('fetch-button').click();

    const cards = page.getByTestId('dog-fact');
    await expect(cards).toHaveCount(2);

    await expect(cards.nth(0).getByRole('heading')).toContainText(`Dog Fact #${facts[0].id}`);
    await expect(cards.nth(0).locator('p')).toHaveText(facts[0].fact);

    await expect(cards.nth(1).getByRole('heading')).toContainText(`Dog Fact #${facts[1].id}`);
    await expect(cards.nth(1).locator('p')).toHaveText(facts[1].fact);
  });

  test('fetches a custom amount when changed in the dropdown', async ({ page }) => {
    await mockApi(page, MOCK_FACTS.slice(0, 5));
    await page.goto('/dog-facts');

    await page.getByTestId('amount-select').selectOption('5');
    await page.getByTestId('fetch-button').click();

    await expect(page.getByTestId('dog-fact')).toHaveCount(5);
  });

  test('fetches 1 fact — minimum boundary', async ({ page }) => {
    await mockApi(page, MOCK_FACTS.slice(0, 1));
    await page.goto('/dog-facts');

    await page.getByTestId('amount-select').selectOption('1');
    await page.getByTestId('fetch-button').click();

    await expect(page.getByTestId('dog-fact')).toHaveCount(1);
  });

  test('fetches 10 facts — maximum boundary', async ({ page }) => {
    await mockApi(page, MOCK_FACTS);
    await page.goto('/dog-facts');

    await page.getByTestId('amount-select').selectOption('10');
    await page.getByTestId('fetch-button').click();

    await expect(page.getByTestId('dog-fact')).toHaveCount(10);
  });

  // ── Clear Functionality ────────────────────────────────────────────────────

  test('Clear button removes all fact cards and restores empty state', async ({ page }) => {
    await mockApi(page, MOCK_FACTS.slice(0, 3));
    await page.goto('/dog-facts');

    await page.getByTestId('fetch-button').click();
    await expect(page.getByTestId('dog-fact')).toHaveCount(3);

    await page.getByTestId('clear-button').click();

    await expect(page.getByTestId('dog-fact')).toHaveCount(0);
    await expect(page.getByTestId('empty-state')).toBeVisible();
  });

  test('re-fetching replaces existing facts rather than appending them', async ({ page }) => {
    // First fetch: 3 facts
    await mockApi(page, MOCK_FACTS.slice(0, 3));
    await page.goto('/dog-facts');
    await page.getByTestId('fetch-button').click();
    await expect(page.getByTestId('dog-fact')).toHaveCount(3);

    // Second fetch: 1 fact — most-recently registered handler wins in Playwright
    await mockApi(page, MOCK_FACTS.slice(0, 1));
    await page.getByTestId('amount-select').selectOption('1');
    await page.getByTestId('fetch-button').click();

    await expect(page.getByTestId('dog-fact')).toHaveCount(1);
  });

  // ── Edge Cases ─────────────────────────────────────────────────────────────

  test('fetching does not navigate away from the page', async ({ page }) => {
    await mockApi(page, MOCK_FACTS.slice(0, 3));
    await page.goto('/dog-facts');

    await page.getByTestId('fetch-button').click();
    await expect(page.getByTestId('dog-fact')).toHaveCount(3);

    expect(page.url()).toContain('/dog-facts');
  });

  test('can submit the form using keyboard — Tab to Fetch button then Enter', async ({ page }) => {
    await mockApi(page, MOCK_FACTS.slice(0, 3));
    await page.goto('/dog-facts');

    // Tab from the select to the Fetch button, then activate it with Enter
    await page.getByTestId('amount-select').focus();
    await page.keyboard.press('Tab'); // moves focus to the Fetch button
    await page.keyboard.press('Enter'); // submits the form

    await expect(page.getByTestId('dog-fact')).toHaveCount(3);
  });

  // ── Real API Integration ───────────────────────────────────────────────────
  // These tests hit the actual server — no route mocking.

  test('API returns the requested number of facts', async ({ request }) => {
    const response = await request.get('/dog-facts/api?amount=3');

    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body.facts).toHaveLength(3);
    expect(body.facts[0]).toMatchObject({
      id: expect.any(Number),
      fact: expect.any(String),
    });
  });

  test('API returns 1 fact at the minimum boundary', async ({ request }) => {
    const response = await request.get('/dog-facts/api?amount=1');

    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body.facts).toHaveLength(1);
  });

  test('API returns 10 facts at the maximum boundary', async ({ request }) => {
    const response = await request.get('/dog-facts/api?amount=10');

    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body.facts).toHaveLength(10);
  });
});
