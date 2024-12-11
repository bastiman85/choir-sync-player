import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Song, Choir } from "@/types/song";
import { useNavigate } from "react-router-dom";

interface SongTableProps {
  songs: Song[];
  choirs: Choir[];
  onRemoveFromChoir: (songId: string) => void;
}

const SongTable = ({ songs, choirs, onRemoveFromChoir }: SongTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Choir</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {songs.map((song) => {
            const choir = choirs.find(c => c.id === song.choirId);
            return (
              <TableRow key={song.id}>
                <TableCell>{song.title}</TableCell>
                <TableCell>{choir?.name || 'No Choir'}</TableCell>
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
                      {song.choirId && (
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => onRemoveFromChoir(song.id)}
                        >
                          Remove from Choir
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default SongTable;