// Shared mock service categories.
// Backend-compatible with the future public endpoint: GET /api/services/categories
// Shape: { id, name, description }

export const serviceCategories = [
  {
    id: 1,
    name: "Photography",
    description: "Photography and media coverage services.",
  },
  {
    id: 2,
    name: "Decoration",
    description: "Decoration and floral setup services.",
  },
  {
    id: 3,
    name: "Catering",
    description: "Food, drinks, and hospitality services.",
  },
  {
    id: 4,
    name: "Transportation",
    description: "Cars and transportation services for events.",
  },
  {
    id: 5,
    name: "Music & Entertainment",
    description: "Music, DJ, and entertainment services.",
  },
];

export function getServiceCategoryById(id) {
  return serviceCategories.find((c) => Number(c.id) === Number(id));
}
