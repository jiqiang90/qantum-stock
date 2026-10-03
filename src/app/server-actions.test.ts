import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAuthService: vi.fn(),
  createAuthenticatedReadinessService: vi.fn(),
  redirect: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/modules/auth/create-auth-service", () => ({
  createAuthService: mocks.createAuthService,
}));
vi.mock("@/modules/readiness/create-readiness-service", () => ({
  createAuthenticatedReadinessService:
    mocks.createAuthenticatedReadinessService,
}));

import { signOutAction } from "./auth-actions";
import { signInAction } from "./sign-in/actions";
import { selectSolutionAction } from "./work-packages/[id]/actions";

const workPackageId = "20000000-0000-0000-0000-000000000001";
const solutionOptionId = "21000000-0000-0000-0000-000000000001";
const expectedCurrentOptionId = "21000000-0000-0000-0000-000000000002";

describe("authentication server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.redirect.mockImplementation((path: string) => {
      throw new Error(`redirect:${path}`);
    });
  });

  it("signs out before returning to the public workspace", async () => {
    const signOut = vi.fn().mockResolvedValue(undefined);
    mocks.createAuthService.mockResolvedValue({ signOut });

    await expect(signOutAction()).rejects.toThrow("redirect:/");
    expect(signOut).toHaveBeenCalledOnce();
  });

  it("returns validated sign-in feedback without redirecting", async () => {
    const result = {
      status: "invalid" as const,
      fieldErrors: { email: ["Enter a valid email address."] },
    };
    mocks.createAuthService.mockResolvedValue({
      signIn: vi.fn().mockResolvedValue(result),
    });
    const formData = new FormData();
    formData.set("email", "bad-email");

    await expect(signInAction({ status: "idle" }, formData)).resolves.toEqual({
      ...result,
      email: "bad-email",
    });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("redirects a successful sign-in to its validated continuation", async () => {
    mocks.createAuthService.mockResolvedValue({
      signIn: vi.fn().mockResolvedValue({
        status: "success",
        nextPath: `/work-packages/${workPackageId}`,
      }),
    });

    await expect(
      signInAction({ status: "idle" }, new FormData()),
    ).rejects.toThrow(`redirect:/work-packages/${workPackageId}`);
  });
});

describe("selectSolutionAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.redirect.mockImplementation((path: string) => {
      throw new Error(`redirect:${path}`);
    });
  });

  it("rejects malformed commands before creating an authenticated service", async () => {
    await expect(selectSolutionAction(new FormData())).rejects.toThrow(
      "redirect:/?selection=invalid",
    );
    expect(mocks.createAuthenticatedReadinessService).not.toHaveBeenCalled();
  });

  it.each([
    ["unauthenticated", `/sign-in?next=%2Fwork-packages%2F${workPackageId}`],
    ["conflict", `/work-packages/${workPackageId}?selection=conflict`],
    ["invalid", `/work-packages/${workPackageId}?selection=invalid`],
    ["unavailable", `/work-packages/${workPackageId}?selection=unavailable`],
  ] as const)("maps %s outcomes to a safe redirect", async (status, path) => {
    mocks.createAuthenticatedReadinessService.mockResolvedValue({
      selectSolution: vi.fn().mockResolvedValue({ status }),
    });

    await expect(selectSolutionAction(validSelectionForm())).rejects.toThrow(
      `redirect:${path}`,
    );
  });

  it("revalidates the detail route after a successful selection", async () => {
    mocks.createAuthenticatedReadinessService.mockResolvedValue({
      selectSolution: vi.fn().mockResolvedValue({
        status: "selected",
        selectedOptionId: solutionOptionId,
      }),
    });

    await expect(selectSolutionAction(validSelectionForm())).rejects.toThrow(
      `redirect:/work-packages/${workPackageId}`,
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      `/work-packages/${workPackageId}`,
    );
  });
});

function validSelectionForm(): FormData {
  const formData = new FormData();
  formData.set("workPackageId", workPackageId);
  formData.set("solutionOptionId", solutionOptionId);
  formData.set("expectedCurrentOptionId", expectedCurrentOptionId);
  return formData;
}
