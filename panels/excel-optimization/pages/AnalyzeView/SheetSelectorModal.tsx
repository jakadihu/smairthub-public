import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@packages/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@packages/ui/select";
import { Button } from "@packages/ui/button";

interface Props {
  open: boolean;
  sheets: string[];
  selectedSheet: string | null;
  onSelect: (sheet: string) => void;
  onClose: () => void;
}

export default function SheetSelectorModal({
  open,
  sheets,
  selectedSheet,
  onSelect,
  onClose,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Válassz sheetet</DialogTitle>
        </DialogHeader>

        <Select
          value={selectedSheet || ""}
          onValueChange={(value) => {
            onSelect(value);
            onClose();
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sheet kiválasztása" />
          </SelectTrigger>

          <SelectContent>
            {sheets.map((sheet) => (
              <SelectItem key={sheet} value={sheet}>
                {sheet}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter>          
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
