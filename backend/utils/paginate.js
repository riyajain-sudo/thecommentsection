// Shared pagination helper: reads page/limit off a request's query string
// and returns them alongside the corresponding skip offset.
export const paginate = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 12, 1), 50);
  return { page, limit, skip: (page - 1) * limit };
};
