import React, { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import zoomPlugin from "chartjs-plugin-zoom";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Settings } from "lucide-react";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

// Register all necessary components
Chart.register(...registerables, annotationPlugin, zoomPlugin);

const MyChart = ({
  data: tsData,
  predictions,
}) => {
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
          chartInstance.options.plugins.annotation.annotations[i].borderColor =
            predictions[i].isNormal ? "green" : "red";
          chartInstance.options.plugins.annotation.annotations[
            i
          ].label.backgroundColor = predictions[i].isNormal ? "green" : "red";
        }
      }
      chartInstance.update("none");
      return;
    }

    chartInstance.update("none"); // Update without animation
  }, [predictions]);

  return (
    <div className="relative">
      <div className="absolute right-0 top-8">
        <Popover>
          <PopoverTrigger>
            <Button>
              <Settings color="white" />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <h3 className="font-medium text-md  mb-4">
              Select points to display:
            </h3>
            <div className="grid grid-cols-2 gap-x-5 gap-y-3 mb-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="clean"
                  checked={showClean}
                  onCheckedChange={(val) => setShowClean(val)}
                />
                <Label htmlFor="clean">Clean</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="raw"
                  checked={showRaw}
                  onCheckedChange={(val) => setShowRaw(val)}
                />
                <Label htmlFor="raw">Raw</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="p_peaks"
                  checked={showP}
                  onCheckedChange={(val) => setShowP(val)}
                />
                <Label htmlFor="p_peaks">P peaks</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="q_peaks"
                  checked={showQ}
                  onCheckedChange={(val) => setShowQ(val)}
                />
                <Label htmlFor="q_peaks">Q peaks</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="s_peaks"
                  checked={showS}
                  onCheckedChange={(val) => setShowS(val)}
                />
                <Label htmlFor="s_peaks">S peaks</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="t_peaks"
                  checked={showT}
                  onCheckedChange={(val) => setShowT(val)}
                />
                <Label htmlFor="t_peaks">T peaks</Label>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <canvas ref={chartRef} />
    </div>
  );
};

export default MyChart;
