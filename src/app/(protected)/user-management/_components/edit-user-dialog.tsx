"use client";

import { useEffect, useState } from "react";
import { Users } from "@/types/user";
import { useManagerDropdown } from "@/hooks/queries/users";
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
import { FormField } from "./user-form-elements";
import { DatePicker } from "@/components/ui/date-picker";

const roleOptionsLowercase = ["admin", "manager", "farmer", "agent", "analyst"];

interface EditUserDialogProps {
  isOpen: boolean;
  setOpen: (v: boolean) => void;
  selectedUser: Users | null;
  onSave: (user: Partial<Users>) => void;
  isLoading?: boolean;
}

export function EditUserDialog({ isOpen, setOpen, selectedUser, onSave, isLoading }: EditUserDialogProps) {
  const [formData, setFormData] = useState<Partial<Users>>({});
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const { data: managers } = useManagerDropdown(isOpen);

  useEffect(() => {
    if (isOpen && selectedUser) {
      setFormData(selectedUser);
      setConfirmDeactivate(false);
    }
  }, [isOpen, selectedUser]);

  const handleInput = (field: keyof Users, value: any) => {
    let newData = { ...formData, [field]: value };
    if (field === "relive_date" && value) {
      // Parse YYYY-MM-DD as local date to avoid UTC off-by-one
      const [y, m, d] = (value as string).split('-').map(Number);
      const selected = new Date(y, m - 1, d);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected <= today) newData.is_active = false;
    }
    setFormData(newData);
  };

  const handleSave = () => {
    onSave(formData);
    setOpen(false);
  };

  const watchIsActive = formData.is_active;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="w-[95vw] sm:max-w-115">
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
              <Select
                value={formData.role || ""}
                onValueChange={(val) => handleInput("role", val)}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptionsLowercase.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
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
                onValueChange={(val) =>
                  handleInput(
                    "manager_id",
                    val ? parseInt(val, 10) : undefined,
                  )
                }
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="None selected" />
                </SelectTrigger>
                <SelectContent>
                  {managers?.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.first_name} {m.last_name} (@{m.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Account Status</p>
              <p className="text-xs text-muted-foreground">Deactivating prevents login</p>
            </div>
            <Button
              type="button"
              variant={watchIsActive ? "default" : "destructive"}
              size="sm"
              onClick={() => {
                const current = formData.is_active;
                if (current) setConfirmDeactivate(true);
                else handleInput("is_active", true);
              }}
            >
              {watchIsActive ? "Active" : "Inactive"}
            </Button>
          </div>

          {confirmDeactivate && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 space-y-2">
              <p className="text-sm text-destructive font-medium">Deactivate this user?</p>
              <p className="text-xs text-muted-foreground">They will not be able to log in.</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => { handleInput("is_active", false); setConfirmDeactivate(false); }}
                >
                  Deactivate
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDeactivate(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <FormField
            label="Relieve Date"
            hint="Setting this to today or earlier will automatically mark the user as Inactive."
          >
            <DatePicker
              value={formData.relive_date?.substring(0, 10)}
              onChange={(val) => handleInput("relive_date", val)}
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
