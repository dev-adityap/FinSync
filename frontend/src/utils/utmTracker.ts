export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
}

export function captureUtm(): UtmParams {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const data: UtmParams = {};
    (["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const).forEach((key) => {
      const val = params.get(key);
      if (val) data[key] = val;
    });
    if (document.referrer) data.referrer = document.referrer;
    if (Object.keys(data).length > 0) {
      sessionStorage.setItem("finsync_utm", JSON.stringify(data));
    }
    const stored = sessionStorage.getItem("finsync_utm");
    return stored ? JSON.parse(stored) : data;
  } catch {
    return {};
  }
}

export function getStoredUtm(): UtmParams {
  if (typeof window === "undefined") return {};
  try {
    const stored = sessionStorage.getItem("finsync_utm");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}
