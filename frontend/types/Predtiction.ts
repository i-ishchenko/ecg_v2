export type Prediction = {
  id: string;
  isNormal: boolean;
  S?: number | string;
  F?: number | string;
  Q?: number | string;
  V?: number | string;
};

export const AnomalyClassesArray = ["S", "F", "Q", "V"] as const;
export type AnomalyClasses = (typeof AnomalyClassesArray)[number];
