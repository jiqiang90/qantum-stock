import { expect, test } from "@playwright/test";

const workPackagePath = "/work-packages/20000000-0000-0000-0000-000000000001";
const authenticatedWorkPackagePath =
  "/work-packages/20000000-0000-0000-0000-000000000006";

test("a public visitor can preview an alternative without changing the selection", async ({
  page,
}) => {
  await page.goto(workPackagePath);

  await expect(page.getByLabel("Preview readiness")).toContainText("READY");
  await page.getByRole("radio", { name: /Ryanfire 0455, SHORTAGE/ }).click();

  await expect(page.getByLabel("Preview readiness")).toContainText("SHORTAGE");
  await expect(page.getByText("Alternative preview")).toBeVisible();
  await expect(
    page.getByText(
      "Install collars for the alternative service-riser Solution",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Sign in to update Solution" }),
  ).toHaveAttribute(
    "href",
    `/sign-in?next=${encodeURIComponent(workPackagePath)}`,
  );

  await page.reload();
  await expect(
    page.getByRole("radio", { name: /Ryanfire 0444, READY, selected/ }),
  ).toBeChecked();
});

test("the Solution decision remains usable on a narrow screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(workPackagePath);

  await page.getByRole("radio", { name: /Ryanfire 0455, SHORTAGE/ }).click();

  await expect(
    page.getByRole("link", { name: "Sign in to update Solution" }),
  ).toBeVisible();
  const bodyWidth = await page.locator("body").evaluate((body) => ({
    clientWidth: body.clientWidth,
    scrollWidth: body.scrollWidth,
  }));
  expect(bodyWidth.scrollWidth).toBe(bodyWidth.clientWidth);
});

test("a Demo Team Leader can persist an eligible selection and sign out", async ({
  page,
}) => {
  const email = process.env.E2E_TEAM_LEADER_EMAIL;
  const password = process.env.E2E_TEAM_LEADER_PASSWORD;
  test.skip(
    !email || !password,
    "Local Demo Team Leader credentials required.",
  );

  await page.goto(
    `/sign-in?next=${encodeURIComponent(authenticatedWorkPackagePath)}`,
  );
  await page.getByLabel("Email address").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(new RegExp(`${authenticatedWorkPackagePath}$`));
  const firstOption = page.getByRole("radio", {
    name: /Ryanfire 0510, UNKNOWN/,
  });
  const secondOption = page.getByRole("radio", {
    name: /Ryanfire 0677, READY/,
  });
  const alternativeOption = (await firstOption.isChecked())
    ? secondOption
    : firstOption;

  await alternativeOption.click();
  await page.getByRole("button", { name: "Use this Solution" }).click();

  await expect(page).toHaveURL(new RegExp(`${authenticatedWorkPackagePath}$`));
  await expect(alternativeOption).toBeChecked();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
});
