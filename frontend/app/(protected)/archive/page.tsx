import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import getAnalyses from "@/lib/api/getAnalyses";
import TableWrapper from "./TableWrapper";

export const fetchCache = "force-no-store";

export default async function ArchivePage() {
  const analyses = await getAnalyses();

  return (
    <main className="mt-8 w-[80vw] mx-auto">
      <h1 className="text-xl font-bold">Archive</h1>
      <TableWrapper data={analyses} />
    </main>
  );
}
