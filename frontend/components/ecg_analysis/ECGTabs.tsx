"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Prediction } from "@/types/Predtiction";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const InteractiveTab = dynamic(
  () => import("@/components/ecg_analysis/InteractiveTab"),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    ),
  }
);

export default function ECGTabs(props: {
  ecg: any;
  predictions: Prediction[];
  onPredict?: () => void;
  isLoading: boolean;
  saveAnalysis?: (data: { patient: string; note: string; date: Date }) => void;
  isSaving: boolean;
}) {
  const { ecg, predictions, onPredict, isLoading, saveAnalysis, isSaving } =
    props;

  return (
    <Tabs defaultValue="general" className="flex flex-col mt-8 mb-20">
      <TabsList className="mx-auto justify-self-center mb-3">
        <TabsTrigger value="general">General Info</TabsTrigger>
        <TabsTrigger value="interactive">Interactive Chart</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <img
          className="w-[80vw] max-h-[80vh] m-auto object-contain"
          src={`data:image/jpeg;base64,${ecg.image}`}
          alt="additional chart"
        />
      </TabsContent>
      <TabsContent value="interactive" className="w-[80vw] mx-auto">
        <InteractiveTab
          ecg={ecg}
          predictions={predictions}
          onPredict={onPredict}
          isLoading={isLoading}
          saveAnalysis={saveAnalysis}
          isSaving={isSaving}
        />
      </TabsContent>
    </Tabs>
  );
}
