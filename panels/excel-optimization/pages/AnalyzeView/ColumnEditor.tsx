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
import { useI18n } from "../../useI18n";

interface Props {
  headers: string[];
  types: string[];
  locale: string;
  onHeaderChange: (headers: string[]) => void;
  onTypeChange: (types: string[]) => void;
}

export default function ColumnEditor({
  headers,
  types,
  locale,
  onHeaderChange,
  onTypeChange,
}: Props) {
  const t = useI18n(locale);

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
          <CardTitle>
            {t("analyze_view.column_editor.column_manager")}
          </CardTitle>
          <CardDescription>
            {t("analyze_view.column_editor.description")} <strong>{t("analyze_view.column_editor.description_strong")}</strong>
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
                      <SelectItem value="string">
                        {t("analyze_view.column_editor.string")}
                      </SelectItem>
                      <SelectItem value="number">
                        {t("analyze_view.column_editor.number")}
                      </SelectItem>
                      <SelectItem value="email">
                        {t("analyze_view.column_editor.email")}
                      </SelectItem>
                      <SelectItem value="date">
                        {t("analyze_view.column_editor.date")}
                      </SelectItem>
                      <SelectItem value="boolean">
                        {t("analyze_view.column_editor.boolean")}
                      </SelectItem>
                      <SelectItem value="phone">
                        {t("analyze_view.column_editor.phone")}
                      </SelectItem>
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
