"use client";

interface Props {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export default function QuantitySelector({ quantity, onIncrease, onDecrease }: Props) {
  return (
    <div className="flex items-center border border-[#ced4da] rounded-lg overflow-hidden">
      <button
        onClick={onDecrease}
        className="px-3 py-2 text-[#3d464d] hover:bg-[#f5f5f5] transition-colors font-bold"
        aria-label="Disminuir cantidad"
      >
        −
      </button>
      <span className="px-4 py-2 text-sm font-semibold text-[#3d464d] min-w-[2.5rem] text-center">
        {quantity}
      </span>
      <button
        onClick={onIncrease}
        className="px-3 py-2 text-[#3d464d] hover:bg-[#f5f5f5] transition-colors font-bold"
        aria-label="Aumentar cantidad"
      >
        +
      </button>
    </div>
  );
}
