"use client";

import { AnomalyClasses, Prediction } from "@/types/Prediction";
import { Button } from "../ui/button";
import Analysis from "./Analysis/Analysis";
import Chart from "./Chart";

export default function InteractiveTab(props: {
  ecg: any;
  predictions: Prediction[];
  onPredict?: () => void;
  isLoading: boolean;
  saveAnalysis?: (data: { patient: string; note: string; date: Date }) => void;
  updatePrediction?: (prediction: {
    id: string;
    isNormal: boolean;
    classification: AnomalyClasses | undefined;
  }) => void;
  isSaving: boolean;
}) {
  const {
    ecg,
    predictions,
    onPredict,
    isLoading,
    saveAnalysis,
    isSaving,
    updatePrediction,
  } = props;

  return (
    <div>
      <Chart predictions={predictions} data={ecg} />
      {predictions.length === 0 && (
        <Button className="mt-3" isLoading={isLoading} onClick={onPredict}>
          Predict all segments
        </Button>
      )}
      {predictions.length > 0 && (
        <Analysis
          predictions={predictions}
          saveAnalysis={saveAnalysis}
          updatePrediction={updatePrediction}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
