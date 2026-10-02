import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AuthStatus } from "./auth-status";
import { SignInForm, type SignInAction } from "./sign-in-form";

describe("SignInForm", () => {
  it("renders an accessible password form and retains a local continuation", () => {
    const action = vi.fn() as unknown as SignInAction;

    render(<SignInForm action={action} nextPath="/work-packages/wp-1" />);

    expect(screen.getByLabelText("Email address")).toHaveAttribute(
      "autocomplete",
      "email",
    );
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
    expect(screen.getByDisplayValue("/work-packages/wp-1")).toHaveAttribute(
      "name",
      "nextPath",
    );
    expect(screen.getByRole("button", { name: "Sign in" })).toBeVisible();
    expect(screen.queryByRole("link", { name: /sign up/i })).toBeNull();
  });

  it("shows generic and field errors without redisplaying a password", () => {
    const action = vi.fn() as unknown as SignInAction;

    render(
      <SignInForm
        action={action}
        nextPath="/"
        initialState={{
          status: "error",
          message: "We couldn't sign you in. Check the details and try again.",
          fieldErrors: {
            email: ["Enter a valid email address."],
          },
          email: "leader@example.com",
        }}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "We couldn't sign you in",
    );
    expect(screen.getByText("Enter a valid email address.")).toBeVisible();
    expect(screen.getByLabelText("Email address")).toHaveValue(
      "leader@example.com",
    );
    expect(screen.getByLabelText("Password")).toHaveValue("");
  });
});

describe("AuthStatus", () => {
  it("offers sign in to anonymous visitors", () => {
    render(<AuthStatus actor={null} signOutAction={vi.fn()} />);

    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/sign-in",
    );
  });

  it("shows the demo role and sign-out control to the authenticated actor", () => {
    render(<AuthStatus actor={{ id: "user-1" }} signOutAction={vi.fn()} />);

    expect(screen.getByText("Demo Team Leader")).toBeVisible();
    expect(screen.getByRole("button", { name: "Sign out" })).toBeVisible();
    expect(screen.queryByText("leader@example.com")).toBeNull();
  });
});
