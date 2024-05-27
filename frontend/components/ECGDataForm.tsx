import { FormEvent, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ECGFormDataType } from "@/app/types/ECGFormDataType";

export default function ECGDataForm(props: { ecgSend: (data: ECGFormDataType) => Promise<void> }) {
  const [samplingFq, setSamplingFq] = useState<number>(360); 
  const [cleaningMethod, setCleaningMethod] = useState<string>("neurokit"); 
  const fileRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const files = fileRef.current?.files;
    if (files) {
      const file = files[0];
      const ecgText = await file.text();
      const ecgArr = ecgText.replaceAll(/\s|\[|\]/g, "").split(",").map(v => +v)
      props.ecgSend({
        sampling_rate: samplingFq,
        ecg: ecgArr,
        cleaning_method: cleaningMethod
      })
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col items-start border border-black w-1/2 mx-auto mt-5 rounded py-5 px-8">
      <h2 className="text-xl font-bold text-center w-full mb-2">ECG Form</h2>
      <div className="mb-3 w-full">
        <Label className="block mb-1 text-md" htmlFor="sf">
          Sampling Frequency
        </Label>
        <Input
          id="sf"
          type="number"
          min={0}
          value={samplingFq}
          onChange={(e) => setSamplingFq(+e.target.value)}
        />
      </div>
      <div className="mb-3 w-full">
        <Label htmlFor="ecg" className="block mb-1 text-md">
          ECG data file
        </Label>
        <Input
          id="ecg"
          ref={fileRef}
          type="file"
          name="ecg"
          accept=".txt"
          required
        />
      </div>
      <div className="mb-3 w-full">
        <Label className="block mb-1 text-md">Cleaning Method</Label>
        <Select
          value={cleaningMethod}
          onValueChange={(val) => setCleaningMethod(val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="neurokit">Neurokit</SelectItem>
            <SelectItem value="pantompkins1985">Pantompkins</SelectItem>
            <SelectItem value="hamilton2002">Hamilton</SelectItem>
            <SelectItem value="elgendi2010">Elgendi</SelectItem>
            <SelectItem value="engzeemod2012">Engzeemod</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
}
