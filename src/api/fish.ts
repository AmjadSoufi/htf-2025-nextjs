export const fetchFishes = async () => {
  // Allow the API base URL to be configured via environment variables.
  // NEXT_PUBLIC_API_URL is available on both server and client; API_URL can be
  // used for server-only configuration if needed.
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "http://localhost:5555";

  const url = `${baseUrl.replace(/\/$/, "")}/api/fish`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Don't crash server rendering — log and return an empty list as a safe fallback.
    // The calling page can decide what to render when no fish are available.
    // This also makes it clearer in logs why the page failed to load fish.
    // eslint-disable-next-line no-console
    console.error("fetchFishes failed:", error);
    return [];
  }
};
