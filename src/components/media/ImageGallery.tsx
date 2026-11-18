import { useState } from "react";
import type { GalleryImage } from "@/types/serviceContent";
import "./ImageGallery.css";

type Props = {
  images: GalleryImage[];
  title?: string;
};

export function ImageGallery({ images, title }: Props) {
  const [active, setActive] = useState<GalleryImage | null>(null);
  const list = images.filter((g) => g.src?.trim());

  if (list.length === 0) return null;

  return (
    <>
      <h2 className="section-title image-gallery__heading">{title ?? "Gallery"}</h2>
      <div className="image-gallery__grid">
        {list.map((img) => (
          <button
            key={img.id}
            type="button"
            className="image-gallery__thumb"
            onClick={() => setActive(img)}
          >
            <img src={img.src} alt={img.caption ?? ""} loading="lazy" />
            {img.caption ? <span className="image-gallery__caption">{img.caption}</span> : null}
          </button>
        ))}
      </div>
      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.caption ?? "Photo"}
          className="image-gallery__lightbox"
          onClick={() => setActive(null)}
        >
          <button type="button" className="image-gallery__close" onClick={() => setActive(null)}>
            Close
          </button>
          <img
            src={active.src}
            alt={active.caption ?? ""}
            className="image-gallery__lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
          {active.caption ? <p className="image-gallery__lightbox-cap">{active.caption}</p> : null}
        </div>
      ) : null}
    </>
  );
}