import type { BuyUgandaBusinessEntry } from "@/types/serviceContent";

type Props = {
  business: BuyUgandaBusinessEntry;
  onView?: () => void;
};

export function BuyUgandaBusinessCard({ business, onView }: Props) {
  return (
    <article className="card bubu-business">
      <div className="bubu-business__media">
        <img src={business.coverImage} alt="" loading="lazy" />
      </div>
      <div className="bubu-business__body">
        <span className="badge badge-gold">{business.tag}</span>
        <h3 className="bubu-business__name">{business.name}</h3>
        <p className="bubu-business__meta">{business.district}</p>
        <p className="bubu-business__summary">{business.summary}</p>
        <p className="bubu-business__products">
          <strong>Products:</strong> {business.products}
        </p>
        <button type="button" className="btn btn-secondary bubu-business__cta" onClick={onView}>
          View catalogue
        </button>
      </div>
    </article>
  );
}