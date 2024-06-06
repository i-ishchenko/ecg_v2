import { DataTable } from "@/components/ui/data-table";
import { Prediction } from "@/types/Predtiction";
import { columns } from "./columns";
import { useEffect, useState } from "react";

export default function Analysis(props: { predictions: Prediction[] }) {
  const { predictions } = props;

  const anomalies = predictions.filter((p) => !p.isNormal);

  const [tableData, setTableData] = useState<Prediction[]>(anomalies);

  const countMaxPeak = (point: "S" | "V" | "F" | "Q") => {
    return anomalies.filter((anomaly) => {
      const values = [anomaly.S, anomaly.V, anomaly.F, anomaly.Q].filter(
        (v) => v !== undefined
      );
      const max = Math.max(...(values as number[]));
      return anomaly[point] === max;
    }).length;
  };

  const S_count = countMaxPeak("S");
  const V_count = countMaxPeak("V");
  const F_count = countMaxPeak("F");
  const Q_count = countMaxPeak("Q");

  useEffect(() => {
    setTableData((prev) => [
      {
        id: "Overall",
        isNormal: !anomalies.length,
        S: `${S_count} (${Math.round(S_count / (anomalies.length / 100))}%)`,
        F: `${F_count} (${Math.round(F_count / (anomalies.length / 100))}%)`,
        V: `${V_count} (${Math.round(V_count / (anomalies.length / 100))}%)`,
        Q: `${Q_count} (${Math.round(Q_count / (anomalies.length / 100))}%)`,
      },
      ...prev,
    ]);
  }, []);

  return (
    <div className="mb-6 mt-3">
      <h1 className="text-xl font-bold text-center">Model predictions</h1>
      <h3 className="text-center">
        Overall anomalies found: {anomalies.length}/{predictions.length} (
        {Math.round(anomalies.length / (predictions.length / 100))}%)
      </h3>
      <DataTable columns={columns} data={tableData} />
    </div>
  );
}
