type SectionHeadingProps = {
  number: string;
  title: string;
};

export default function SectionHeading({ number, title }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex items-center gap-4 whitespace-nowrap">
      <h2 className="font-mono text-2xl font-medium tracking-tight text-foreground">
        <span className="mr-2 text-accent">{number}.</span>
        {title}
      </h2>
      <div className="h-px max-w-xs flex-1 bg-border" aria-hidden="true" />
    </div>
  );
}
