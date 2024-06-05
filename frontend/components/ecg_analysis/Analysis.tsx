import { Prediction } from "@/types/Predtiction";

export default function Analysis(props: { predictions: Prediction[] }) {
  const { predictions } = props;

  const anomalies = predictions.filter((p) => !p.isNormal);

  const countMaxPeak = (point: "S" | "V" | "T" | "Q") => {
    return anomalies.filter((anomaly) => {
      const values = [anomaly.S, anomaly.V, anomaly.T, anomaly.Q].filter(
        (v) => v !== undefined
      );
      const max = Math.max(...(values as number[]));
      return anomaly[point] === max;
    }).length;
  };

  const S_count = countMaxPeak("S");
  const V_count = countMaxPeak("V");
  const T_count = countMaxPeak("T");
  const Q_count = countMaxPeak("Q");

  return (
    <div>
      <h1>Model predictions</h1>
      <h3>
        Overall anomalies found: {anomalies.length}/{predictions.length} (
        {Math.round(anomalies.length / (predictions.length / 100))}%)
      </h3>
      <p>Anomalies found:</p>
      <ul>
        <li>
          S: {S_count} ({Math.round(S_count / (anomalies.length / 100))}%)
        </li>
        <li>
          V: {V_count} ({Math.round(V_count / (anomalies.length / 100))}%)
        </li>
        <li>
          T: {T_count} ({Math.round(T_count / (anomalies.length / 100))}%)
        </li>
        <li>
          Q: {Q_count} ({Math.round(Q_count / (anomalies.length / 100))}%)
        </li>
      </ul>
    </div>
  );
}
