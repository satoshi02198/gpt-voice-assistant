export const fetchWithRetry = async (
  url,
  options,
  retries = 3,
  backoff = 1000
) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries === 0) {
      throw error;
    }
    console.log(`Retrying in ${backoff}ms...`);
    await new Promise((resolve) => setTimeout(resolve, backoff));
    return fetchWithRetry(url, options, retries - 1, backoff * 2);
  }
};
