import { expect, test } from "@playwright/test";

test.use({
  launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
    : {},
});

test("two individually ready Work Packages expose shared inventory contention", async ({
  page,
}) => {
  await page.goto("/");

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
  await page.getByRole("button", { name: "Check selected packages" }).click();

  const summary = page.getByRole("region", {
    name: "Selected package readiness",
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
});
