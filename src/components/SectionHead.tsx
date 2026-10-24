type Props = {
  title: string;
  subtitle?: string;
};

/** Section heading with gold accent bar — use on Home and list pages */
export function SectionHead({ title, subtitle }: Props) {
  return (
    <div className="section-head-block">
      <div className="section-head">
        <h2 className="section-title">{title}</h2>
      </div>
      {subtitle ? <p className="section-sub">{subtitle}</p> : null}
    </div>
  );
}
