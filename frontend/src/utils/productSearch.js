export function getMatchingProducts(products, query) {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) return [];

  return products.filter((product) => {
    const haystack = [product.name, product.category, product.unit]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(trimmed);
  });
}
