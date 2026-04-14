import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      { source: "/shop", destination: "/tienda", permanent: true },
      { source: "/shop/:path*", destination: "/tienda", permanent: true },
      { source: "/cart", destination: "/carrito", permanent: true },
      { source: "/confirmacion", destination: "/compra/exito", permanent: true },
      {
        source: "/pago-fallido",
        destination: "/compra/rechazada",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
