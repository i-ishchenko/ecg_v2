import React, { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import zoomPlugin from "chartjs-plugin-zoom";
import ChartControls from "./СhartControls";

// Register all necessary components
Chart.register(...registerables, annotationPlugin, zoomPlugin);

const MyChart = ({ data: tsData, predictions }) => {
  const chartRef = useRef();
  const [showClean, setShowClean] = useState(false);
  const [showRaw, setShowRaw] = useState(true);
  const [showP, setShowP] = useState(true);
  const [showQ, setShowQ] = useState(true);
  const [showS, setShowS] = useState(true);
  const [showT, setShowT] = useState(true);
  const [labeledData, setLabeledData] = useState([]);

  // Initial chart configuration
  useEffect(() => {
    if (typeof window === "undefined" || !tsData || !chartRef.current) return;

    const { ecg_raw, ecg_clean, r_peaks, p_peaks, q_peaks, s_peaks, t_peaks } =
      tsData;

    const initialLabeledData = ecg_clean.map((value, index) => ({
      index: index,
      ecgClean: value,
      ecgRaw: ecg_raw[index],
      isRPeak: r_peaks[index] === 1,
      pPeak:
        p_peaks[index] === 1 ? { clean: value, raw: ecg_raw[index] } : null,
      qPeak:
        q_peaks[index] === 1 ? { clean: value, raw: ecg_raw[index] } : null,
      sPeak:
        s_peaks[index] === 1 ? { clean: value, raw: ecg_raw[index] } : null,
      tPeak:
        t_peaks[index] === 1 ? { clean: value, raw: ecg_raw[index] } : null,
    }));

    // Assign ordinal numbers to R peaks
    let ordinal = 0;
    initialLabeledData.forEach((d) => {
      if (d.isRPeak) {
        ordinal += 1;
        d.label = ordinal.toString(); // convert to string for labeling
      }
    });

    // use state to always use complete data
    // was causing problems when using single variable
    setLabeledData(initialLabeledData);

    const ctx = chartRef.current.getContext("2d");

    const chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: initialLabeledData.map((d) => d.index),
        datasets: [], // Initially empty, will be populated in updateDatasets
      },
      options: {
        responsive: true,
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
            annotations: initialLabeledData
              .filter((d) => d.isRPeak)
              .map((d, idx) => ({
                type: "line",
                xMin: d.index,
                xMax: d.index,
                borderColor: "lightgray",
                borderWidth: 1,
                label: {
                  content: `R${idx + 1}`,
                  display: true,
                  position: "start",
                  yAdjust: -15,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  color: "white",
                  padding: 6,
                  font: {
                    size: 10,
                  },
                },
              })),
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

    updateDatasets(chartInstance, initialLabeledData);

    // Cleanup on component unmount
    return () => {
      chartInstance.destroy();
      document.body.style.cursor = "default";
    };
  }, [tsData]);

  // Creates array of data for Chart based on state
  const updateDatasets = (chartInstance, labeledData) => {
    const pointOptions = (color) => ({
      backgroundColor: color,
      borderWidth: 0,
      pointRadius: 5,
      showLine: false,
    });

    const getPeaks = (point) => {
      const points = labeledData.filter((d) => d[point] !== null);
      const res = [];
      if (showClean)
        res.push(...points.map((d) => ({ x: d.index, y: d[point].clean })));
      if (showRaw)
        res.push(...points.map((d) => ({ x: d.index, y: d[point].raw })));

      return res;
    };

    const datasets = [];

    if (showClean) {
      datasets.push({
        label: "ECG_Clean",
        data: labeledData.map((d) => d.ecgClean),
        borderColor: "red",
        borderWidth: 1,
        fill: false,
        pointRadius: 0,
      });
    }

    if (showRaw) {
      datasets.push({
        label: "ECG_Raw",
        data: labeledData.map((d) => d.ecgRaw),
        borderColor: showClean ? "gray" : "red",
        borderWidth: 1,
        fill: false,
        pointRadius: 0,
      });
    }

    if (showP) {
      datasets.push({
        label: "P Peaks",
        data: getPeaks("pPeak"),
        ...pointOptions("blue"),
      });
    }

    if (showQ) {
      datasets.push({
        label: "Q Peaks",
        data: getPeaks("qPeak"),
        ...pointOptions("red"),
      });
    }

    if (showS) {
      datasets.push({
        label: "S Peaks",
        data: getPeaks("sPeak"),
        ...pointOptions("green"),
      });
    }

    if (showT) {
      datasets.push({
        label: "T Peaks",
        data: getPeaks("tPeak"),
        ...pointOptions("black"),
      });
    }

    chartInstance.data.datasets = datasets;
    chartInstance.update("none");
  };

  // handle toggling peak display
  useEffect(() => {
    if (!chartRef.current) return;

    const chartInstance = Chart.getChart(chartRef.current);

    // Preserve the current zoom state
    const zoomState = {
      x: chartInstance.scales.x.min,
      y: chartInstance.scales.x.max,
    };

    updateDatasets(chartInstance, labeledData);

    // Restore the zoom state
    chartInstance.scales.x.min = zoomState.x;
    chartInstance.scales.x.max = zoomState.y;
    chartInstance.update("none");
  }, [showClean, showRaw, showP, showQ, showS, showT, labeledData]);

  // handle annotation(R peaks) color changes on select & prediction
  useEffect(() => {
    if (!chartRef.current) return;

    const chartInstance = Chart.getChart(chartRef.current);

    if (predictions) {
      for (
        let i = 0;
        i < chartInstance.options.plugins.annotation.annotations.length &&
        i < predictions.length;
        i++
      ) {
        if (chartInstance.options.plugins.annotation.annotations[i].label) {
          const prediction = predictions.find((p) => p.id === `R${i + 1}`);
          chartInstance.options.plugins.annotation.annotations[i].borderColor =
            prediction.isNormal ? "green" : "red";
          chartInstance.options.plugins.annotation.annotations[
            i
          ].label.backgroundColor = prediction.isNormal ? "green" : "red";
        }
      }
      chartInstance.update("none");
      return;
    }

    chartInstance.update("none"); // Update without animation
  }, [predictions]);

  return (
    <div className="relative">
      <ChartControls
        showClean={showClean}
        showRaw={showRaw}
        showP={showP}
        showQ={showQ}
        showS={showS}
        showT={showT}
        setShowClean={setShowClean}
        setShowRaw={setShowRaw}
        setShowP={setShowP}
        setShowQ={setShowQ}
        setShowS={setShowS}
        setShowT={setShowT}
      />
      <canvas ref={chartRef} />
    </div>
  );
};

export default MyChart;
