import { Product } from "../context/contextCart"; // Adjust path if needed

export const biskotaMenuData: Product[] = [
  {
    Products: {
      id: 1,
      product_name: "Tiramisu Cinnamon Rolls",
      price: "95.00",
      category: "Cinnamon Rolls",
      avg_rating: 4.8,
    },
    description:
      "Delicious pastry swirled with espresso and cocoa, topped with mascarpone frosting.",
    stock_status: "In Stock",
    review_count: 120,
    quantity: 10,
    avg_rating: 4.8,
    low_stock_threshold: 5,
    images: [
      {
        image_url: "products/tiramisu-cinnamon-rolls.jpg",
        public_key: "tiramisu-key",
      },
    ],
  },
  {
    Products: {
      id: 2,
      product_name: "Dubai Cinnamon Rolls",
      price: "100.00",
      category: "Cinnamon Rolls",
      avg_rating: 4.9,
    },
    description:
      "Warm, gooey cinnamon roll with signature cream cheese frosting.",
    stock_status: "In Stock",
    review_count: 85,
    quantity: 10,
    avg_rating: 4.9,
    low_stock_threshold: 5,
    images: [
      {
        image_url: "products/dubai-cinnamon-rolls.jpg",
        public_key: "dubai-key",
      },
    ],
  },
  {
    Products: {
      id: 3,
      product_name: "Korean Garlic Bun",
      price: "95.00",
      category: "Garlic Buns",
      avg_rating: 4.7,
    },
    description:
      "Soft, buttery bun filled with savory garlic and cheese. A perfect balance of sweet and savory flavors.",
    stock_status: "In Stock",
    review_count: 200,
    quantity: 10,
    avg_rating: 4.7,
    low_stock_threshold: 5,
    images: [
      {
        image_url: "products/korean-garlic-bun.jpg",
        public_key: "korean-garlic-key",
      },
    ],
  },
  {
    Products: {
      id: 4,
      product_name: "Red Velvet Cake in a Cup",
      price: "100.00",
      category: "Cake in a Cup",
      avg_rating: 4.6,
    },
    description:
      "A cake lover’s dream in a convenient cup! Moist red velvet cake layered with cream cheese frosting.",
    stock_status: "In Stock",
    review_count: 45,
    quantity: 10,
    avg_rating: 4.6,
    low_stock_threshold: 5,
    images: [
      {
        image_url: "products/red-velvet-cake-in-a-cup.jpg",
        public_key: "red-velvet-key",
      },
    ],
  },
  {
    Products: {
      id: 5,
      product_name: "Burnt Basque Cheese Cala",
      price: "300.00",
      category: "Bento Sizes",
      avg_rating: 4.5,
    },
    description:
      "Burnt Basque cheesecake with a perfectly caramelized top and creamy interior, served in a convenient cala size.",
    stock_status: "Low Stock",
    review_count: 32,
    quantity: 3,
    avg_rating: 4.5,
    low_stock_threshold: 5,
    images: [
      {
        image_url: "products/burnt-basque-cheese-cala.jpg",
        public_key: "basque-key",
      },
    ],
  },
  {
    Products: {
      id: 6,
      product_name: "Cookies and Cream Cinnamon Rolls",
      price: "95.00",
      category: "Cinnamon Rolls",
      avg_rating: 4.8,
    },
    description:
      "Classic cinnamon rolls topped with crushed cookies and a drizzle of cookies and cream frosting.",
    stock_status: "In Stock",
    review_count: 150,
    quantity: 10,
    avg_rating: 4.8,
    low_stock_threshold: 5,
    images: [
      { image_url: "products/cookies-and-cream.jpg", public_key: "cnc-key" },
    ],
  },
];

export const recommendedProductsData: Product[] = [
  biskotaMenuData[2], // Korean Garlic Bun
  biskotaMenuData[3], // Red Velvet Cake in a Cup
  biskotaMenuData[4], // Burnt Basque Cheese Cala
  biskotaMenuData[5], // Cookies and Cream Cinnamon Rolls
];
