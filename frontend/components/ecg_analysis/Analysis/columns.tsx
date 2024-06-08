"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Prediction } from "@/types/Predtiction";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export const columns: ColumnDef<Prediction>[] = [
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
];
