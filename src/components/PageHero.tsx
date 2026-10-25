type Props = {
  src: string;
  alt: string;
  /** Optional caption below image inside frame */
  caption?: string;
};

export function PageHero({ src, alt, caption }: Props) {
  return (
    <figure className="page-hero">
      <div className="page-hero__frame">
        <img src={src} alt={alt} className="page-hero__img" loading="eager" />
      </div>
      {caption ? <figcaption className="page-hero__caption">{caption}</figcaption> : null}
    </figure>
  );
}
