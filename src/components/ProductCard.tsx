"use client";

import Link from "next/link";
import { Product, formatPrice, getCategoryLabel, getCategoryIcon } from "@/lib/products";
import AddToCartButton from "@/components/AddToCartButton";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
      <div className="relative bg-[#f5f5f5] h-52 flex items-center justify-center overflow-hidden">
        {product.badge && (
          <span className="absolute top-3 left-3 bg-[#ffd333] text-[#3d464d] text-xs font-bold px-2 py-1 rounded-full">
            {product.badge}
          </span>
        )}
        <span className="text-6xl">{getCategoryIcon(product.category)}</span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-[#6c757d] uppercase tracking-wide mb-1 font-medium">
          {getCategoryLabel(product.category)}
        </p>
        <h3 className="text-[#3d464d] font-semibold text-base leading-snug mb-2 group-hover:text-[#ffd333] transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-[#6c757d] line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>
        <div className="flex items-center justify-between gap-2 mt-auto">
          <span className="text-[#3d464d] font-bold text-lg shrink-0">
            {formatPrice(product.price)}
          </span>
          <div className="flex gap-2">
            <AddToCartButton
              product={product}
              className="bg-[#ffd333] hover:bg-[#e6be2e] text-[#3d464d] text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
            />
            <Link
              href={`/shop/${product.id}`}
              className="border border-[#3d464d] text-[#3d464d] hover:bg-[#3d464d] hover:text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              Ver más
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
