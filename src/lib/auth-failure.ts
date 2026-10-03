export type AuthFailureOperation =
  "sign-in" | "current-actor" | "refresh-session";

export type AuthFailureReporter = (operation: AuthFailureOperation) => void;

export const reportAuthFailure: AuthFailureReporter = (operation) => {
  console.error(
    JSON.stringify({
      event: "auth_operation_failure",
      operation,
    }),
  );
};
