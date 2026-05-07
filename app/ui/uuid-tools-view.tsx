import { Hash, KeyRound } from "lucide-react";
import { Badge, Breadcrumbs, Button, Card, CardHeader, PageTitle } from "./primitives";
import { DevBoxShell } from "./shell";

export function UuidToolsPage() {
  return (
    <DevBoxShell active="uuid-tools">
      <Breadcrumbs items={["DevBox", "Generators", "UUID Tools"]} />
      <PageTitle title="UUID Tools" subtitle="Generate and transform UUIDs quickly." />
      <Card>
        <CardHeader title="Quick generator" icon={KeyRound} aside={<Badge>Valid UUID v4</Badge>} />
        <div className="flex flex-col gap-4 p-6">
          <div className="flex min-h-14 items-center rounded-md border border-[#dfe1e6] bg-[#f4f5f7] px-4 font-mono text-sm text-[#172b4d] dark:border-[#30363d] dark:bg-[#1b1f23] dark:text-[#e6edf3]">
            8f14e45f-ea7d-4f2a-bb3c-22f973f9a7a5
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline">Copy</Button>
            <Button>Generate</Button>
          </div>
          <div className="grid gap-2 rounded-lg bg-[#f4f5f7] p-2 sm:grid-cols-3 dark:bg-[#1b1f23]">
            {["Uppercase", "No hyphens", "URN format"].map((item) => (
              <div className="rounded-md bg-white px-3 py-2 text-sm dark:bg-[#24292e]" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </Card>
      <Card>
        <CardHeader
          title="Batch generator"
          icon={Hash}
          aside={
            <div className="flex gap-2">
              <Button variant="outline">Reset</Button>
              <Button>Run batch</Button>
            </div>
          }
        />
        <div className="grid gap-5 p-6 lg:grid-cols-[260px_1fr]">
          <div className="flex flex-col gap-3 rounded-lg border border-[#dfe1e6] bg-[#f4f5f7] p-4 dark:border-[#30363d] dark:bg-[#1b1f23]">
            <Field label="Version" value="v4 random" />
            <Field label="Amount" value="24" />
            <Field label="Output" value="Plain list" />
          </div>
          <div className="flex flex-col gap-2">
            {[
              "2928b693-1058-4d3b-a102-5e6a697a1c31",
              "c60324fa-d370-48d0-8f97-f2381372ac87",
              "dcd7aa4c-1479-449c-b0a1-179f35f2151f",
              "2a20f8d7-78bd-485a-92f0-7f9edccdf4cb",
            ].map((uuid) => (
              <div
                className="rounded-md border border-[#dfe1e6] px-3 py-2 font-mono text-sm dark:border-[#30363d]"
                key={uuid}
              >
                {uuid}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </DevBoxShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-medium text-[#6b778c] dark:text-[#8b949e]">
      {label}
      <span className="rounded-md border border-[#dfe1e6] bg-white px-3 py-2 text-sm font-normal text-[#172b4d] dark:border-[#30363d] dark:bg-[#24292e] dark:text-[#e6edf3]">
        {value}
      </span>
    </label>
  );
}
