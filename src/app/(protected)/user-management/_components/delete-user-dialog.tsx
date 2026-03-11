"use client";

import { Users } from "@/types/user";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteUserDialogProps {
  isOpen: boolean;
  setOpen: (v: boolean) => void;
  selectedUser: Users | null;
  onDeleteConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteUserDialog({ isOpen, setOpen, selectedUser, onDeleteConfirm, isLoading }: DeleteUserDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="w-[95vw] sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-base">Delete User</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold text-foreground">
                  {selectedUser?.first_name} {selectedUser?.last_name}
                </span>{" "}
                (<span className="font-mono text-xs">@{selectedUser?.username}</span>)?
                <br />
                <span className="text-destructive/80 font-medium">This action cannot be undone.</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-2 gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="h-9 cursor-pointer" disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="h-9 cursor-pointer"
            disabled={isLoading}
            onClick={() => { onDeleteConfirm(); }}
          >
            {isLoading ? "Deleting…" : "Delete User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
