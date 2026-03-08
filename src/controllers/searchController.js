const { Client } = require("@elastic/elasticsearch");
const { getRedis } = require("../../../../shared/config/redis");
const asyncHandler = require("../../../../shared/utils/asyncHandler");
const { success, paginated } = require("../../../../shared/utils/response");

const es = new Client({ node: process.env.ES_URL || "http://localhost:9200" });
const INDEX = "parts";

// ── GET /search?q=&make=&model=&year=&brand=&category=&minPrice=&maxPrice=&page=&limit= ──
exports.search = asyncHandler(async (req, res) => {
  const {
    q = "",
    make,
    model,
    year,
    brand,
    category,
    minPrice,
    maxPrice,
    inStock,
    partType,
    sortBy = "relevance",
    page = 1,
    limit = 20,
  } = req.query;
  const cacheKey = `search:${JSON.stringify(req.query)}`;

  try {
    const cached = await getRedis().get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));
  } catch (_) {}

  const must = [];
  const filter = [];

  if (q) {
    must.push({
      multi_match: {
        query: q,
        fuzziness: "AUTO",
        type: "best_fields",
        fields: ["name^3", "oemNumber^3", "sku^2", "description", "tags"],
      },
    });
  } else {
    must.push({ match_all: {} });
  }

  if (make) filter.push({ term: { "compatibility.make.keyword": make } });
  if (model) filter.push({ term: { "compatibility.model.keyword": model } });
  if (year)
    filter.push({
      range: {
        "compatibility.yearFrom": { lte: Number(year) },
        "compatibility.yearTo": { gte: Number(year) },
      },
    });
  if (brand) filter.push({ term: { "brand.keyword": brand } });
  if (category) filter.push({ term: { "categoryId.keyword": category } });
  if (inStock === "true") filter.push({ range: { stock: { gt: 0 } } });
  if (partType) filter.push({ term: { partType: partType } });
  if (minPrice || maxPrice) {
    const range = {};
    if (minPrice) range.gte = Number(minPrice);
    if (maxPrice) range.lte = Number(maxPrice);
    filter.push({ range: { price: range } });
  }

  const sortOptions = {
    relevance: [{ _score: "desc" }],
    price_asc: [{ price: "asc" }],
    price_desc: [{ price: "desc" }],
    rating: [{ rating: "desc" }],
    popular: [{ soldCount: "desc" }],
  };
  const sort = sortOptions[sortBy] || sortOptions.relevance;
  const from = (Number(page) - 1) * Number(limit);

  const result = await es.search({
    index: INDEX,
    from,
    size: Number(limit),
    query: { bool: { must, filter } },
    sort,
    aggs: {
      brands: { terms: { field: "brand.keyword", size: 20 } },
      categories: { terms: { field: "categoryName.keyword", size: 20 } },
      priceRange: { stats: { field: "price" } },
    },
  });

  const hits = result.hits.hits.map((h) => ({
    id: h._id,
    ...h._source,
    score: h._score,
  }));
  const total = result.hits.total.value;
  const facets = {
    brands: result.aggregations?.brands?.buckets,
    categories: result.aggregations?.categories?.buckets,
    priceRange: result.aggregations?.priceRange,
  };

  const response = {
    success: true,
    data: hits,
    facets,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      hasMore: from + hits.length < total,
    },
  };

  try {
    await getRedis().setEx(cacheKey, 600, JSON.stringify(response));
  } catch (_) {}

  return res.json(response);
});

// ── GET /search/suggestions?q= ────────────────────────────────
exports.suggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return success(res, { suggestions: [] });

  const result = await es.search({
    index: INDEX,
    size: 8,
    query: {
      multi_match: {
        query: q,
        type: "bool_prefix",
        fields: ["name", "name._2gram", "name._3gram"],
      },
    },
    _source: ["name", "sku", "brand"],
  });

  const suggestions = result.hits.hits.map((h) => ({
    id: h._id,
    name: h._source.name,
    sku: h._source.sku,
    brand: h._source.brand,
  }));
  return success(res, { suggestions });
});

// ── POST /search/index (internal — sync from catalog) ─────────
exports.indexPart = asyncHandler(async (req, res) => {
  const part = req.body;
  await es.index({ index: INDEX, id: part._id, document: part });
  return success(res, {}, "Part indexed");
});

// ── DELETE /search/index/:id (internal) ──────────────────────
exports.removePart = asyncHandler(async (req, res) => {
  await es.delete({ index: INDEX, id: req.params.id }).catch(() => {});
  return success(res, {}, "Part removed from index");
});

// ── Ensure ES index exists with mapping ───────────────────────
exports.initIndex = async () => {
  const exists = await es.indices.exists({ index: INDEX });
  if (!exists) {
    await es.indices.create({
      index: INDEX,
      mappings: {
        properties: {
          name: {
            type: "text",
            analyzer: "standard",
            fields: {
              keyword: { type: "keyword" },
              _2gram: { type: "text", analyzer: "index_prefix" },
              _3gram: { type: "text", analyzer: "index_prefix" },
            },
          },
          sku: { type: "keyword" },
          oemNumber: { type: "keyword" },
          description: { type: "text" },
          brand: { type: "text", fields: { keyword: { type: "keyword" } } },
          categoryName: {
            type: "text",
            fields: { keyword: { type: "keyword" } },
          },
          categoryId: { type: "keyword" },
          price: { type: "float" },
          mrp: { type: "float" },
          stock: { type: "integer" },
          rating: { type: "float" },
          soldCount: { type: "integer" },
          tags: { type: "keyword" },
          images: { type: "keyword", index: false },
          compatibility: {
            type: "nested",
            properties: {
              make: { type: "text", fields: { keyword: { type: "keyword" } } },
              model: { type: "text", fields: { keyword: { type: "keyword" } } },
              yearFrom: { type: "integer" },
              yearTo: { type: "integer" },
            },
          },
        },
      },
    });
    console.log("✅ Elasticsearch index created");
  }
};
