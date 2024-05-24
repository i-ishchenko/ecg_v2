import React, { useState, useEffect } from "react";
import {
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  ReferenceArea,
  ComposedChart,
  Scatter,
} from "recharts";
import { ChartData } from "../types/ChartData";

const MyChart = ({ data: tsData }: {data: ChartData}) => {
  const { ecg_clean, r_peaks, p_peaks, q_peaks, s_peaks, t_peaks } = tsData;

  const [data, setData] = useState<any[]>([]);
  const [zoomedData, setZoomedData] = useState<any[]>([]);
  const [refAreaLeft, setRefAreaLeft] = useState("");
  const [refAreaRight, setRefAreaRight] = useState("");

  useEffect(() => {
    const labeledData = ecg_clean.map((value, index) => ({
      index: index,
      ecgValue: value,
      isRPeak: r_peaks[index] === 1,
      pPeak: p_peaks[index] === 1 ? value : null,
      qPeak: q_peaks[index] === 1 ? value : null,
      sPeak: s_peaks[index] === 1 ? value : null,
      tPeak: t_peaks[index] === 1 ? value : null,
      label: r_peaks[index] === 1 ? "" : null, // initially no labels
    }));

    // Assign ordinal numbers to R peaks
    let ordinal = 0;
    labeledData.forEach((d) => {
      if (d.isRPeak) {
        ordinal += 1;
        d.label = ordinal.toString(); // convert to string for labeling
      }
    });

    setData(labeledData);
    setZoomedData(labeledData);
  }, [ecg_clean, r_peaks]);

  const zoom = () => {
    if (
      refAreaLeft === "" ||
      refAreaRight === "" ||
      refAreaLeft === refAreaRight
    ) {
      setRefAreaLeft("");
      setRefAreaRight("");
      return;
    }

    let left = refAreaLeft;
    let right = refAreaRight;

    if (left > right) {
      [left, right] = [right, left];
    }

    const newData = data.slice(+left, +right + 1);
    setZoomedData(newData);
    setRefAreaLeft("");
    setRefAreaRight("");
  };

  const zoomOut = () => {
    setZoomedData(data);
    setRefAreaLeft("");
    setRefAreaRight("");
  };

  return (
    <div
      className="highlight-bar-charts"
      style={{ userSelect: "none", width: "100%" }}>
      <button type="button" className="btn update" onClick={zoomOut}>
        Zoom Out
      </button>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          width={800}
          height={400}
          data={zoomedData}
          onMouseDown={(e) => setRefAreaLeft(e.activeLabel as string)}
          onMouseMove={(e) =>
            refAreaLeft !== "" && setRefAreaRight(e.activeLabel as string)
          }
          onMouseUp={zoom}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="index"
            tickFormatter={(tick) => {
              const entry = data[tick];
              return entry && entry.label ? entry.label : "";
            }}
            ticks={zoomedData
              .filter((entry) => entry.label)
              .map((entry) => entry.index)}
          />
          <YAxis />
          <Line type="linear" dataKey="ecgValue" stroke="red" dot={false} />
          <Scatter dataKey="pPeak" fill="blue" />
          <Scatter dataKey="qPeak" fill="yellow" />
          <Scatter dataKey="sPeak" fill="green" />
          <Scatter dataKey="tPeak" fill="pink" />
          {zoomedData.map(
            (entry, index) =>
              entry.isRPeak && (
                <ReferenceLine
                  key={index}
                  x={entry.index}
                  stroke="white"
                  strokeDasharray="3 3"
                />
              )
          )}
          {refAreaLeft && refAreaRight ? (
            <ReferenceArea
              x1={refAreaLeft}
              x2={refAreaRight}
              strokeOpacity={0.3}
            />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MyChart;
