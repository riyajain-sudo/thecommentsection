export const paginate = (query = {}) => {
  const parsePositive = (value, fallback) => {
    const n = Number(value);
    return Number.isSafeInteger(n) && n > 0 ? n : fallback;
  };
  const limit = Math.min(parsePositive(query.limit, 12), 50);
  const page = Math.min(parsePositive(query.page, 1), 1000);
  return { page, limit, skip: (page - 1) * limit };
};
