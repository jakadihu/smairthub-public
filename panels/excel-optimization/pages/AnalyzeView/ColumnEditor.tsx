import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@packages/ui/select";
import { Input } from "@packages/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/card";
import { InputGroup, InputGroupInput } from "@packages/ui/input-group";

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
  onTypeChange,
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
      <Card size="sm">
        <CardHeader>
          <CardTitle>Oszlopkezelő</CardTitle>
          <CardDescription>
            Itt módosíthatod az oszlopok fejlécét és típusát. Győződj meg róla,
            hogy a típusok megfelelnek az adatoknak a helyes feldolgozás
            érdekében.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {headers.map((h, i) => (
              <div key={i} className="flex gap-1 items-center">
                <InputGroup>
                  <InputGroupInput
                    value={h}
                    onChange={(e) => updateHeader(i, e.target.value)}
                    placeholder="Fejléc"
                  />

                  <div className="w-px h-5 bg-border mx-1" />

                  <Select                    
                    value={types[i]}
                    onValueChange={(v) => updateType(i, v)}
                  >
                    <SelectTrigger className="w-[140px] border-0 !border-0 !border-transparent text-gray-500">
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
                </InputGroup>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
