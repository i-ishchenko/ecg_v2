"use client";

import { Prediction, Explanation } from "@/types/Prediction";
import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";

Chart.register(...registerables, annotationPlugin);

interface PredictionExplanationProps {
  prediction: Prediction;
  explanation?: Explanation;
  isLoading?: boolean;
}

export default function PredictionExplanation({ prediction, explanation, isLoading }: PredictionExplanationProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);

  const { feature_importance, completeness } = explanation!;
  
  const originalProbabilities = [
    (prediction.S as number) / 100,
    (prediction.V as number) / 100, 
    (prediction.F as number) / 100,
    (prediction.Q as number) / 100
  ];
  
  const originalPredIdx = originalProbabilities.indexOf(Math.max(...originalProbabilities));
  const class_names = ['S', 'V', 'F', 'Q'];
  const originalPredictedClass = class_names[originalPredIdx];

  // Sort features by absolute importance for the details section
  const sortedFeatures = [...feature_importance].sort(
    (a, b) => Math.abs(b.importance) - Math.abs(a.importance)
  );

  useEffect(() => {
    if (!chartRef.current || !explanation) return;

    const segmentData = prediction.segment_data!;
    
    // Create annotations for feature importance
    const annotations = sortedFeatures.slice(0, 10).map((feature, index) => {
      // Extract feature index from feature name (e.g., "t42" -> 42)
      const featureIndex = parseInt(feature.feature.replace('t', '')) || index;
      const normalizedIndex = Math.min(featureIndex, segmentData.length - 1);
      
      // Create highlighting region
      const regionWidth = 3;
      const startX = Math.max(0, normalizedIndex - regionWidth / 2);
      const endX = Math.min(segmentData.length - 1, normalizedIndex + regionWidth / 2);
      
      return {
        type: 'box' as const,
        xMin: startX,
        xMax: endX,
        backgroundColor: 'transparent',
        borderColor: feature.importance > 0 ? '#22c55e' : '#ef4444',
        borderWidth: 1,
        label: {
          content: `${feature.importance.toFixed(2)}`,
          display: true,
          position: 'center' as const,
          font: {
            size: 8
          },
          color: feature.importance > 0 ? '#16a34a' : '#dc2626'
        }
      };
    });

    const ctx = chartRef.current.getContext("2d");
    
    if (!ctx) return;
    
    const chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: Array.from({ length: segmentData.length }, (_, i) => i),
        datasets: [
          {
            label: `ECG Data`,
            data: segmentData,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: "Time Points"
            },
            grid: {
              color: "rgba(0, 0, 0, 0.1)"
            }
          },
          y: {
            title: {
              display: true,
              text: "Amplitude (mV)"
            },
            grid: {
              color: "rgba(0, 0, 0, 0.1)"
            }
          },
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false,
          },
          annotation: {
            annotations: annotations
          },
        },
        interaction: {
          intersect: false,
        },
      },
    });

    return () => {
      chartInstance.destroy();
    };
  }, [prediction, explanation]); 

  if (!explanation && !isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No explanation available</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Generating explanation...</p>
        <div className="mt-4">
          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ECG Chart with Highlighted Regions */}
      <div className="border rounded-lg p-4 bg-white">
        <h3 className="text-lg font-semibold mb-3">
          ECG Segment {prediction.id} with AI Explanation
        </h3>
        <div className="h-64 mb-4">
          <canvas ref={chartRef} />
        </div>
        <div className="text-sm text-gray-600">
          <p className="mb-2">
            <strong>AI Explanation:</strong> This chart shows which parts of the ECG segment were most influential in the AI's classification as <strong>{originalPredictedClass}</strong>.
          </p>
          <p>
            <span className="inline-block w-4 h-4 bg-green-200 border border-green-400 mr-2"></span>
            <strong className="text-green-600">Green regions</strong> indicate features that increase the predicted {originalPredictedClass} class probability
          </p>
          <p>
            <span className="inline-block w-4 h-4 bg-red-200 border border-red-400 mr-2"></span>
            <strong className="text-red-600">Red regions</strong> indicate features that decrease the predicted {originalPredictedClass} class probability
          </p>
        </div>
      </div>

      {/* Prediction Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm font-medium text-gray-700">Predicted Class:</p>
          <span className="inline-flex items-center px-2 py-1 rounded text-sm font-mono bg-blue-100 text-blue-800">
            {originalPredictedClass} ({(originalProbabilities[originalPredIdx] * 100).toFixed(1)}%)
          </span>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-sm font-medium text-gray-700 mb-2">AI Model Prediction:</p>
          <div className="flex flex-wrap gap-1">
            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-200 text-gray-800">
              S: {prediction.S || 0}%
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-200 text-gray-800">
              V: {prediction.V || 0}%
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-200 text-gray-800">
              F: {prediction.F || 0}%
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-200 text-gray-800">
              Q: {prediction.Q || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Completeness Check */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="text-md font-semibold mb-2 text-blue-900">Explanation Accuracy Check</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div>
            <span className="font-medium text-blue-800">Prediction - Baseline:</span>
            <div className="font-mono text-blue-900">{completeness.f_x_minus_f_baseline.toFixed(4)}</div>
          </div>
          <div>
            <span className="font-medium text-blue-800">Sum of Attributions:</span>
            <div className="font-mono text-blue-900">{completeness.sum_ig.toFixed(4)}</div>
          </div>
          <div>
            <span className="font-medium text-blue-800">Difference:</span>
            <div className={`font-mono ${completeness.difference < 0.01 ? 'text-green-600' : 'text-orange-600'}`}>
              {completeness.difference.toFixed(4)}
            </div>
          </div>
        </div>
        <p className="text-xs text-blue-700 mt-2">
          A small difference indicates high fidelity of the explanation. Lower values are better.
        </p>
      </div>

      {/* Feature Importance Details */}
      <div>
        <h4 className="text-md font-semibold mb-3">Top Feature Attributions</h4>
        <div className="space-y-2">
          {sortedFeatures.slice(0, 10).map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-2 border rounded">
              <div className="w-16 text-sm font-mono font-medium">
                {item.feature}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        item.importance > 0 ? 'bg-green-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.min(Math.abs(item.importance) * 1000, 100)}%` }}
                    />
                  </div>
                  <div className="w-20 text-sm font-mono">
                    {item.importance.toFixed(2)}
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item.importance > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.importance > 0 ? 'Increases' : 'Decreases'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-blue-800">
          <p><strong>Note:</strong> This explanation shows how much each time point contributes to the predicted class. Positive values increase the predicted class probability, while negative values decrease it.</p>
        </div>
      </div>
    </div>
  );
} 