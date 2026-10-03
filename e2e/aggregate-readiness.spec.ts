import { expect, test } from "@playwright/test";

const applicationOrigin =
  process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

test.use({
  launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
    : {},
});

test("two individually ready Work Packages expose shared inventory contention", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: applicationOrigin,
  });
  await page.goto("/");

  await expect(page.getByRole("checkbox")).toHaveCount(0);

  const firstRiserRow = page
    .getByRole("row")
    .filter({ hasText: "Level 2 service riser firestopping" });
  await expect(firstRiserRow).toContainText(
    "Ryanfire 0444 · PVC Pipe Ø40mm · Plasterboard Wall · 60/60",
  );
  await expect(
    page.getByRole("link", {
      name: "Level 3 ceiling conduit penetrations",
    }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Check combined availability" }).click();
  await expect(page).toHaveURL(/\?mode=combined/);

  await page
    .getByRole("checkbox", {
      name: "Select Level 2 service riser firestopping",
    })
    .check();
  await page
    .getByRole("checkbox", {
      name: "Select Level 3 east riser firestopping",
    })
    .check();
  await page.getByRole("button", { name: "Check availability" }).click();

  const summary = page.getByRole("dialog", {
    name: "Combined Availability Report",
  });
  await expect(summary).toBeVisible();
  await expect(summary.getByText("2 Work Packages selected")).toBeVisible();

  const sealantRow = summary
    .getByRole("row")
    .filter({ hasText: "IS-310 Intumescent Sealant 310 ml" });
  await expect(sealantRow).toContainText("10 cartridge");
  await expect(sealantRow).toContainText("8 cartridge");
  await expect(sealantRow).toContainText("2 cartridge");
  await expect(sealantRow).toContainText("SHORTAGE");
  await expect(summary).toContainText(
    "It does not reserve stock or decide which package receives it.",
  );
  await summary.getByRole("button", { name: "Copy summary" }).click();
  await expect(summary.getByRole("status")).toHaveText("Copied");
  await expect(
    summary.getByRole("textbox", { name: "Summary preview" }),
  ).toHaveValue(/COMBINED MATERIAL SHORTAGE SUMMARY/);

  await page.keyboard.press("Escape");
  await expect(summary).toBeHidden();
  await expect(page).toHaveURL(/mode=combined/);
  await expect(page).not.toHaveURL(/compare=1/);
  await expect(
    page.getByRole("checkbox", {
      name: "Select Level 2 service riser firestopping",
    }),
  ).toBeChecked();
  await expect(
    page.getByRole("checkbox", {
      name: "Select Level 3 east riser firestopping",
    }),
  ).toBeChecked();

  await page.getByRole("button", { name: "Check availability" }).click();
  await expect(summary).toBeVisible();
  await summary.getByRole("button", { name: "Close report" }).click();
  await expect(summary).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Check availability" }),
  ).toBeFocused();

  await page.getByRole("link", { name: "Exit combined availability" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("checkbox")).toHaveCount(0);
});
