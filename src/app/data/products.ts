export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  flavor: string;
  weight: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  description: string;
  ingredients: string;
  allergens: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  isLimited?: boolean;
  inStock: boolean;
  stockCount: number;
  tags: string[];
}

export const products: Product[] = [
  {
    id: "p1",
    name: "Noir Intense 85%",
    subtitle: "Single Origin Dark Chocolate",
    price: 450,
    image: "https://images.unsplash.com/photo-1592290321458-49b80f943a26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBkYXJrJTIwY2hvY29sYXRlJTIwcHJlbWl1bSUyMGFydGlzYW58ZW58MXx8fHwxNzg0NjI1MzQwfDA&ixlib=rb-4.1.0&q=80&w=400",
    images: [
      "https://images.unsplash.com/photo-1592290321458-49b80f943a26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBkYXJrJTIwY2hvY29sYXRlJTIwcHJlbWl1bSUyMGFydGlzYW58ZW58MXx8fHwxNzg0NjI1MzQwfDA&ixlib=rb-4.1.0&q=80&w=800",
      "https://images.unsplash.com/photo-1613669146965-507d0e72a688?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBkYXJrJTIwY2hvY29sYXRlJTIwcHJlbWl1bSUyMGFydGlzYW58ZW58MXx8fHwxNzg0NjI1MzQwfDA&ixlib=rb-4.1.0&q=80&w=800",
    ],
    category: "Dark Chocolate",
    flavor: "Dark",
    weight: "100g",
    rating: 4.9,
    reviewCount: 347,
    badge: "Best Seller",
    description: "Our flagship 85% cacao dark chocolate crafted from single-origin beans sourced from the forests of Ecuador. Bold, complex, and extraordinarily smooth — this bar is a testament to the finest chocolate-making traditions.",
    ingredients: "Cacao beans (85%), cane sugar, cocoa butter, vanilla extract",
    allergens: "May contain traces of milk, nuts",
    isBestSeller: true,
    inStock: true,
    stockCount: 45,
    tags: ["dark", "single-origin", "vegan", "intense"],
  },
  {
    id: "p2",
    name: "Hazelnut Praline Collection",
    subtitle: "Artisan Gift Box · 16 Pieces",
    price: 1200,
    originalPrice: 1450,
    image: "https://images.unsplash.com/photo-1548741487-18d363dc4469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBnaWZ0JTIwYm94JTIwbHV4dXJ5JTIwcGFja2FnaW5nfGVufDF8fHx8MTc4NDYyNTM0NXww&ixlib=rb-4.1.0&q=80&w=400",
    images: [
      "https://images.unsplash.com/photo-1548741487-18d363dc4469?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBnaWZ0JTIwYm94JTIwbHV4dXJ5JTIwcGFja2FnaW5nfGVufDF8fHx8MTc4NDYyNTM0NXww&ixlib=rb-4.1.0&q=80&w=800",
      "https://images.unsplash.com/photo-1526081715791-7c538f86060e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxjaG9jb2xhdGUlMjBnaWZ0JTIwYm94JTIwbHV4dXJ5JTIwcGFja2FnaW5nfGVufDF8fHx8MTc4NDYyNTM0NXww&ixlib=rb-4.1.0&q=80&w=800",
    ],
    category: "Gift Boxes",
    flavor: "Mixed",
    weight: "280g",
    rating: 4.8,
    reviewCount: 219,
    badge: "17% Off",
    description: "A curated selection of 16 hand-crafted hazelnut pralines nestled in our signature gift box. Each piece blends roasted Piedmont hazelnuts with rich Belgian milk chocolate for an indulgent experience.",
    ingredients: "Milk chocolate (45%), hazelnuts (30%), sugar, cocoa butter, whole milk powder, soy lecithin, vanilla extract",
    allergens: "Contains milk, hazelnuts, soy. May contain other tree nuts.",
    isBestSeller: true,
    inStock: true,
    stockCount: 28,
    tags: ["gift", "hazelnut", "milk-chocolate", "premium"],
  },
  {
    id: "p3",
    name: "Salted Caramel Truffles",
    subtitle: "Hand-Rolled · Box of 12",
    price: 890,
    image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxoYW5kbWFkZSUyMGNob2NvbGF0ZSUyMHRydWZmbGVzJTIwYm9uYm9uc3xlbnwxfHx8fDE3ODQ2MjUzNDZ8MA&ixlib=rb-4.1.0&q=80&w=400",
    images: [
      "https://images.unsplash.com/photo-1549007994-cb92caebd54b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxoYW5kbWFkZSUyMGNob2NvbGF0ZSUyMHRydWZmbGVzJTIwYm9uYm9uc3xlbnwxfHx8fDE3ODQ2MjUzNDZ8MA&ixlib=rb-4.1.0&q=80&w=800",
      "https://images.unsplash.com/photo-1682120501920-7ce18b00237a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxoYW5kbWFkZSUyMGNob2NvbGF0ZSUyMHRydWZmbGVzJTIwYm9uYm9uc3xlbnwxfHx8fDE3ODQ2MjUzNDZ8MA&ixlib=rb-4.1.0&q=80&w=800",
    ],
    category: "Truffles",
    flavor: "Caramel",
    weight: "180g",
    rating: 4.7,
    reviewCount: 183,
    badge: "New",
    description: "Velvety caramel ganache hand-rolled in dark chocolate and finished with a pinch of Himalayan pink salt. The perfect harmony of sweet, bitter, and salty — a modern classic.",
    ingredients: "Dark chocolate (60%), heavy cream, salted butter, cane sugar, Himalayan pink salt, vanilla extract",
    allergens: "Contains milk, soy. May contain nuts.",
    isNew: true,
    inStock: true,
    stockCount: 52,
    tags: ["truffles", "caramel", "salted", "dark"],
  },
  {
    id: "p4",
    name: "Rose & Raspberry Bonbons",
    subtitle: "Floral Collection · Box of 9",
    price: 750,
    image: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxoYW5kbWFkZSUyMGNob2NvbGF0ZSUyMHRydWZmbGVzJTIwYm9uYm9uc3xlbnwxfHx8fDE3ODQ2MjUzNDZ8MA&ixlib=rb-4.1.0&q=80&w=400",
    images: [
      "https://images.unsplash.com/photo-1481391319762-47dff72954d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxoYW5kbWFkZSUyMGNob2NvbGF0ZSUyMHRydWZmbGVzJTIwYm9uYm9uc3xlbnwxfHx8fDE3ODQ2MjUzNDZ8MA&ixlib=rb-4.1.0&q=80&w=800",
    ],
    category: "Bonbons",
    flavor: "Fruit",
    weight: "135g",
    rating: 4.6,
    reviewCount: 128,
    description: "Delicate dark chocolate shells filled with a luscious rose-infused white chocolate ganache and a burst of fresh raspberry coulis. A refined gift for those who appreciate floral indulgence.",
    ingredients: "Dark chocolate (58%), white chocolate, raspberry purée, heavy cream, rose water, sugar",
    allergens: "Contains milk, soy.",
    isNew: true,
    inStock: true,
    stockCount: 35,
    tags: ["bonbons", "rose", "raspberry", "floral", "gift"],
  },
  {
    id: "p5",
    name: "Signature Collection",
    subtitle: "Premium Gift Box · 24 Pieces",
    price: 2200,
    image: "https://images.unsplash.com/photo-1526081715791-7c538f86060e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxjaG9jb2xhdGUlMjBnaWZ0JTIwYm94JTIwbHV4dXJ5JTIwcGFja2FnaW5nfGVufDF8fHx8MTc4NDYyNTM0NXww&ixlib=rb-4.1.0&q=80&w=400",
    images: [
      "https://images.unsplash.com/photo-1526081715791-7c538f86060e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxjaG9jb2xhdGUlMjBnaWZ0JTIwYm94JTIwbHV4dXJ5JTIwcGFja2FnaW5nfGVufDF8fHx8MTc4NDYyNTM0NXww&ixlib=rb-4.1.0&q=80&w=800",
      "https://images.unsplash.com/photo-1687795097254-f019f9d7fd17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxjaG9jb2xhdGUlMjBnaWZ0JTIwYm94JTIwbHV4dXJ5JTIwcGFja2FnaW5nfGVufDF8fHx8MTc4NDYyNTM0NXww&ixlib=rb-4.1.0&q=80&w=800",
    ],
    category: "Gift Boxes",
    flavor: "Assorted",
    weight: "480g",
    rating: 4.9,
    reviewCount: 412,
    badge: "Most Gifted",
    description: "Our most celebrated collection — 24 masterfully crafted chocolates representing the full spectrum of Khushhal Delight's artistry. From intense dark ganaches to creamy milk pralines, each piece tells a story.",
    ingredients: "Assorted chocolate varieties — see individual flavors inside",
    allergens: "Contains milk, soy, nuts. May contain gluten.",
    isBestSeller: true,
    inStock: true,
    stockCount: 18,
    tags: ["signature", "gift", "assorted", "premium", "bestseller"],
  },
  {
    id: "p6",
    name: "Madagascar 72%",
    subtitle: "Single Origin · Intense & Fruity",
    price: 520,
    image: "https://images.unsplash.com/photo-1523035274455-b2e5c6d5c2e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBkYXJrJTIwY2hvY29sYXRlJTIwcHJlbWl1bSUyMGFydGlzYW58ZW58MXx8fHwxNzg0NjI1MzQwfDA&ixlib=rb-4.1.0&q=80&w=400",
    images: [
      "https://images.unsplash.com/photo-1523035274455-b2e5c6d5c2e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBkYXJrJTIwY2hvY29sYXRlJTIwcHJlbWl1bSUyMGFydGlzYW58ZW58MXx8fHwxNzg0NjI1MzQwfDA&ixlib=rb-4.1.0&q=80&w=800",
    ],
    category: "Dark Chocolate",
    flavor: "Dark",
    weight: "100g",
    rating: 4.8,
    reviewCount: 256,
    description: "Wild cacao harvested from the rainforests of Madagascar delivers an extraordinary chocolate experience — bursting with red fruit notes, a citrusy brightness, and a long, complex finish.",
    ingredients: "Cacao beans (72%), cane sugar, cocoa butter",
    allergens: "May contain traces of milk, nuts. Vegan.",
    inStock: true,
    stockCount: 62,
    tags: ["dark", "single-origin", "vegan", "madagascar", "fruity"],
  },
  {
    id: "p7",
    name: "White Truffle Pearls",
    subtitle: "Luxury White Chocolate · Box of 12",
    price: 1100,
    image: "https://images.unsplash.com/photo-1682120501920-7ce18b00237a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxoYW5kbWFkZSUyMGNob2NvbGF0ZSUyMHRydWZmbGVzJTIwYm9uYm9uc3xlbnwxfHx8fDE3ODQ2MjUzNDZ8MA&ixlib=rb-4.1.0&q=80&w=400",
    images: [
      "https://images.unsplash.com/photo-1682120501920-7ce18b00237a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxoYW5kbWFkZSUyMGNob2NvbGF0ZSUyMHRydWZmbGVzJTIwYm9uYm9uc3xlbnwxfHx8fDE3ODQ2MjUzNDZ8MA&ixlib=rb-4.1.0&q=80&w=800",
    ],
    category: "White Chocolate",
    flavor: "White",
    weight: "180g",
    rating: 4.5,
    reviewCount: 94,
    badge: "Limited",
    description: "Ivory-white chocolate spheres dusted in edible gold, filled with a delicate vanilla bean and Champagne ganache. An ode to celebration and opulence.",
    ingredients: "White chocolate (35%), heavy cream, Champagne reduction, vanilla bean, edible gold dust",
    allergens: "Contains milk, soy. May contain nuts, gluten.",
    isLimited: true,
    inStock: true,
    stockCount: 12,
    tags: ["white", "champagne", "luxury", "limited", "gold"],
  },
  {
    id: "p8",
    name: "Almond & Sea Salt",
    subtitle: "Dark Chocolate Bites · 200g",
    price: 680,
    image: "https://images.unsplash.com/photo-1720029106261-0d0396bb270d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw4fHxsdXh1cnklMjBkYXJrJTIwY2hvY29sYXRlJTIwcHJlbWl1bSUyMGFydGlzYW58ZW58MXx8fHwxNzg0NjI1MzQwfDA&ixlib=rb-4.1.0&q=80&w=400",
    images: [
      "https://images.unsplash.com/photo-1720029106261-0d0396bb270d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw4fHxsdXh1cnklMjBkYXJrJTIwY2hvY29sYXRlJTIwcHJlbWl1bSUyMGFydGlzYW58ZW58MXx8fHwxNzg0NjI1MzQwfDA&ixlib=rb-4.1.0&q=80&w=800",
    ],
    category: "Chocolate Bites",
    flavor: "Nutty",
    weight: "200g",
    rating: 4.7,
    reviewCount: 167,
    description: "Whole roasted California almonds enrobed in 70% dark chocolate, finished with a sprinkle of fleur de sel. Snackable luxury — impossible to stop at one.",
    ingredients: "Dark chocolate (70%), almonds (25%), sugar, cocoa butter, sea salt",
    allergens: "Contains almonds. May contain other tree nuts, milk.",
    isBestSeller: true,
    inStock: true,
    stockCount: 87,
    tags: ["almonds", "dark", "sea-salt", "bites", "snack"],
  },
  {
    id: "p9",
    name: "Festive Grand Box",
    subtitle: "Celebration Collection · 32 Pieces",
    price: 3500,
    image: "https://images.unsplash.com/photo-1687795097254-f019f9d7fd17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxjaG9jb2xhdGUlMjBnaWZ0JTIwYm94JTIwbHV4dXJ5JTIwcGFja2FnaW5nfGVufDF8fHx8MTc4NDYyNTM0NXww&ixlib=rb-4.1.0&q=80&w=400",
    images: [
      "https://images.unsplash.com/photo-1687795097254-f019f9d7fd17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxjaG9jb2xhdGUlMjBnaWZ0JTIwYm94JTIwbHV4dXJ5JTIwcGFja2FnaW5nfGVufDF8fHx8MTc4NDYyNTM0NXww&ixlib=rb-4.1.0&q=80&w=800",
    ],
    category: "Gift Boxes",
    flavor: "Assorted",
    weight: "640g",
    rating: 5.0,
    reviewCount: 88,
    badge: "Festive",
    description: "The ultimate celebration gift — 32 individually wrapped chocolates in our grand silk-lined box, accompanied by a personalized message card and premium gift wrapping. Perfect for Diwali, weddings, and corporate events.",
    ingredients: "Assorted premium chocolates — dark, milk, and white varieties",
    allergens: "Contains milk, soy, nuts. May contain gluten.",
    isLimited: true,
    inStock: true,
    stockCount: 8,
    tags: ["festive", "diwali", "corporate", "premium", "32-piece"],
  },
  {
    id: "p10",
    name: "Mint Dark Elegance",
    subtitle: "Dark Chocolate with Fresh Mint",
    price: 380,
    image: "https://images.unsplash.com/photo-1623000850293-0cbbc517c719?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxsdXh1cnklMjBkYXJrJTIwY2hvY29sYXRlJTIwcHJlbWl1bSUyMGFydGlzYW58ZW58MXx8fHwxNzg0NjI1MzQwfDA&ixlib=rb-4.1.0&q=80&w=400",
    images: [
      "https://images.unsplash.com/photo-1623000850293-0cbbc517c719?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw3fHxsdXh1cnklMjBkYXJrJTIwY2hvY29sYXRlJTIwcHJlbWl1bSUyMGFydGlzYW58ZW58MXx8fHwxNzg0NjI1MzQwfDA&ixlib=rb-4.1.0&q=80&w=800",
    ],
    category: "Dark Chocolate",
    flavor: "Mint",
    weight: "100g",
    rating: 4.5,
    reviewCount: 142,
    description: "Cool, refreshing peppermint oil meets our 70% dark chocolate base in perfect equilibrium. Clean, bold, and unexpectedly elegant — a bar that redefines mint chocolate.",
    ingredients: "Cacao beans (70%), cane sugar, cocoa butter, peppermint oil",
    allergens: "May contain traces of milk, nuts. Vegan.",
    inStock: true,
    stockCount: 73,
    tags: ["dark", "mint", "vegan", "refreshing"],
  },
  {
    id: "p11",
    name: "Passion Fruit Noir",
    subtitle: "Dark Truffles with Tropical Twist · 6 Pieces",
    price: 650,
    image: "https://images.unsplash.com/photo-1542843137-8791a6904d14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxsdXh1cnklMjBkYXJrJTIwY2hvY29sYXRlJTIwcHJlbWl1bSUyMGFydGlzYW58ZW58MXx8fHwxNzg0NjI1MzQwfDA&ixlib=rb-4.1.0&q=80&w=400",
    images: [
      "https://images.unsplash.com/photo-1542843137-8791a6904d14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxsdXh1cnklMjBkYXJrJTIwY2hvY29sYXRlJTIwcHJlbWl1bSUyMGFydGlzYW58ZW58MXx8fHwxNzg0NjI1MzQwfDA&ixlib=rb-4.1.0&q=80&w=800",
    ],
    category: "Truffles",
    flavor: "Tropical",
    weight: "90g",
    rating: 4.6,
    reviewCount: 79,
    badge: "New",
    description: "Six exquisite dark chocolate truffles filled with a vibrant passion fruit ganache. An exotic journey between the tropics and Belgium's finest chocolate traditions.",
    ingredients: "Dark chocolate (65%), passion fruit purée, heavy cream, sugar, cocoa butter",
    allergens: "Contains milk, soy.",
    isNew: true,
    inStock: true,
    stockCount: 41,
    tags: ["truffles", "tropical", "passion-fruit", "dark", "exotic"],
  },
  {
    id: "p12",
    name: "Corporate Elite Box",
    subtitle: "Premium Corporate Gift · 32 Pieces",
    price: 3800,
    image: "https://images.unsplash.com/photo-1573013792262-761a3e17fb39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxjaG9jb2xhdGUlMjBnaWZ0JTIwYm94JTIwbHV4dXJ5JTIwcGFja2FnaW5nfGVufDF8fHx8MTc4NDYyNTM0NXww&ixlib=rb-4.1.0&q=80&w=400",
    images: [
      "https://images.unsplash.com/photo-1573013792262-761a3e17fb39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxjaG9jb2xhdGUlMjBnaWZ0JTIwYm94JTIwbHV4dXJ5JTIwcGFja2FnaW5nfGVufDF8fHx8MTc4NDYyNTM0NXww&ixlib=rb-4.1.0&q=80&w=800",
    ],
    category: "Corporate",
    flavor: "Assorted",
    weight: "640g",
    rating: 4.9,
    reviewCount: 54,
    description: "Impress clients and employees with our bespoke corporate gift box. Customizable branding on the lid, selection of 32 premium chocolates, and a handwritten message card. Minimum order: 10 boxes.",
    ingredients: "Assorted premium chocolates — see insert card for full ingredient details",
    allergens: "Contains milk, soy, nuts. May contain gluten.",
    inStock: true,
    stockCount: 200,
    tags: ["corporate", "bulk", "branded", "premium", "gifting"],
  },
];

export const categories = ["All", "Dark Chocolate", "Milk Chocolate", "White Chocolate", "Truffles", "Bonbons", "Gift Boxes", "Chocolate Bites", "Corporate"];

export const flavors = ["All", "Dark", "Milk", "White", "Caramel", "Mint", "Nutty", "Fruit", "Tropical", "Assorted", "Mixed"];

export const getProductById = (id: string) => products.find((p) => p.id === id);

export const getFeaturedProducts = () => products.filter((p) => p.isBestSeller || p.isNew).slice(0, 8);

export const getBestSellers = () => products.filter((p) => p.isBestSeller);

export const getNewArrivals = () => products.filter((p) => p.isNew);
