import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ECGTabs from "@/components/ecg_analysis/ECGTabs";
import { connectDB } from "@/lib/connectDB";
import Analysis from "@/models/analysisModel";
import { Prediction } from "@/types/Predtiction";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export default async function AnalysisPage({
  params,
}: {
  params: { id: string };
}) {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!mongoose.Types.ObjectId.isValid(params.id)) notFound();

  const analysis = JSON.parse(
    JSON.stringify(
      await Analysis.findOne({
        _id: params.id,
        user: session?.user?.id,
      })
    )
  );

  if (!analysis) notFound();

  return (
    <div className="mt-8">
      <div className="border border-black w-1/2 mx-auto mt-5 rounded py-5 px-8">
        <div className="flex justify-between items-end">
          <h1 className="text-xl font-bold">Patient: {analysis.patient}</h1>
          <span className="font-medium text-zinc-500">
            Date: {format(new Date(analysis.date), "dd.MM.yyyy")}
          </span>
        </div>
        <p>Notes: {analysis.note}</p>
        <p>Sampling rate: {analysis.ecg.sampling_frequency}</p>
        <p>Cleaning method: {analysis.ecg.cleaning_method}</p>
      </div>
      <ECGTabs
        ecg={analysis.ecg}
        predictions={analysis.predictions as Prediction[]}
        isLoading={false}
        isSaving={false}
      />
    </div>
  );
}
