export type Prediction = {
  id: string;
  isNormal: boolean;
  S?: number | string;
  F?: number | string;
  Q?: number | string;
  V?: number | string;
  segment_data?: number[];
};

export type Explanation = {
  predicted_class: string;
  class_index: number;
  probabilities: number[];
  ig_attributions: number[];
  feature_importance: Array<{
    feature: string;
    importance: number;
  }>;
  local_prediction: number[];
  completeness: {
    f_x: number;
    f_baseline: number;
    f_x_minus_f_baseline: number;
    sum_ig: number;
    difference: number;
  };
};

export const AnomalyClassesArray = ["S", "F", "Q", "V"] as const;
export type AnomalyClasses = (typeof AnomalyClassesArray)[number];
