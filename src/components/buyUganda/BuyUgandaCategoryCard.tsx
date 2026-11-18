import type { BuyUgandaCategoryEntry } from "@/types/serviceContent";

type Props = {
  category: BuyUgandaCategoryEntry;
  active?: boolean;
  onSelect?: () => void;
};

export function BuyUgandaCategoryCard({ category, active, onSelect }: Props) {
  return (
    <button
      type="button"
      className={`bubu-category${active ? " bubu-category--active" : ""}`}
      onClick={onSelect}
    >
      <div className="bubu-category__media">
        <img src={category.coverImage} alt="" loading="lazy" />
        <span className="bubu-category__badge">{category.name}</span>
      </div>
      <div className="bubu-category__body">
        <p className="bubu-category__tagline">{category.tagline}</p>
        <p className="bubu-category__examples">{category.examples}</p>
      </div>
    </button>
  );
}