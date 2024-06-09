"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export default function TableWrapper({ data }: { data: any[] }) {
  const { data: analyses } = useQuery<any[]>({
    queryKey: ["analyses"],
    queryFn: async () => {
      const res = await axios.get("/api/analysis");
      return res.data.analyses;
    },
    initialData: data,
  });

  return <DataTable data={analyses} columns={columns} />;
}
