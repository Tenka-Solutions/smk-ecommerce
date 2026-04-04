"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const params = new URLSearchParams(searchParams.toString());
      if (e.target.value) {
        params.set("q", e.target.value);
      } else {
        params.delete("q");
      }
      startTransition(() => {
        router.replace(`/shop?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  return (
    <div className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6c757d]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="search"
        defaultValue={searchParams.get("q") ?? ""}
        onChange={handleChange}
        placeholder="Buscar productos..."
        className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#ced4da] rounded-lg focus:outline-none focus:border-[#ffd333] focus:ring-2 focus:ring-[#ffd333]/25 transition bg-white"
      />
    </div>
  );
}
