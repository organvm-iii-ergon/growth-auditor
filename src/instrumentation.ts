export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../.config/sentry/sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../.config/sentry/sentry.edge.config");
  }
}

export const onRequestError = async (...args: unknown[]) => {
  const Sentry = await import("@sentry/nextjs");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (Sentry as any).captureRequestError?.(...args);
};
