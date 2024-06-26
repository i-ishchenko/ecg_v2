import { FormEvent, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ECGFormDataType } from "@/types/ECGFormDataType";
import { InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export default function ECGDataForm(props: {
  ecgSend: (data: ECGFormDataType) => void;
  isLoading: boolean;
}) {
  const [samplingFq, setSamplingFq] = useState<number>(360);
  const [cleaningMethod, setCleaningMethod] = useState<string>("neurokit");
  const fileRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const files = fileRef.current?.files;
    if (files) {
      const file = files[0];
      const ecgText = await file.text();
      const ecgArr = ecgText
        .replaceAll(/\s|\[|\]/g, "")
        .split(",")
        .map((v) => +v);
      props.ecgSend({
        sampling_rate: samplingFq,
        ecg: ecgArr,
        cleaning_method: cleaningMethod,
      });
    }
  };

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
          required
          min={0}
          value={samplingFq}
          onChange={(e) => setSamplingFq(+e.target.value)}
        />
      </div>
      <div className="mb-3 w-full">
        <div className="flex items-center gap-2 mb-2">
          <Label htmlFor="ecg" className="block text-md">
            ECG data file
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                <p>ECG signal from lead MLII</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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
          required
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
      <Button type="submit" isLoading={props.isLoading}>
        Submit
      </Button>
    </form>
  );
}
