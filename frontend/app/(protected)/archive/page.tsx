import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import getAnalyses from "@/lib/api/getAnalyses";

export default async function ArchivePage() {
  const analyses = JSON.stringify(await getAnalyses());

  return (
    <main className="mt-8 w-[80vw] mx-auto">
      <h1 className="text-xl font-bold">Archive</h1>
      <DataTable
        data={JSON.parse(analyses).map((a: any) => ({ ...a, id: a._id }))}
        columns={columns}
      />
    </main>
  );
}
