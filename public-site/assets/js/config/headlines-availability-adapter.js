(() => {
  "use strict";

  const nativeFetch = window.fetch.bind(window);
  const API_HOST = "57z7wwag50.execute-api.us-east-1.amazonaws.com";

  function normalizePayload(payload) {
    if (!payload || typeof payload !== "object") return payload;

    // Handle an API Gateway response whose JSON body is itself serialized.
    if (typeof payload.body === "string") {
      try {
        const nested = JSON.parse(payload.body);
        payload = { ...payload, ...nested };
      } catch {
        // Keep the original payload if body is not serialized JSON.
      }
    }

    const slots = Array.isArray(payload.slots) ? payload.slots : [];
    const grouped = new Map();

    for (const slot of slots) {
      const date = String(slot?.date || "").trim();
      const time = String(slot?.time || "").trim();
      if (!date || !time) continue;
      if (!grouped.has(date)) grouped.set(date, []);
      if (!grouped.get(date).includes(time)) grouped.get(date).push(time);
    }

    const dates = [...grouped.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, times]) => ({
        date,
        times: times.sort((left, right) => left.localeCompare(right))
      }));

    return {
      ...payload,
      success: payload.success !== false,
      slots,
      dates,
      availableDates: dates.map(item => item.date),
      availability: dates,
      nextAvailable: payload.nextAvailable || (slots[0] ? {
        date: slots[0].date,
        time: slots[0].time
      } : null)
    };
  }

  window.HEADLINES_NORMALIZE_AVAILABILITY = normalizePayload;

  window.fetch = async (input, init) => {
    const requestUrl = typeof input === "string" ? input : input?.url || "";
    const response = await nativeFetch(input, init);

    if (!requestUrl.includes(API_HOST) || !requestUrl.includes("/availability/")) {
      return response;
    }

    const rawText = await response.clone().text();
    let rawPayload;
    try {
      rawPayload = JSON.parse(rawText);
    } catch {
      return response;
    }

    const normalized = normalizePayload(rawPayload);
    const headers = new Headers(response.headers);
    headers.set("content-type", "application/json");

    return new Response(JSON.stringify(normalized), {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  };
})();
