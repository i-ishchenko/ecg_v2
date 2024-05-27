"use client";

import ECGDataForm from "@/components/ECGDataForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import dynamic from "next/dynamic";
import { FormEvent, useRef, useState } from "react";
import { ECGFormDataType } from "../types/ECGFormDataType";

const Chart = dynamic(() => import("../components/Chart"), {
  ssr: false,
});

export default function Home() {
  const [ecg, setECG] = useState<any>();

  async function sendECG(data: ECGFormDataType) {
    const res = await axios.post("http://localhost:8000/process/", data);
    setECG(res.data);
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
            <Chart data={ecg} />
          </TabsContent>
        </Tabs>
      )}
    </main>
  );
}
