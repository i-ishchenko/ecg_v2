"use client";

import { DataTable } from "@/components/ui/data-table";
import { AnomalyClasses, Prediction } from "@/types/Prediction";
import { getColumns } from "./columns";
import { useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function Analysis(props: {
  predictions: Prediction[];
  saveAnalysis?: (data: { patient: string; note: string; date: Date }) => void;
  updatePrediction?: (prediction: {
    id: string;
    isNormal: boolean;
    classification: AnomalyClasses | undefined;
  }) => void;
  isSaving: boolean;
}) {
  const { predictions, saveAnalysis, updatePrediction, isSaving } = props;

  const anomalies = useMemo(
    () => predictions.filter((p) => !p.isNormal),
    [predictions]
  );

  const [tableData, setTableData] = useState<Prediction[]>(anomalies);
  const [showNormal, setShowNormal] = useState<boolean>(false);
  const [patient, setPatient] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());

  const countMaxPeak = (point: "S" | "V" | "F" | "Q") => {
    return anomalies.filter((anomaly) => {
      const values = [anomaly.S, anomaly.V, anomaly.F, anomaly.Q].filter(
        (v) => v !== undefined
      );
      const max = Math.max(...(values as number[]));
      return anomaly[point] === max;
    }).length;
  };

  const getOverallData = () => {
    const S_count = countMaxPeak("S");
    const V_count = countMaxPeak("V");
    const F_count = countMaxPeak("F");
    const Q_count = countMaxPeak("Q");

    return {
      id: "Overall",
      isNormal: !anomalies.length,
      S: `${S_count} (${Math.round(S_count / (anomalies.length / 100))}%)`,
      F: `${F_count} (${Math.round(F_count / (anomalies.length / 100))}%)`,
      V: `${V_count} (${Math.round(V_count / (anomalies.length / 100))}%)`,
      Q: `${Q_count} (${Math.round(Q_count / (anomalies.length / 100))}%)`,
    };
  };

  useEffect(() => {
    setTableData((prev) => [getOverallData(), ...prev]);
  }, []);

  useEffect(() => {
    setTableData(
      showNormal
        ? [getOverallData(), ...predictions]
        : [getOverallData(), ...anomalies]
    );
  }, [showNormal, predictions, anomalies]);

  const onSubmit = () => {
    if (saveAnalysis)
      saveAnalysis({
        patient,
        note,
        date,
      });
  };

  return (
    <div className="mb-6 mt-3">
      <h1 className="text-xl font-bold text-center">Model predictions</h1>
      <h3 className="text-center">
        Overall anomalies found: {anomalies.length}/{predictions.length} (
        {Math.round(anomalies.length / (predictions.length / 100))}%)
      </h3>
      <DataTable
        columns={getColumns(updatePrediction)}
        data={tableData}
        filterField="id"
      />
      {saveAnalysis && (
        <div className="flex justify-between mt-3">
          <div className="flex items-center gap-2">
            <Label>Show normal data</Label>
            <Switch
              checked={showNormal}
              onCheckedChange={(val) => setShowNormal(val)}
            />
          </div>
          <Drawer>
            <DrawerTrigger asChild>
              <Button isLoading={isSaving}>Save</Button>
            </DrawerTrigger>
            <DrawerContent className="max-w-[80vw] xl:max-w-[65vw] mx-auto px-16">
              <DrawerTitle className="mt-3">
                Specify some additional info:
              </DrawerTitle>
              <Label htmlFor="patient" className="mt-5">
                Patient's name
              </Label>
              <Input
                id="patient"
                className="mt-1"
                required
                value={patient}
                onChange={(e) => setPatient(e.target.value)}
              />
              <Label htmlFor="notes" className="mt-2">
                Notes
              </Label>
              <Textarea
                id="notes"
                className="mt-1 resize-none"
                placeholder="Your notes"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <Label htmlFor="date" className="mt-2">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal mt-1",
                      !date && "text-muted-foreground"
                    )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(day) => setDate(day as Date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <DrawerClose asChild>
                <Button
                  className="mt-5 mb-8"
                  onClick={onSubmit}
                  disabled={!patient}>
                  Confirm
                </Button>
              </DrawerClose>
            </DrawerContent>
          </Drawer>
        </div>
      )}
    </div>
  );
}
