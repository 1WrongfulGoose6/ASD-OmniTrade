const fetchTradeBacklog = async () => {
  try {
    const res = await fetch(`/api/tradeBacklog`);
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching trade backlog:", error);
    return { data: null, error };
  }
};

export default fetchTradeBacklog;
