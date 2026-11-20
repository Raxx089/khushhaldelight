import { useEffect, useState } from "react";
import { products as seededProducts, type Product } from "../data/products";
import { getSupabaseClient, hasSupabaseConfig } from "../lib/supabase";

interface CatalogRow {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  category: string;
  flavor: string;
  weight: string;
  image_url: string;
  ingredients: string;
  allergens: string;
  unit_price_paise: number;
  inventory: { available: number; reserved: number } | null;
}

function withoutUnverifiedStock(product: Product): Product {
  return { ...product, inStock: false, stockCount: 0, originalPrice: undefined };
}

function mapCatalogProduct(row: CatalogRow): Product {
  const existing = seededProducts.find((product) => product.id === row.id);
  const stockCount = Math.max(0, (row.inventory?.available ?? 0) - (row.inventory?.reserved ?? 0));
  const name = row.name || existing?.name || row.id;
  return {
    ...(existing ? withoutUnverifiedStock(existing) : {
      id: row.id,
      name,
      subtitle: "",
      image: "",
      images: [],
      category: "Chocolate",
      flavor: "",
      weight: "",
      rating: 0,
      reviewCount: 0,
      description: "",
      ingredients: "",
      allergens: "",
      isNew: false,
      isBestSeller: false,
      isLimited: false,
      tags: [],
    }),
    id: row.id,
    name,
    subtitle: row.subtitle,
    price: row.unit_price_paise / 100,
    originalPrice: undefined,
    badge: existing?.badge?.includes("%") ? undefined : existing?.badge,
    image: row.image_url || existing?.image || "",
    images: row.image_url ? [row.image_url, ...(existing?.images.slice(1) ?? [])] : (existing?.images ?? []),
    category: row.category,
    flavor: row.flavor,
    weight: row.weight,
    description: row.description,
    ingredients: row.ingredients,
    allergens: row.allergens,
    inStock: stockCount > 0,
    stockCount,
  };
}

export function useCatalogProducts() {
  const [catalog, setCatalog] = useState<Product[]>(seededProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    if (!hasSupabaseConfig()) {
      setCatalog(seededProducts);
      setError("");
      setLoading(false);
      return () => { active = false; };
    }

    Promise.resolve().then(() => getSupabaseClient().from("products")
      .select("id,name,subtitle,description,category,flavor,weight,image_url,ingredients,allergens,unit_price_paise,inventory(available,reserved)")
      .eq("is_active", true)
      .order("name"))
      .then(({ data, error: queryError }) => {
        if (!active) return;
        if (queryError) throw queryError;

        const liveProducts = ((data ?? []) as CatalogRow[]).map(mapCatalogProduct);
        setCatalog(liveProducts.length > 0 ? liveProducts : seededProducts);
        setError("");
      })
      .catch((cause) => {
        if (!active) return;
        setCatalog(seededProducts);
        setError(cause instanceof Error ? cause.message : "Could not load live catalog data.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return { products: catalog, loading, error };
}
