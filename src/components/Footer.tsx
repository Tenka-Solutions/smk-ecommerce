import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#3d464d] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <span className="text-[#ffd333] font-bold text-lg">
              Yellow<span className="text-white">Box</span>
            </span>
            <p className="mt-3 text-sm text-white/70 leading-relaxed">
              Soluciones de vending y café automático para empresas en la Región
              del Biobío, Chile.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#ffd333] mb-4">
              Tienda
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/shop?category=vending" className="hover:text-white transition-colors">
                  Máquinas Vending
                </Link>
              </li>
              <li>
                <Link href="/shop?category=cafe" className="hover:text-white transition-colors">
                  Café & Bebidas
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accesorios" className="hover:text-white transition-colors">
                  Accesorios
                </Link>
              </li>
              <li>
                <Link href="/shop?category=servicios" className="hover:text-white transition-colors">
                  Servicios
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#ffd333] mb-4">
              Contacto
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>Región del Biobío, Chile</li>
              <li>
                <a href="mailto:contacto@yellowbox.cl" className="hover:text-white transition-colors">
                  contacto@yellowbox.cl
                </a>
              </li>
              <li>
                <a href="tel:+56912345678" className="hover:text-white transition-colors">
                  +56 9 1234 5678
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-center text-xs text-white/40">
          © {new Date().getFullYear()} Yellow Box. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
