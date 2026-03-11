"use client";

import { useEffect, useState } from "react";
import { Users } from "@/types/user";
import { roleOptions } from "@/data/user-management";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField, DatePickerField, SectionTitle } from "./user-form-elements";

interface EditUserDialogProps {
  isOpen: boolean;
  setOpen: (v: boolean) => void;
  selectedUser: Users | null;
  onSave: (user: Partial<Users>) => void;
  isLoading?: boolean;
}

export function EditUserDialog({ isOpen, setOpen, selectedUser, onSave, isLoading }: EditUserDialogProps) {
  const [formData, setFormData] = useState<Partial<Users>>({});

  useEffect(() => {
    if (isOpen && selectedUser) setFormData(selectedUser);
  }, [isOpen, selectedUser]);

  const handleInput = (field: keyof Users, value: any) => {
    let newData = { ...formData, [field]: value };
    if (field === "relive_date" && value) {
      const selected = new Date(value);
      const today = new Date();
      selected.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (selected <= today) newData.is_active = false;
    }
    setFormData(newData);
  };

  const handleSave = () => {
    onSave(formData);
    setOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="w-[95vw] sm:max-w-[460px]">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-lg">Edit User</DialogTitle>
          <DialogDescription className="text-sm">
            Update role, status, and assignment for{" "}
            <span className="font-medium text-foreground">
              {selectedUser?.first_name} {selectedUser?.last_name}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form autoComplete="off" className="grid gap-3 py-1">
          <input type="password" style={{ display: "none" }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <FormField label="Role">
              <Select value={formData.role || ""} onValueChange={(val) => handleInput("role", val)}>
                <SelectTrigger className="h-9 w-full cursor-pointer"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Status">
              <Select
                value={formData.is_active ? "Active" : "Inactive"}
                onValueChange={(val) => handleInput("is_active", val === "Active")}
              >
                <SelectTrigger className="h-9 w-full cursor-pointer"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Phone">
              <Input
                autoComplete="off"
                name="edit_user_phone_prevent_autofill"
                value={formData.phone || ""}
                onChange={(e) => handleInput("phone", e.target.value)}
                className="h-9 w-full"
              />
            </FormField>

            <FormField label="Manager">
              <Select
                value={formData.manager_id?.toString() || ""}
                onValueChange={(val) => handleInput("manager_id", parseInt(val || "0", 10))}
              >
                <SelectTrigger className="h-9 w-full cursor-pointer"><SelectValue placeholder="None selected" /></SelectTrigger>
                <SelectContent>{/* Populated dynamically */}</SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField
            label="Relieve Date"
            hint="Setting this to today or earlier will automatically mark the user as Inactive."
          >
            <DatePickerField
              value={formData.relive_date || undefined}
              onChange={(date: Date | undefined) =>
                handleInput("relive_date", date ? date.toISOString() : undefined)
              }placeholder="Not set"
            />
          </FormField>
        </form>

        <DialogFooter className="pt-1 gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="h-9 cursor-pointer" disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="h-9 cursor-pointer" disabled={isLoading}>
            {isLoading ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
