import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DataTable } from "@/components/ui/data-table";
import { connectDB } from "@/lib/connectDB";
import Analysis from "@/models/analysisModel";
import { getServerSession } from "next-auth";
import { columns } from "./columns";

export default async function ArchivePage() {
  await connectDB();
  const session = await getServerSession(authOptions);
  const analyses = JSON.stringify(
    await Analysis.find({
      user: session?.user?.id,
    }).select("patient note ecg.sampling_frequency date updatedAt")
  );

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
