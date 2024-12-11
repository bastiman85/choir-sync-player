import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddChoirModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (choirName: string) => void;
}

const AddChoirModal = ({ isOpen, onClose, onSubmit }: AddChoirModalProps) => {
  const [choirName, setChoirName] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (choirName.trim()) {
      onSubmit(choirName.trim());
      setChoirName("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Choir</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="choirName">Choir Name</Label>
            <Input
              id="choirName"
              value={choirName}
              onChange={(e) => setChoirName(e.target.value)}
              placeholder="Enter choir name"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Choir</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddChoirModal;