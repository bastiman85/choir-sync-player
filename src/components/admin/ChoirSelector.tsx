import React from "react";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { Choir } from "@/types/song";

interface ChoirSelectorProps {
  choirs: Choir[];
  selectedChoirId: string;
  onChoirSelect: (choirId: string) => void;
  onAddChoir: () => void;
}

const ChoirSelector = ({ choirs, selectedChoirId, onChoirSelect, onAddChoir }: ChoirSelectorProps) => {
  return (
    <div className="w-[250px]">
      <Select
        value={selectedChoirId}
        onValueChange={(value) => {
          if (value === "add-choir") {
            onAddChoir();
          } else {
            onChoirSelect(value);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a choir" />
        </SelectTrigger>
        <SelectContent>
          {choirs.map((choir) => (
            <SelectItem key={choir.id} value={choir.id}>
              {choir.name}
            </SelectItem>
          ))}
          <SelectSeparator />
          <SelectItem value="add-choir" className="text-primary">
            <div className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add New Choir
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ChoirSelector;