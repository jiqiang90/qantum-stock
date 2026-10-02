import { expect, test } from "@playwright/test";

test.use({
  launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
    : {},
});

test("Product section navigation does not create vertical overflow", async ({
  page,
}) => {
  await page.goto("/products/30000000-0000-0000-0000-000000000003?tab=usage");

  const scroller = page
    .getByRole("navigation", { name: "Product sections" })
    .locator(":scope > div");

  await expect(scroller).toBeVisible();
  const dimensions = await scroller.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));

  expect(dimensions.scrollHeight).toBe(dimensions.clientHeight);
});
