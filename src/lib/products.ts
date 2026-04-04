export type Category = "vending" | "cafe" | "accesorios" | "servicios";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: Category;
  featured?: boolean;
  badge?: string;
}

export const categories: { slug: Category; label: string; icon: string }[] = [
  { slug: "vending", label: "Máquinas Vending", icon: "🏪" },
  { slug: "cafe", label: "Café & Bebidas", icon: "☕" },
  { slug: "accesorios", label: "Accesorios", icon: "🛠️" },
  { slug: "servicios", label: "Servicios", icon: "🔧" },
];

export const products: Product[] = [
  {
    id: "vm-001",
    name: "Máquina Vending Snacks Pro",
    description:
      "Máquina expendedora de snacks y bebidas con pantalla táctil, pago con QR y tarjeta.",
    price: 2490000,
    image: "/images/products/vending-snacks.jpg",
    category: "vending",
    featured: true,
    badge: "Más vendido",
  },
  {
    id: "vm-002",
    name: "Máquina Vending Café Automática",
    description:
      "Cafetera automática profesional con 12 bebidas, molinillo integrado y pantalla intuitiva.",
    price: 1890000,
    image: "/images/products/vending-cafe.jpg",
    category: "vending",
    featured: true,
  },
  {
    id: "vm-003",
    name: "Máquina Vending Refrigerada",
    description:
      "Máquina refrigerada para bebidas frías, agua y jugos. Ideal para oficinas y gimnasios.",
    price: 1650000,
    image: "/images/products/vending-frio.jpg",
    category: "vending",
  },
  {
    id: "cf-001",
    name: "Café Mokador Espresso 1kg",
    description:
      "Blend premium de espresso con notas de chocolate y avellana. Molido para máquina automática.",
    price: 18900,
    image: "/images/products/cafe-mokador.jpg",
    category: "cafe",
    featured: true,
    badge: "Nuevo",
  },
  {
    id: "cf-002",
    name: "Café Laqtia Blend Suave 500g",
    description:
      "Mezcla suave con notas afrutadas, perfecta para americano y cappuccino.",
    price: 11500,
    image: "/images/products/cafe-laqtia.jpg",
    category: "cafe",
  },
  {
    id: "cf-003",
    name: "Cápsulas Compatibles x50",
    description:
      "Cápsulas compatibles con máquinas Nespresso. Variedad: espresso, lungo, ristretto.",
    price: 8900,
    image: "/images/products/capsulas.jpg",
    category: "cafe",
  },
  {
    id: "ac-001",
    name: "Kit Limpieza Cafetera",
    description:
      "Pastillas descalcificadoras, cepillos y paños microfibra para mantenimiento mensual.",
    price: 4900,
    image: "/images/products/kit-limpieza.jpg",
    category: "accesorios",
  },
  {
    id: "ac-002",
    name: "Vasos Térmicos Personalizados x100",
    description:
      "Vasos de papel térmico con tu logo. Ideal para vending y puntos de atención.",
    price: 12900,
    image: "/images/products/vasos.jpg",
    category: "accesorios",
  },
  {
    id: "sv-001",
    name: "Plan Mantenimiento Mensual",
    description:
      "Visita técnica mensual, limpieza profunda, calibración y revisión preventiva.",
    price: 39900,
    image: "/images/products/mantenimiento.jpg",
    category: "servicios",
    badge: "Recomendado",
  },
];

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getProductsByCategory(category: Category): Product[] {
  return products.filter((p) => p.category === category);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(price);
}

export function getCategoryLabel(category: Category): string {
  switch (category) {
    case "vending": return "Máquinas Vending";
    case "cafe": return "Café & Bebidas";
    case "accesorios": return "Accesorios";
    case "servicios": return "Servicios";
  }
}

export function getCategoryIcon(category: Category): string {
  switch (category) {
    case "vending": return "🏪";
    case "cafe": return "☕";
    case "accesorios": return "🛠️";
    case "servicios": return "🔧";
  }
}

export function searchProducts(
  query: string,
  category?: Category,
  sort?: string
): Product[] {
  let result = [...products];

  if (category) {
    result = result.filter((p) => p.category === category);
  }

  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
  else if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));

  return result;
}
