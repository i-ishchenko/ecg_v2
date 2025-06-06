"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import ECGDataForm from "@/components/ecg_analysis/ECGDataForm";
import { ECGFormDataType } from "@/types/ECGFormDataType";
import { Prediction } from "@/types/Prediction";
import { useToast } from "@/hooks/use-toast";
import ECGTabs from "@/components/ecg_analysis/ECGTabs";

export default function Home() {
  const [ecg, setECG] = useState<any>();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const { toast } = useToast();

  const processMutation = useMutation({
    mutationFn: (data: ECGFormDataType) => {
      setPredictions([]);
      setECG(null);
      return axios.post("http://localhost:8000/process/", data);
    },
    onSuccess: (res) => {
      setECG(res.data);
    },
  });

  const predictMutation = useMutation({
    mutationFn: () => {
      return axios.post("http://localhost:8000/predict/", {
        ecg: ecg.ecg_raw,
        sampling_rate: ecg.sampling_frequency,
        cleaning_method: ecg.cleaning_method,
      });
    },
    onSuccess: (res) => {
      setPredictions(res.data.predictions as Prediction[]);
    },
  });

  const saveAnalysisMutation = useMutation({
    mutationFn: (data: { patient: string; note: string; date: Date }) => {
      return axios.post("/api/analysis", {
        ...data,
        ecg,
        predictions,
      });
    },
    onSuccess: () => {
      toast({
        title: "Analysis saved",
        description: "You can view all saved analyses inside your archive.",
      });
    },
  });

  return (
    <main className="mt-8">
      <ECGDataForm
        ecgSend={(data) => processMutation.mutate(data)}
        isLoading={processMutation.isPending}
      />
      {ecg && (
        <ECGTabs
          ecg={ecg}
          predictions={predictions}
          onPredict={() => predictMutation.mutate()}
          isLoading={predictMutation.isPending}
          saveAnalysis={(data: { patient: string; note: string; date: Date }) =>
            saveAnalysisMutation.mutate(data)
          }
          isSaving={saveAnalysisMutation.isPending}
          setPredictions={setPredictions}
        />
      )}
    </main>
  );
}
