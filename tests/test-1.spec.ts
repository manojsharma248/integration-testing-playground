import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Stopwatch' }).click();
  await page.getByRole('button', { name: 'Snap!' }).click();
  await page.getByRole('button', { name: 'Crackle!' }).click();
  await page.getByRole('button', { name: 'Pop!' }).click();
  await page.getByRole('link', { name: 'Dog Facts' }).click();
  await page.getByRole('link', { name: 'Echo Chamber' }).click();
  await page.getByRole('link', { name: 'Pokémon Search' }).click();
  await page.getByRole('link', { name: 'Input Obstacles' }).click();
  await page.getByTestId('text-input').click();
  await page.getByTestId('text-input').fill('hello');
  await page.getByTestId('text-input').press('Enter');
  await page.getByTestId('select-input').selectOption('Thor');
  await page.getByTestId('checkbox-tomato').check();
  await page.getByTestId('checkbox-onion').check();
  await page.getByTestId('checkbox-sardines').check();
  await page.getByTestId('checkbox-lettuce').check();
  await page.getByTestId('radio-john').check();
  await page.goto('http://localhost:3000/obstacle-course');
  await page.getByTestId('color-input').click();
  await page.getByTestId('color-input').click();
  await page.getByTestId('color-input').fill('#00ffd5');
  await page
    .locator('div')
    .filter({ hasText: /^Favorite Color$/ })
    .click();
  await page.getByTestId('range-input').fill('9');
});
