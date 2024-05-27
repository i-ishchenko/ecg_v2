"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ECGDataForm from "@/components/ecg_analysis/ECGDataForm";
import { ECGFormDataType } from "../types/ECGFormDataType";
import { Loader2 } from "lucide-react";

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

export default function Home() {
  const [ecg, setECG] = useState<any>();
  const [predictions, setPredictions] = useState<any>();

  const processMutation = useMutation({
    mutationFn: (data: ECGFormDataType) => {
      return axios.post("http://localhost:8000/process/", data);
    },
    onSuccess: (res) => {
      setECG(res.data);
    },
  });

  const predictMutation = useMutation({
    mutationFn: () => {
      return axios.post("http://localhost:8000/predict/", {
        ecg: ecg.ecg_clean,
        sampling_rate: ecg.sampling_frequency,
      });
    },
    onSuccess: (res) => {
      setPredictions(res.data.predictions);
    },
  });

  return (
    <main>
      <ECGDataForm
        ecgSend={(data) => processMutation.mutate(data)}
        isLoading={processMutation.isPending}
      />
      {ecg && (
        <Tabs defaultValue="general" className="flex flex-col mt-10 mb-20">
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
          <TabsContent
            value="interactive"
            className="w-[80vw] max-h-[80vh] mx-auto">
            <InteractiveTab
              ecg={ecg}
              predictions={predictions}
              onPredict={() => predictMutation.mutate()}
              isLoading={predictMutation.isPending}
            />
          </TabsContent>
        </Tabs>
      )}
    </main>
  );
}
