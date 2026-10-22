export default function ConceptBadge({ company, className }: { company: string; className?: string }) {
  return (
    <div className={className} data-badge="">
      <i />
      Unsolicited concept for {company} · not affiliated
      <a href="/">By David Adebayo ↗</a>
    </div>
  );
}
