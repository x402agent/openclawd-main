// Sentry client-side initialization for ClawdHub
// Should be imported in AppProviders.tsx before the app renders

import * as Sentry from "@sentry/browser";

let initialized = false;

function sentryDsn(): string {
	if (
		typeof import.meta !== "undefined" &&
		(import.meta as { env?: Record<string, string> }).env?.VITE_SENTRY_DSN
	) {
		return (import.meta as { env?: Record<string, string> }).env!
			.VITE_SENTRY_DSN!;
	}
	return "";
}

function isEnabled(): boolean {
	return sentryDsn().length > 0;
}

export function initSentryClient() {
	if (initialized || !isEnabled()) return;
	initialized = true;

	const dsn = sentryDsn();
	const environment =
		import.meta?.env?.VITE_SENTRY_ENVIRONMENT ||
		(import.meta as { env: Record<string, string> }).env?.NODE_ENV ||
		"production";

	Sentry.init({
		dsn,
		environment,
		integrations: [Sentry.browserTracingIntegration()],
		tracesSampleRate: Number(
			import.meta?.env?.VITE_SENTRY_TRACES_SAMPLE_RATE ?? "0.1",
		),
		// Don't send PII by default
		sendDefaultPii: false,
		// Source maps for better stack traces
		enableTracing: false,
	});

	// Global error handler
	window.addEventListener("error", (event) => {
		// Ignore browser extension errors
		if (
			event.filename?.includes("chrome-extension") ||
			event.filename?.includes("moz-extension")
		) {
			return;
		}
		Sentry.captureException(event.error, {
			extra: {
				message: event.message,
				filename: event.filename,
				lineno: event.lineno,
				colno: event.colno,
			},
		});
	});

	// Unhandled promise rejections
	window.addEventListener("unhandledrejection", (event) => {
		Sentry.captureException(event.reason, {
			extra: {
				type: "unhandledrejection",
			},
		});
	});
}

export function setUserContext(userId: string, email?: string) {
	Sentry.setUser({ id: userId, email });
}

export function clearUserContext() {
	Sentry.setUser(null);
}

export { Sentry };
