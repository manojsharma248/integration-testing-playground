import { test, expect } from '@playwright/test';

test('visit the Pokemon page and have a search input', async ({ page }) => {
  await page.goto('/pokemon-search');

  const searchInput = page.getByPlaceholder('Search Pokémon…');
  await searchInput.type('Pika');

  const link = page.getByRole('link', { name: 'Pikachu' });

  await link.click();

  expect(page.url()).toContain('/25');
});

test('test', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Pokémon Search' }).click();
  await page.getByTestId('search').click();
  await page.getByTestId('search').type('bulb');
  await page.getByTestId('1').click();
  await page.getByRole('rowheader', { name: 'Pokédex Number' }).click();
  await page.getByRole('link', { name: 'Secret Menu' }).click();
  await page.getByRole('slider', { name: 'Minimum Rating:' }).fill('5');
  await page.getByRole('checkbox', { name: 'Name' }).uncheck();
  await page.getByRole('checkbox', { name: 'Where to Order' }).uncheck();
  await page.goto('http://localhost:3000/secret-menu');
  await page.getByRole('link', { name: 'Pokémon Search' }).click();
  await page.getByTestId('search').click();
  await page.getByTestId('search').type('Bulba');
  await page.getByTestId('1').click();
  const heading = page.getByRole('heading', { name: 'Bulbasaur' });
  await expect(heading).toBeVisible();
  await page.getByRole('rowheader', { name: 'Pokédex Number' }).click();
  const label = page.getByTestId('search-label');
  await expect(await label.textContent()).toMatchSnapshot();
});
