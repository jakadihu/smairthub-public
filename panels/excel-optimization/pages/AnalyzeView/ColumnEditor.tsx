import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@packages/ui/select";
import { Input } from "@packages/ui/input";

interface Props {
  headers: string[];
  types: string[];
  onHeaderChange: (headers: string[]) => void;
  onTypeChange: (types: string[]) => void;
}

export default function ColumnEditor({
  headers,
  types,
  onHeaderChange,
  onTypeChange
}: Props) {
  function updateHeader(i: number, value: string) {
    const copy = [...headers];
    copy[i] = value;
    onHeaderChange(copy);
  }

  function updateType(i: number, value: string) {
    const copy = [...types];
    copy[i] = value;
    onTypeChange(copy);
  }

  return (
    <div>
      <h3 className="font-medium mb-2">Oszlopok</h3>

      <div className="grid grid-cols-2 gap-4">
        {headers.map((h, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input
              value={h}
              onChange={(e) => updateHeader(i, e.target.value)}
              placeholder="Fejléc"
            />

            <Select value={types[i]} onValueChange={(v) => updateType(i, v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Típus" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="string">Szöveg</SelectItem>
                <SelectItem value="number">Szám</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="date">Dátum</SelectItem>
                <SelectItem value="boolean">Logikai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}
