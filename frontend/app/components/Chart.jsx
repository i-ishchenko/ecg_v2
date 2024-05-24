import React, { useEffect, useRef, useState } from "react";
import { Chart, ChartItem, registerables } from "chart.js";
import annotationPlugin, { AnnotationOptions } from "chartjs-plugin-annotation";
import zoomPlugin from "chartjs-plugin-zoom";
import { ChartData } from "../types/ChartData";

// Register all necessary components
Chart.register(...registerables, annotationPlugin, zoomPlugin);

const MyChart = ({ data: tsData }) => {
  const chartRef = useRef(null);
  const [selectedLine, setSelectedLine] = useState(null);

  useEffect(() => {
    if (!tsData || !chartRef.current) return;

    const { ecg_clean, r_peaks, p_peaks, q_peaks, s_peaks, t_peaks } = tsData;

    const labeledData = ecg_clean.map((value, index) => ({
      index: index,
      ecgValue: value,
      isRPeak: r_peaks[index] === 1,
      pPeak: p_peaks[index] === 1 ? value : null,
      qPeak: q_peaks[index] === 1 ? value : null,
      sPeak: s_peaks[index] === 1 ? value : null,
      tPeak: t_peaks[index] === 1 ? value : null,
    }));

    // Assign ordinal numbers to R peaks
    let ordinal = 0;
    labeledData.forEach((d) => {
      if (d.isRPeak) {
        ordinal += 1;
        d.label = ordinal.toString(); // convert to string for labeling
      }
    });

    const ctx = chartRef.current.getContext("2d");

    const chartInstance = new Chart(ctx , {
      type: "line",
      data: {
        labels: labeledData.map((d) => d.index),
        datasets: [
          {
            label: "ECG",
            data: labeledData.map((d) => d.ecgValue),
            borderColor: "red",
            borderWidth: 1,
            fill: false,
            pointRadius: 0,
          },
          {
            label: "P Peaks",
            data: labeledData
              .filter((d) => d.pPeak !== null)
              .map(
                (d) => ({ x: d.index, y: d.pPeak })
              ),
            borderColor: "blue",
            backgroundColor: "blue",
            borderWidth: 0,
            pointRadius: 3,
            showLine: false,
          },
          {
            label: "Q Peaks",
            data: labeledData
              .filter((d) => d.qPeak !== null)
              .map(
                (d) => ({ x: d.index, y: d.qPeak })
              ),
            borderColor: "yellow",
            backgroundColor: "yellow",
            borderWidth: 0,
            pointRadius: 3,
            showLine: false,
          },
          {
            label: "S Peaks",
            data: labeledData
              .filter((d) => d.sPeak !== null)
              .map(
                (d) => ({ x: d.index, y: d.sPeak })
              ),
            borderColor: "green",
            backgroundColor: "green",
            borderWidth: 0,
            pointRadius: 3,
            showLine: false,
          },
          {
            label: "T Peaks",
            data: labeledData
              .filter((d) => d.tPeak !== null)
              .map(
                (d) => ({ x: d.index, y: d.tPeak })
              ),
            borderColor: "pink",
            backgroundColor: "pink",
            borderWidth: 0,
            pointRadius: 3,
            showLine: false,
          },
        ],
      },
      options: {
        responsive: true,
        animation: {
          duration: selectedLine ? 0 : 1000, // Disable animation on line click
        },
        scales: {
          x: {
            type: "linear",
            position: "bottom",
            display: false, // Hide X-axis labels
          },
          y: {
            type: "linear",
          },
        },
        plugins: {
          tooltip: {
            mode: "index",
            intersect: false,
          },
          annotation: {
            annotations: labeledData
              .filter((d) => d.isRPeak)
              .map(
                (d, idx) => ({
                  type: "line",
                  xMin: d.index,
                  xMax: d.index,
                  borderColor:
                    selectedLine === `R${idx + 1}` ? "blue" : "white",
                  borderWidth: 1,
                  label: {
                    content: `R${idx + 1}`,
                    display: true,
                    position: "start",
                    yAdjust: -10,
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    color: selectedLine === `R${idx + 1}` ? "blue" : "white",
                    padding: 6,
                    font: {
                      size: 10,
                    },
                  },
                  click: () => {
                    setSelectedLine(`R${idx + 1}`);
                    console.log(`R${idx + 1}`);
                  },
                  enter: () => {
                    document.body.style.cursor = "pointer";
                  },
                  leave: () => {
                    document.body.style.cursor = "default";
                  },
                })
              ),
          },
          zoom: {
            pan: {
              enabled: true,
              mode: "x",
            },
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true,
              },
              mode: "x",
            },
          },
        },
      },
    });

    // Cleanup on component unmount
    return () => {
      chartInstance.destroy();
      document.body.style.cursor = "default";
    };
  }, [tsData]);

  useEffect(() => {
    if (!chartRef.current) return;

    const chartInstance = Chart.getChart(chartRef.current);

    if (
      !chartInstance ||
      !chartInstance.options.plugins?.annotation ||
      !chartInstance.options.plugins.annotation.annotations
    )
      return;

    // Update the annotation colors based on selected line
    chartInstance.options.plugins.annotation.annotations.forEach(
      (annotation) => {
        if (annotation.label) {
          annotation.borderColor =
            selectedLine === annotation.label.content ? "blue" : "white";
          annotation.label.color =
            selectedLine === annotation.label.content ? "blue" : "white";
        }
      }
    );

    chartInstance.update("none"); // Update without animation
  }, [selectedLine]);

  return (
    <div className="w-[80%] m-auto">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default MyChart;
