import Image from "next/image";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  return (
    <div className="grid gap-4">
      <div className="surface-card relative aspect-[4/3] overflow-hidden rounded-[2rem]">
        <Image
          src={images[0]}
          alt={name}
          fill
          sizes="(min-width: 1024px) 36rem, 100vw"
          className="object-contain p-8"
        />
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-3 gap-3">
          {images.slice(1).map((image) => (
            <div
              key={image}
              className="surface-card relative aspect-square overflow-hidden rounded-[1.4rem]"
            >
              <Image
                src={image}
                alt={name}
                fill
                sizes="160px"
                className="object-contain p-4"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
