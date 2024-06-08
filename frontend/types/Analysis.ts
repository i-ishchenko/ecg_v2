export type AnalysisBrief = {
  id: string;
  date: string;
  patient: string;
  note: string;
  updatedAt: string;
  ecg: {
    sampling_frequency: number;
  };
};
