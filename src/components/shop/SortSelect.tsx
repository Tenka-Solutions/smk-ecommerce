"use client";

import { useRouter, useSearchParams } from "next/navigation";

const options = [
  { value: "", label: "Relevancia" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "name", label: "Nombre A–Z" },
];

export default function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("sort", e.target.value);
    } else {
      params.delete("sort");
    }
    router.replace(`/shop?${params.toString()}`);
  }

  return (
    <select
      defaultValue={searchParams.get("sort") ?? ""}
      onChange={handleChange}
      className="text-sm border border-[#ced4da] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#ffd333] bg-white text-[#3d464d] cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
