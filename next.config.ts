import type { NextConfig } from "next";

type ImageRemotePattern = NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
>[number];

function getSupabaseImageRemotePatterns(): ImageRemotePattern[] {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return [];
  }

  try {
    const url = new URL(supabaseUrl);
    const protocol = url.protocol.replace(":", "");

    if (protocol !== "http" && protocol !== "https") {
      return [];
    }

    return [
      {
        protocol,
        hostname: url.hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];
const imageRemotePatterns = getSupabaseImageRemotePatterns();

const nextConfig: NextConfig = {
  ...(imageRemotePatterns.length
    ? {
        images: {
          remotePatterns: imageRemotePatterns,
        },
      }
    : {}),
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
