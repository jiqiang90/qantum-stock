import { z } from "zod";

const signInInputSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Enter a valid email address." })),
  password: z
    .string()
    .max(256)
    .refine((value) => value.trim().length > 0, "Enter your password."),
  nextPath: z.string().optional(),
});

export type SignInInput = {
  readonly email: string;
  readonly password: string;
  readonly nextPath: string;
};

export type SignInInputResult =
  | { readonly success: true; readonly data: SignInInput }
  | {
      readonly success: false;
      readonly fieldErrors: Partial<
        Record<"email" | "password", readonly string[]>
      >;
    };

export function parseSignInInput(input: unknown): SignInInputResult {
  const result = signInInputSchema.safeParse(input);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;

    return {
      success: false,
      fieldErrors: {
        ...(errors.email === undefined ? {} : { email: errors.email }),
        ...(errors.password === undefined ? {} : { password: errors.password }),
      },
    };
  }

  return {
    success: true,
    data: {
      email: result.data.email,
      password: result.data.password,
      nextPath: parseSignInNextPath(result.data.nextPath),
    },
  };
}

export function parseSignInNextPath(value: unknown): string {
  return typeof value === "string" &&
    value.length <= 2_048 &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\") &&
    !/[\u0000-\u001f\u007f]/u.test(value)
    ? value
    : "/";
}
