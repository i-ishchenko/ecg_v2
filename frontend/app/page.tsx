"use client";

import axios from "axios";
import { FormEvent, useRef, useState } from "react";
import Chart from "./components/Chart";

export default function Home() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [ecg, setECG] = useState<any>()

  async function sendECG(e: FormEvent) {
    e.preventDefault();

    const files = fileRef.current?.files
    if(files) {
      const file = files[0];
      const data = await file.text();

      if (file.type === "application/json") {
        const parsed_data = JSON.parse(data);
        const res = await axios.post("http://localhost:8000/process/", parsed_data);
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
      {ecg ? <Chart data={ecg} /> : <p>Chart</p>}
    </main>
  );
}
