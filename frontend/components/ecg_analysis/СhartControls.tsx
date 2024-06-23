import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Settings } from "lucide-react";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Dispatch, SetStateAction } from "react";

export default function ChartControls({
  showClean,
  showRaw,
  showP,
  showQ,
  showS,
  showT,
  setShowClean,
  setShowRaw,
  setShowP,
  setShowQ,
  setShowS,
  setShowT,
}: {
  showClean: boolean;
  showRaw: boolean;
  showP: boolean;
  showQ: boolean;
  showS: boolean;
  showT: boolean;
  setShowClean: Dispatch<SetStateAction<boolean>>;
  setShowRaw: Dispatch<SetStateAction<boolean>>;
  setShowP: Dispatch<SetStateAction<boolean>>;
  setShowQ: Dispatch<SetStateAction<boolean>>;
  setShowS: Dispatch<SetStateAction<boolean>>;
  setShowT: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="absolute right-0 top-8">
      <Popover>
        <PopoverTrigger asChild>
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
  );
}
