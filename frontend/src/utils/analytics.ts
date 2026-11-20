export function trackEvent(eventName: string, payload?: Record<string, unknown>) {
  try {
    const w = window as any;
    if (typeof w.gtag === "function") {
      w.gtag("event", eventName, payload || {});
    } else if (typeof w.plausible === "function") {
      w.plausible(eventName, { props: payload || {} });
    } else if (import.meta.env.DEV) {
      console.debug("[analytics]", eventName, payload || {});
    }
  } catch {
    // no-op
  }
}
