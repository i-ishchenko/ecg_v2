"use client";

import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { AnalysisBrief } from "@/types/Analysis";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export const columns: ColumnDef<AnalysisBrief>[] = [
  {
    header: "Id",
    accessorKey: "id",
    cell: ({ row }) => (
      <HoverCard>
        <HoverCardTrigger>
          <span className="text-ellipsis overflow-hidden w-[50px] block cursor-default">
            {row.original.id}
          </span>
        </HoverCardTrigger>
        <HoverCardContent>{row.original.id}</HoverCardContent>
      </HoverCard>
    ),
  },
  {
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="pl-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    accessorKey: "date",
    cell: ({ row }) => (
      <span>{format(new Date(row.original.date), "dd.MM.yyyy")}</span>
    ),
  },
  {
    accessorKey: "patient",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="pl-0 hover:bg-transparent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Patient
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "note",
    header: "Notes",
  },
  {
    accessorKey: "ecg.sampling_frequency",
    header: ({ column }) => (
      <HoverCard>
        <HoverCardTrigger className="w-full block">
          <Button
            variant="ghost"
            className="pl-0 hover:bg-transparent"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }>
            SR
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent>sampling rate</HoverCardContent>
      </HoverCard>
    ),
  },
  {
    header: ({ column }) => (
      <Button
        className="pl-0 hover:bg-transparent"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Last updated
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    accessorKey: "updatedAt",
    cell: ({ row }) => (
      <span>{format(new Date(row.original.updatedAt), "dd.MM.yyyy")}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Link href={`/archive/${id}`}>View more</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-700 hover:!text-red-500">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
