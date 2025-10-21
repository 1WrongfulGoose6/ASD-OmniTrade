describe("getLatestNews", () => {
  const originalKey = process.env.FINNHUB_API_KEY;

  afterAll(() => {
    process.env.FINNHUB_API_KEY = originalKey;
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("returns normalized items for general category", async () => {
    process.env.FINNHUB_API_KEY = "test-key";

    const fetchJsonCachedMock = jest.fn().mockResolvedValue({
      data: [
        {
          id: "g-1",
          headline: "Markets rally on earnings beat",
          summary: "Quarterly profits exceeded expectations.",
          url: "https://news.example.com/story",
          source: "CNBC",
          datetime: 1700000000,
        },
      ],
    });

    const companyMock = jest.fn();
    const errorLogMock = jest.fn();

    jest.doMock("@/lib/mcache", () => ({ fetchJsonCached: fetchJsonCachedMock }));
    jest.doMock("@/lib/market/quotes", () => ({ POPULAR_SYMBOLS: ["AAPL"] }));
    jest.doMock("@/lib/finnhub/news", () => ({ getCompanyNews: companyMock }));
    jest.doMock("@/utils/logger", () => ({ errorLog: errorLogMock }));

    const { getLatestNews } = require("@/lib/server/news");

    const items = await getLatestNews({ category: "general", limit: 1 });

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: "g-1",
      headline: "Markets rally on earnings beat",
      summary: "Quarterly profits exceeded expectations.",
      url: "https://news.example.com/story",
      source: "CNBC",
      datetime: 1700000000,
      category: "general",
    });
    expect(companyMock).not.toHaveBeenCalled();
    expect(fetchJsonCachedMock).toHaveBeenCalledTimes(1);
    expect(errorLogMock).not.toHaveBeenCalled();
  });

  it("aggregates company news per symbol and caches results", async () => {
    process.env.FINNHUB_API_KEY = "test-key";

    const fetchJsonCachedMock = jest.fn().mockResolvedValue({ data: [] });
    const errorLogMock = jest.fn();

    const companyMock = jest
      .fn()
      .mockResolvedValueOnce([
        {
          id: "aaa-1",
          headline: "AAA launches new product",
          summary: "",
          url: "https://news.example.com/aaa",
          source: "Bloomberg",
          datetime: 1700001000,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "bbb-1",
          headline: "BBB beats quarterly targets",
          summary: "",
          url: "https://news.example.com/bbb",
          source: "Reuters",
          datetime: 1700000500,
        },
      ]);

    jest.doMock("@/lib/mcache", () => ({ fetchJsonCached: fetchJsonCachedMock }));
    jest.doMock("@/lib/market/quotes", () => ({ POPULAR_SYMBOLS: ["AAA", "BBB"] }));
    jest.doMock("@/lib/finnhub/news", () => ({ getCompanyNews: companyMock }));
    jest.doMock("@/utils/logger", () => ({ errorLog: errorLogMock }));

    const { getLatestNews } = require("@/lib/server/news");

    const firstPass = await getLatestNews({
      category: "company",
      symbols: ["AAA", "BBB"],
      limit: 6,
      days: 5,
    });
    expect(firstPass).toHaveLength(2);
    expect(firstPass.map((item) => item.symbol)).toEqual(["AAA", "BBB"]);
    expect(companyMock).toHaveBeenCalledTimes(2);

    const secondPass = await getLatestNews({
      category: "company",
      symbols: ["AAA", "BBB"],
      limit: 6,
      days: 5,
    });
    expect(secondPass).toHaveLength(2);
    expect(companyMock).toHaveBeenCalledTimes(2);
    expect(errorLogMock).not.toHaveBeenCalled();
  });
});
