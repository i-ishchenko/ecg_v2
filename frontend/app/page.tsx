"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import dynamic from "next/dynamic";
import Image from "next/image";
import { FormEvent, useRef, useState } from "react";

const Chart = dynamic(() => import("../components/Chart"), {
  ssr: false,
});

export default function Home() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [ecg, setECG] = useState<any>();

  async function sendECG(e: FormEvent) {
    e.preventDefault();

    const files = fileRef.current?.files;
    if (files) {
      const file = files[0];
      const data = await file.text();

      if (file.type === "application/json") {
        const parsed_data = JSON.parse(data);
        const res = await axios.post(
          "http://localhost:8000/process/",
          parsed_data
        );
        console.log(res.data);
        setECG(res.data);
      } else {
      }
    }
  }

  return (
    <main>
      <form onSubmit={sendECG}>
        <input ref={fileRef} type="file" name="ecg" accept=".txt, .json" />
        <button type="submit">Submit</button>
      </form>
      {ecg && (
        <Tabs defaultValue="general" className="flex flex-col">
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
          <TabsContent value="interactive" className="w-[80vw] max-h-[80vh] mx-auto">
            <Chart data={ecg} />
          </TabsContent>
        </Tabs>
      )}
    </main>
  );
}
