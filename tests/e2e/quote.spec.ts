import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { handleQuote } from '../../netlify/lib/submit-handler';
// Browser -> actual validation/handler -> isolated persistence double. Live service test still required after configuration.
test('submits a quote through the real handler and shows the persisted summary', async ({
  page,
}) => {
  let saves = 0;
  await page.route('**/.netlify/functions/submit-quote', async (route) => {
    const response = await handleQuote(
      new Request('http://127.0.0.1:4173/.netlify/functions/submit-quote', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: route.request().postData() ?? '',
      }),
      {
        allowedOrigins: ['http://127.0.0.1:4173'],
        catalog: async () => ({
          spaces: [
            { id: '10000000-0000-4000-8000-000000000001', uses_surface: true, is_simulator: false },
          ],
          tierIds: [],
        }),
        save: async () => {
          saves++;
          return '30000000-0000-4000-8000-000000000001';
        },
        notify: async () => {},
      },
    );
    await route.fulfill({
      status: response.status,
      contentType: 'application/json',
      body: await response.text(),
    });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Add Putting greens to quote', exact: true }).click();
  await page.getByLabel('Full name *', { exact: true }).fill('Test Customer');
  await page.getByLabel('Email address *', { exact: true }).fill('quote-test@example.test');
  await page.getByLabel('Phone number *', { exact: true }).fill('+254700000000');
  await page.getByLabel('Property type *', { exact: true }).selectOption('Home');
  await page.getByLabel('Town / location *', { exact: true }).fill('Nairobi');
  await page.getByLabel('Preferred surface *', { exact: true }).selectOption('Advise me');
  await page.getByLabel(/I agree that/).check();
  await page.getByRole('button', { name: 'Request my quote' }).click();
  await expect(page.getByText('Your request has been received.')).toBeVisible();
  expect(saves).toBe(1);
  await expect(page.locator('#quote-success')).toContainText('Putting greens');
  await expect(page.locator('a', { hasText: 'Send on WhatsApp' })).toHaveCount(0);
});
test('simulator dimensions keep focus and update fit; removing clears conditional UI', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add Simulator bays to quote', exact: true }).click();
  await page.getByLabel('Length (m)', { exact: true }).fill('5');
  await expect(page.getByLabel('Length (m)', { exact: true })).toBeFocused();
  await page.getByLabel('Width (m)', { exact: true }).fill('3.5');
  await page.getByLabel('Height (m)', { exact: true }).fill('2.8');
  await expect(
    page.getByText('Your dimensions meet our initial room-fit guide.', { exact: false }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Remove Simulator bays from basket', exact: true })
    .click();
  await expect(page.getByLabel('Length (m)', { exact: true })).toHaveCount(0);
});
test('retains details and focuses error summary after server failure', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Request my quote' }).click();
  await expect(page.getByRole('alert')).toBeFocused();
  await expect(page.getByRole('alert')).toContainText('Choose at least one space');
});
for (const width of [320, 375, 768, 1024])
  test(`no overflow and accessible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Putting greens', exact: true })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    const smallTargets = await page.locator('button,a').evaluateAll((elements) =>
      elements
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
        })
        .map((element) => element.textContent?.trim())
        .filter(Boolean),
    );
    expect(smallTargets).toEqual([]);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
