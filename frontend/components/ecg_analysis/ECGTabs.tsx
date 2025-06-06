"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AnomalyClasses,
  AnomalyClassesArray,
  Prediction,
} from "@/types/Prediction";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Dispatch, SetStateAction } from "react";

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
  setPredictions?: Dispatch<SetStateAction<Prediction[]>>;
  isSaving: boolean;
}) {
  const {
    ecg,
    predictions,
    onPredict,
    isLoading,
    saveAnalysis,
    setPredictions,
    isSaving,
  } = props;

  const updatePrediction = setPredictions
    ? (prediction: {
        id: string;
        isNormal: boolean;
        classification: AnomalyClasses | undefined;
      }) => {
        const newPrediction: Prediction = {
          id: prediction.id,
          isNormal: prediction.isNormal,
        };

        if (!prediction.isNormal && prediction.classification) {
          for (let anomalyClass of AnomalyClassesArray) {
            newPrediction[anomalyClass] =
              anomalyClass == prediction.classification ? 100 : 0;
          }
        }
        setPredictions((prev) => [
          ...prev.filter((p) => p.id !== newPrediction.id),
          newPrediction,
        ]);
      }
    : undefined;

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
          updatePrediction={updatePrediction}
          isSaving={isSaving}
        />
      </TabsContent>
    </Tabs>
  );
}
