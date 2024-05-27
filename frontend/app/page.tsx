"use client";

import ECGDataForm from "@/components/ecg_analysis/ECGDataForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import dynamic from "next/dynamic";
import { useState } from "react";
import { ECGFormDataType } from "../types/ECGFormDataType";

const InteractiveTab = dynamic(
  () => import("@/components/ecg_analysis/InteractiveTab"),
  {
    ssr: false,
  }
);

export default function Home() {
  const [ecg, setECG] = useState<any>();
  const [predictions, setPredictions] = useState<any>();

  async function sendECG(data: ECGFormDataType) {
    const res = await axios.post("http://localhost:8000/process/", data);
    setECG(res.data);
  }

  async function predictHandler() {
    const res = await axios.post("http://localhost:8000/predict/", {
      ecg: ecg.ecg_clean,
      sampling_rate: ecg.sampling_frequency,
    });
    console.log(res.data)
    setPredictions(res.data.predictions);
  }

  return (
    <main>
      <ECGDataForm ecgSend={sendECG} />
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
            <InteractiveTab ecg={ecg} predictions={predictions} onPredict={predictHandler} />
          </TabsContent>
        </Tabs>
      )}
    </main>
  );
}
