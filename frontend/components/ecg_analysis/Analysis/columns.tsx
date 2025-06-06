"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnomalyClasses, Prediction, Explanation } from "@/types/Prediction";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Pen, Eye } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import PredictionExplanation from "./PredictionExplanation";

const fetchExplanation = async (segmentData: number[]): Promise<Explanation> => {
  const response = await axios.post("http://localhost:8000/explain/", {
    segment_data: segmentData,
  });
  return response.data.explanation;
};

export const getColumns = (
  updatePrediction: ((newPrediction: {
    id: string;
    isNormal: boolean;
    classification: AnomalyClasses | undefined;
  }) => void) | undefined
) => {
  const columns: ColumnDef<Prediction>[] = [
    {
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="pl-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Id
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      accessorKey: "id",
    },
    {
      accessorKey: "isNormal",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="pl-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Annomaly
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="w-[125px] flex justify-center">
          <Checkbox checked={!row.original.isNormal} />
        </div>
      ),
      size: 125,
    },
    {
      accessorKey: "S",
      header: ({ column }) => (
        <HoverCard>
          <HoverCardTrigger className="w-full block">
            <Button
              variant="ghost"
              className="pl-0 hover:bg-transparent"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }>
              S
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <p>Includes:</p>
            <ul className="list-disc mx-4">
              <li>Atrial premature</li>
              <li>Aberrant atrial premature</li>
              <li>Nodal premature</li>
              <li>Supra-venticular premature</li>
            </ul>
          </HoverCardContent>
        </HoverCard>
      ),
      cell: ({ row }) => (
        <span>
          {row.original.isNormal
            ? "-"
            : `${row.original.S}${row.original.id != "Overall" ? "%" : ""}`}
        </span>
      ),
    },
    {
      accessorKey: "V",
      header: ({ column }) => (
        <HoverCard>
          <HoverCardTrigger className="w-full block">
            <Button
              variant="ghost"
              className="pl-0 hover:bg-transparent"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }>
              V
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <p>Includes:</p>
            <ul className="list-disc mx-4">
              <li>Premature venticular contraction</li>
              <li>Venticular escape</li>
            </ul>
          </HoverCardContent>
        </HoverCard>
      ),
      cell: ({ row }) => (
        <span>
          {row.original.isNormal
            ? "-"
            : `${row.original.V}${row.original.id != "Overall" ? "%" : ""}`}
        </span>
      ),
    },
    {
      accessorKey: "F",
      header: ({ column }) => (
        <HoverCard>
          <HoverCardTrigger className="w-full block">
            <Button
              variant="ghost"
              className="pl-0 hover:bg-transparent"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }>
              F
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <p>Includes:</p>
            <ul className="list-disc mx-4">
              <li>Fusion of venticular and normal</li>
            </ul>
          </HoverCardContent>
        </HoverCard>
      ),
      cell: ({ row }) => (
        <span>
          {row.original.isNormal
            ? "-"
            : `${row.original.F}${row.original.id != "Overall" ? "%" : ""}`}
        </span>
      ),
    },
    {
      accessorKey: "Q",
      header: ({ column }) => (
        <HoverCard>
          <HoverCardTrigger className="w-full block">
            <Button
              variant="ghost"
              className="pl-0 hover:bg-transparent"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }>
              Q
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <p>Includes:</p>
            <ul className="list-disc mx-4">
              <li>Paced</li>
              <li>Fusion of paced and normal</li>
              <li>Unclassifiable</li>
            </ul>
          </HoverCardContent>
        </HoverCard>
      ),
      cell: ({ row }) => (
        <span>
          {row.original.isNormal
            ? "-"
            : `${row.original.Q}${row.original.id != "Overall" ? "%" : ""}`}
        </span>
      ),
    },
    {
      id: "action",
      cell: ({ row }) => {
        const [isAnomaly, setIsAnomaly] = useState<boolean>(
          !row.original.isNormal
        );
        const [anomalyClass, setAnomalyClass] = useState<AnomalyClasses>();
        const [isDialogOpen, setIsDialogOpen] = useState(false);
        
        const canExplain = !row.original.isNormal && row.original.segment_data && row.original.id !== "Overall";
        
        const {
          data: explanation,
          isLoading,
          error,
        } = useQuery({
          queryKey: ["explanation", row.original.id],
          queryFn: () => fetchExplanation(row.original.segment_data!),
          enabled: isDialogOpen && canExplain,
        });

        return (
          <div className="flex items-center gap-2">
            {/* View ECG with Explanation Button */}
            {canExplain && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Eye className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto no-scrollbar-arrows">
                  <DialogHeader className="mb-3">
                    <DialogTitle>ECG Analysis for {row.original.id}</DialogTitle>
                    <DialogDescription>
                      ECG segment with AI explanation highlighting influential regions
                    </DialogDescription>
                  </DialogHeader>
                  <PredictionExplanation 
                    prediction={row.original} 
                    explanation={explanation}
                    isLoading={isLoading}
                  />
                  {error && (
                    <div className="text-red-600 text-sm mt-2">
                      Error loading explanation: {(error as Error).message}
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            )}
            
            {/* Edit Prediction Button */}
            {updatePrediction && row.original.id !== "Overall" && (
              <Dialog>     
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Pen className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Change prediction</DialogTitle>
                    <DialogDescription>
                      If you disagree with system prediction, you can provide
                      your own classification.
                    </DialogDescription>
                    <div className="flex items-center gap-2 !mt-3">
                      <Label>Is anomaly?</Label>
                      <Checkbox
                        checked={isAnomaly}
                        onCheckedChange={(val) => setIsAnomaly(val as boolean)}
                      />
                    </div>
                    {isAnomaly && (
                      <div>
                        <Label>Anomaly class</Label>
                        <Select
                          required
                          value={anomalyClass}
                          onValueChange={(val) => setAnomalyClass(val as AnomalyClasses)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="S">S</SelectItem>
                            <SelectItem value="V">V</SelectItem>
                            <SelectItem value="F">F</SelectItem>
                            <SelectItem value="Q">Q</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          type="submit"
                          className="mt-3"
                          disabled={isAnomaly && !anomalyClass}
                          onClick={() =>
                            updatePrediction({
                              id: row.original.id,
                              isNormal: !isAnomaly,
                              classification: isAnomaly
                                ? anomalyClass
                                : undefined,
                            })
                          }>
                          Save
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            )}
          </div>
        );
      },
    },
  ];
  return columns;
};
