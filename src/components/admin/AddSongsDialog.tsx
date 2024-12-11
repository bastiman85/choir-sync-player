import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Song } from "@/types/song";

interface AddSongsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  availableSongs: Song[];
  selectedSongs: string[];
  onSelectedSongsChange: (songIds: string[]) => void;
  onAddSongs: () => void;
}

const AddSongsDialog = ({
  isOpen,
  onOpenChange,
  availableSongs,
  selectedSongs,
  onSelectedSongsChange,
  onAddSongs,
}: AddSongsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Existing Songs</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {availableSongs.map((song) => (
            <div key={song.id} className="flex items-center space-x-2">
              <Checkbox
                id={song.id}
                checked={selectedSongs.includes(song.id)}
                onCheckedChange={(checked) => {
                  onSelectedSongsChange(
                    checked
                      ? [...selectedSongs, song.id]
                      : selectedSongs.filter((id) => id !== song.id)
                  );
                }}
              />
              <label
                htmlFor={song.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {song.title}
              </label>
            </div>
          ))}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                onSelectedSongsChange([]);
              }}
            >
              Cancel
            </Button>
            <Button onClick={onAddSongs} disabled={selectedSongs.length === 0}>
              Add Selected Songs
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSongsDialog;