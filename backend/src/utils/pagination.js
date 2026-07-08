const getPagination = (query, defaults = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defaults.limit || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.max(Math.ceil(total / limit), 1),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

module.exports = { getPagination, buildMeta };
