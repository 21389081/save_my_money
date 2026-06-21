export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-7 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-bold tracking-[-0.035em] sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 text-sm leading-6 text-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
