
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Song } from "@/types/song";
import { useNavigate } from "react-router-dom";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SongTableProps {
  songs: Song[];
  onDelete?: (songId: string) => void;
  selectedTermin: string;
  onTerminChange: (value: string) => void;
  uniqueTerminer: string[];
}

const SongTable = ({ songs, onDelete, selectedTermin, onTerminChange, uniqueTerminer }: SongTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium">Filtrera på termin:</label>
        <Select
          value={selectedTermin}
          onValueChange={onTerminChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alla terminer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla terminer</SelectItem>
            {uniqueTerminer.map((termin) => (
              <SelectItem key={termin} value={termin}>
                {termin}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Termin</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {songs.map((song) => (
              <TableRow key={song.id}>
                <TableCell>{song.title}</TableCell>
                <TableCell>{song.termin || "-"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => navigate(`/admin/songs/${song.id}/edit`)}
                      >
                        Edit
                      </DropdownMenuItem>
                      {onDelete && (
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => onDelete(song.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SongTable;
