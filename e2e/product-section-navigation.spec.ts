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

test("Product inventory evidence is presented with Work Package usage", async ({
  page,
}) => {
  const productUrl = "/products/30000000-0000-0000-0000-000000000004";

  await page.goto(productUrl);

  await expect(
    page.getByRole("heading", { name: "Product details" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Product usage summary" }),
  ).toHaveCount(0);

  await page.getByRole("link", { name: /Work Package usage/ }).click();

  await expect(page).toHaveURL(/tab=usage/);
  const summary = page.getByRole("region", { name: "Product usage summary" });
  await expect(summary).toBeVisible();
  await expect(summary.getByText("Available")).toBeVisible();
  await expect(summary.getByText("20 sheet")).toBeVisible();
  await expect(summary.getByText("Total required")).toBeVisible();
  await expect(summary.getByText("17 sheet")).toBeVisible();
  await expect(
    page.getByRole("table", { name: "Work Package usage" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Used in Work Packages" }),
  ).toHaveCount(0);
  await expect(page.getByText("Requirement evidence")).toHaveCount(0);
});

test("known demand remains visible when a requirement quantity is unknown", async ({
  page,
}) => {
  await page.goto("/products/30000000-0000-0000-0000-000000000002?tab=usage");

  const summary = page.getByRole("region", { name: "Product usage summary" });
  await expect(summary.getByText("Known required")).toBeVisible();
  await expect(summary.getByText("36 cartridge")).toBeVisible();
  await expect(
    summary.getByText("1 requirement has unknown quantity"),
  ).toBeVisible();
  await expect(
    summary.getByText(
      "Informational across listed Work Packages; does not reserve stock or assume concurrent work.",
    ),
  ).toBeVisible();
});
