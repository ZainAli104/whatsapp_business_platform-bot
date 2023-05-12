export const productCategories = [
  {
    id: "1",
    name: "Electronics",
    products: [
      { id: "1", name: "Smartphone" },
      { id: "2", name: "Laptop" },
      { id: "3", name: "Television" },
    ],
  },
  {
    id: "2",
    name: "Clothing",
    products: [
      { id: "1", name: "Shirt" },
      { id: "2", name: "Pants" },
      { id: "3", name: "Dress" },
    ],
  },
  {
    id: "3",
    name: "Food",
    products: [
      { id: "1", name: "Pizza" },
      { id: "2", name: "Burger" },
      { id: "3", name: "Salad" },
    ],
  },
  {
    id: "4",
    name: "Furniture",
    products: [
      { id: "1", name: "Sofa" },
      { id: "2", name: "Bed" },
      { id: "3", name: "Table" },
    ],
  },
];

export function getCategory(id) {
  return productCategories.find((category) => category.id === id);
}

export function getProduct(categoryId, productId) {
  const category = getCategory(categoryId);
  return category.products.find((product) => product.id === productId);
}

