"use client";

import { format } from "date-fns";
import jsPDF from "jspdf";
import { AnomalyClassesArray, Prediction } from "@/types/Predtiction";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";

export default function SavePDF({ analysis }: { analysis: any }) {
  const formatedDate = format(new Date(analysis.date), "dd.MM.yyyy");

  const generatePDF = async () => {
    const doc = new jsPDF();
    let y = 22;
    let x = 15;

    doc.setFontSize(12);
    doc.text(`Analysis from ${formatedDate}`, x, (y += 5));
    doc.text(`Patient: ${analysis.patient}`, x, (y += 5));
    doc.text(`Notes: ${analysis.note}`, x, (y += 5));
    doc.text(`Sampling rate: ${analysis.ecg.sampling_frequency}`, x, (y += 5));
    doc.text(`Cleaning method: ${analysis.ecg.cleaning_method}`, x, (y += 5));
    doc.addImage(
      `data:image/jpeg;base64,${analysis.ecg.image}`,
      "JPEG",
      5,
      (y += 5),
      200,
      120
    );
    doc.text("Anomalies", x, (y += 120));
    autoTable(doc, {
      theme: "grid",
      head: [["id", ...AnomalyClassesArray]],
      body: (analysis.predictions as Prediction[])
        .filter((prediction) => !prediction.isNormal)
        .map((prediction) => {
          const rowData = [prediction.id];
          for (let anomalyClass of AnomalyClassesArray) {
            rowData.push(prediction[anomalyClass] + "%");
          }
          return rowData;
        }),
      startY: y + 5,
      margin: {
        top: 10,
      },
      rowPageBreak: "auto",
    });
    doc.save(`${analysis.patient}_${formatedDate}.pdf`);
  };

  return <Button onClick={generatePDF}>Download</Button>;
}
