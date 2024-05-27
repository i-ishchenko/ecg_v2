import { Button } from "../ui/button";
import Chart from "./Chart";

export default function InteractiveTab(props: {
  ecg: any;
  predictions: any;
  onPredict: () => void;
}) {
  return (
    <div>
      <Chart predictions={props.predictions} data={props.ecg} />
      <Button className="mt-3" onClick={props.onPredict}>
        Predict all segments
      </Button>
    </div>
  );
}
