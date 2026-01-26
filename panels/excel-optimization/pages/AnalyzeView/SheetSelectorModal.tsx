import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@packages/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@packages/ui/select";
import { Button } from "@packages/ui/button";
import { X } from 'lucide-react';
import { useI18n } from "../../useI18n";


interface Props {
  open: boolean;
  sheets: string[];
  selectedSheet: string | null;
  locale: string;
  onSelect: (sheet: string) => void;
  onClose: () => void;
  onCancel: () => void;
}

export default function SheetSelectorModal({
  open,
  sheets,
  selectedSheet,
  locale,
  onSelect,
  onClose,
  onCancel,
}: Props) {
  const t = useI18n(locale);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t("analyze_view.sheet_selector.title")}</DialogTitle>
          <DialogDescription>{t("analyze_view.sheet_selector.description")}</DialogDescription>
        </DialogHeader>

        <Select
          value={selectedSheet || ""}
          onValueChange={(value) => {
            onSelect(value);
            onClose();
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("analyze_view.sheet_selector.select_placeholder")} />
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
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={onCancel}              
            >
              <X /> {t("analyze_view.sheet_selector.cancel")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
