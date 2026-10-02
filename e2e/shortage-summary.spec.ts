import { expect, test } from "@playwright/test";

test.use({
  launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
    : {},
});

test("a Team Leader can preview and copy one Work Package shortage", async ({
  context,
  page,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:3000",
  });
  await page.goto("/work-packages/20000000-0000-0000-0000-000000000003");

  const panel = page.getByRole("region", { name: "Prepare shortage summary" });
  await panel
    .getByRole("checkbox", {
      name: /Wrap PVC pipe penetrations through the Level 1 timber infill floor/i,
    })
    .check();
  await panel
    .getByRole("textbox", { name: "Optional note" })
    .fill("Confirm material delivery before travel.");
  await panel.getByRole("button", { name: "Preview summary" }).click();

  const preview = panel.getByRole("textbox", { name: "Summary preview" });
  await expect(preview).toHaveValue(/MATERIAL SHORTAGE SUMMARY/);
  await expect(preview).toHaveValue(/Available: 0 roll/);
  await expect(preview).toHaveValue(
    /Note: Confirm material delivery before travel\./,
  );

  await panel.getByRole("button", { name: "Copy summary" }).click();
  await expect(panel.getByRole("status")).toHaveText("Copied");
  await expect(panel).not.toContainText(/Sent|Reported|Escalated/);
});
