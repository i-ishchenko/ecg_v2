"use client";

import axios from "axios";
import { FormEvent, useRef } from "react";

export default function Home() {
  const fileRef = useRef<HTMLInputElement>(null);

  async function sendECG(e: FormEvent) {
    e.preventDefault();

    const files = fileRef.current?.files
    if(files) {
      const file = files[0];
      const data = await file.text();

      if (file.type === "application/json") {
        console.log("ready to send");
        const parsed_data = JSON.parse(data);
        const res = await axios.post("http://localhost:8000/predict/", parsed_data);
        console.log(res.data);
      } else {
      }
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <form onSubmit={sendECG}>
        <input ref={fileRef} type="file" name="ecg" accept=".txt, .json" />
        <button type="submit">Submit</button>
      </form>
    </main>
  );
}
