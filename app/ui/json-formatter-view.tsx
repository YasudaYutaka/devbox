import { Breadcrumbs, Button, Card, PageTitle } from "./primitives";
import { DevBoxShell } from "./shell";

export function JsonFormatterPage() {
  return (
    <DevBoxShell active="json-formatter">
      <Breadcrumbs items={["DevBox", "Formatters & Validators", "JSON Formatter"]} />
      <PageTitle
        title="JSON Formatter"
        subtitle="Format, validate, and inspect JSON payloads."
        action={
          <div className="flex gap-2">
            <Button variant="outline">Minify</Button>
            <Button>Format</Button>
          </div>
        }
      />
      <div className="grid min-h-[620px] gap-4 lg:grid-cols-2">
        <EditorPanel title="Input" label="Raw JSON" tone="input" />
        <EditorPanel title="Output" label="Formatted preview" tone="output" />
      </div>
    </DevBoxShell>
  );
}

function EditorPanel({
  title,
  label,
  tone,
}: {
  title: string;
  label: string;
  tone: "input" | "output";
}) {
  const code =
    tone === "input"
      ? '{"name":"DevBox","tools":["uuid","json","diff"],"local":true}'
      : '{\n  "name": "DevBox",\n  "tools": [\n    "uuid",\n    "json",\n    "diff"\n  ],\n  "local": true\n}';

  return (
    <Card className="flex min-h-[420px] flex-col">
      <div className="flex items-center justify-between border-b border-[#dfe1e6] px-4 py-3 dark:border-[#30363d]">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-xs text-[#6b778c] dark:text-[#8b949e]">{label}</p>
        </div>
        <Button variant="ghost">Copy</Button>
      </div>
      <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap p-5 font-mono text-sm leading-6 text-[#172b4d] dark:text-[#e6edf3]">
        {code}
      </pre>
    </Card>
  );
}
