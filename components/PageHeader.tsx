export function PageHeader({
  label,
  title,
  intro
}: {
  label: string;
  title: string;
  intro: string;
}) {
  return (
    <header>
      <div className="pageLabel">{label}</div>
      <h1 className="pageTitle">{title}</h1>
      <p className="pageSub">{intro}</p>
    </header>
  );
}
