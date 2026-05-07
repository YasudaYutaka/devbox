import { Breadcrumbs, Button, Card, PageTitle, cx } from "./primitives";
import { DevBoxShell } from "./shell";

export function TextDiffPage() {
  return (
    <DevBoxShell active="text-diff">
      <Breadcrumbs items={["DevBox", "Comparators", "Text Diff"]} />
      <PageTitle
        title="Text Diff"
        subtitle="Compare two text blocks and review line changes."
        action={
          <div className="flex gap-2">
            <Button variant="outline">Clear</Button>
            <Button>Compare</Button>
          </div>
        }
      />
      <Card>
        <div className="flex flex-col gap-3 p-4">
          <h2 className="text-sm font-semibold">Paste text to compare</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <TextAreaPreview title="Original text" />
            <TextAreaPreview title="Changed text" />
          </div>
        </div>
      </Card>
      <div className="flex flex-col gap-3 rounded-lg border border-[#dfe1e6] bg-white p-3 sm:flex-row sm:items-center sm:justify-between dark:border-[#30363d] dark:bg-[#24292e]">
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <span className="size-4 rounded border border-[#0052cc] bg-[#0052cc]" />
            Ignore whitespace
          </label>
          <label className="flex items-center gap-2">
            <span className="size-4 rounded border border-[#dfe1e6] dark:border-[#30363d]" />
            Case sensitive
          </label>
        </div>
        <div className="flex w-fit rounded-md bg-[#f4f5f7] p-1 dark:bg-[#1b1f23]">
          <button className="rounded-sm px-3 py-1.5 text-xs text-[#6b778c] dark:text-[#8b949e]">
            Inline
          </button>
          <button className="rounded-sm bg-white px-3 py-1.5 text-xs font-medium shadow-sm dark:bg-[#24292e]">
            Side-by-side
          </button>
        </div>
      </div>
      <Card className="min-h-[360px]">
        <div className="flex items-center justify-between border-b border-[#dfe1e6] px-5 py-3 dark:border-[#30363d]">
          <h2 className="text-sm font-semibold">Diff preview</h2>
          <span className="text-xs text-[#6b778c] dark:text-[#8b949e]">4 changed lines</span>
        </div>
        <div className="grid gap-2 p-4 font-mono text-sm lg:grid-cols-2">
          <DiffColumn
            lines={[
              ["neutral", "1  const tool = createFormatter(input);"],
              ["removed", "-  return tool.run();"],
              ["neutral", "3  export default tool;"],
            ]}
          />
          <DiffColumn
            lines={[
              ["neutral", "1  const tool = createFormatter(input);"],
              ["added", "+  return tool.format({ indent: 2 });"],
              ["neutral", "3  export default tool;"],
            ]}
          />
        </div>
      </Card>
    </DevBoxShell>
  );
}

function TextAreaPreview({ title }: { title: string }) {
  return (
    <div className="flex h-36 flex-col rounded-lg border border-[#dfe1e6] bg-[#f4f5f7] dark:border-[#30363d] dark:bg-[#1b1f23]">
      <div className="border-b border-[#dfe1e6] px-3 py-2 text-xs font-medium text-[#6b778c] dark:border-[#30363d] dark:text-[#8b949e]">
        {title}
      </div>
      <div className="flex-1 p-3 font-mono text-sm text-[#6b778c] dark:text-[#8b949e]">
        Paste content here...
      </div>
    </div>
  );
}

function DiffColumn({
  lines,
}: {
  lines: Array<["neutral" | "removed" | "added", string]>;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-[#dfe1e6] dark:border-[#30363d]">
      {lines.map(([type, line]) => (
        <div
          className={cx(
            "px-3 py-2",
            type === "neutral" && "bg-white dark:bg-[#24292e]",
            type === "removed" &&
              "bg-[#ffebe6] text-[#bf2600] dark:bg-[#3a1f1b] dark:text-[#ff9b8a]",
            type === "added" &&
              "bg-[#e3fcef] text-[#006644] dark:bg-[#1b3a2d] dark:text-[#57d9a3]",
          )}
          key={line}
        >
          {line}
        </div>
      ))}
    </div>
  );
}
