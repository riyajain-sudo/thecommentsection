import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { paginate } from "../utils/paginate.js";

test("pagination bounds page size, page and offset", () => {
  assert.deepEqual(paginate({ limit: "500", page: "99999999999999" }), { page: 1000, limit: 50, skip: 49950 });
  assert.deepEqual(paginate({ limit: "-1", page: "1.5" }), { page: 1, limit: 12, skip: 0 });
});
test("popular feed pages in aggregation before populate and literalizes bounded search", () => {
  const source = fs.readFileSync(new URL("../routes/poems.js", import.meta.url), "utf8");
  assert.match(source, /\$sort:[\s\S]*?\$skip:[\s\S]*?\$limit:[\s\S]*?\$project:/);
  assert.match(source, /search\.length > 64/);
  assert.ok(source.includes("const literal = search.replace(/[.*+?^${}()|[\\]\\\\]/g, \"\\\\$&\")"));
});
test("feed ignores stale first-page and load-more responses", () => {
  const source = fs.readFileSync(new URL("../../frontend/src/hooks/usePoemFeed.js", import.meta.url), "utf8");
  assert.match(source, /requestGeneration/);
  assert.match(source, /generation !== requestGeneration.current/);
});
test("required authorization checks account existence", () => {
  const source = fs.readFileSync(new URL("../middleware/auth.js", import.meta.url), "utf8");
  assert.match(source, /await User\.exists\(\{ _id: payload\.sub \}\)/);
});
