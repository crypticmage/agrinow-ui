"use client";

import { useEffect, useState } from "react";
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
import { Eye, EyeOff, UserCog } from "lucide-react";
import { FormField, SectionTitle } from "./user-form-elements";
import { Users } from "@/types/user";
import { languageOptions, employmentTypeOptions } from "@/data/user-management";
import { useManagerDropdown } from "@/hooks/queries/users";

const roleOptionsLowercase = ["admin", "manager", "farmer", "agent", "analyst"];

// Shared style for native selects — matches ShadCN Input appearance
const selectCls =
  "h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";

interface CreateUserDialogProps {
  isOpen: boolean;
  setOpen: (v: boolean) => void;
  onSave: (user: Partial<Users>) => void;
  isLoading?: boolean;
}

export function CreateUserDialog({ isOpen, setOpen, onSave, isLoading }: CreateUserDialogProps) {
  const [formData, setFormData] = useState<Partial<Users>>({});
  const [showPassword, setShowPassword] = useState(false);
  const { data: managers } = useManagerDropdown(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShowPassword(false);
      setFormData({ role: "farmer", emp_type: "Full time", language: "English", is_active: true });
    }
  }, [isOpen]);

  const handleInput = (field: keyof Users, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    setOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="w-[95vw] sm:max-w-[620px] flex flex-col max-h-[92vh]">
        <DialogHeader className="pb-1 shrink-0">
          <DialogTitle className="text-lg">Create New User</DialogTitle>
          <DialogDescription className="text-sm">
            Fill out the details below to add a new team member.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 pr-1">
          <form autoComplete="off" className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 py-1">
            <input type="password" style={{ display: "none" }} />
            <SectionTitle>Personal Info</SectionTitle>

            <FormField label="First Name" required>
              <Input
                autoComplete="off"
                name="user_first_name_prevent_autofill"
                value={formData.first_name || ""}
                onChange={(e) => handleInput("first_name", e.target.value)}
                className="h-9 w-full"
              />
            </FormField>
            <FormField label="Last Name" required>
              <Input
                autoComplete="off"
                name="user_last_name_prevent_autofill"
                value={formData.last_name || ""}
                onChange={(e) => handleInput("last_name", e.target.value)}
                className="h-9 w-full"
              />
            </FormField>
            <FormField label="Phone">
              <Input
                autoComplete="off"
                name="user_phone_prevent_autofill"
                value={formData.phone || ""}
                onChange={(e) => handleInput("phone", e.target.value)}
                className="h-9 w-full"
              />
            </FormField>
            <FormField label="Language">
              <select
                value={formData.language || "English"}
                onChange={(e) => handleInput("language", e.target.value)}
                className={selectCls}
              >
                {languageOptions.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </FormField>

            <SectionTitle>Account Details</SectionTitle>

            <FormField label="Username" required>
              <Input
                autoComplete="off"
                name="user_login_username_prevent_autofill"
                value={formData.username || ""}
                onChange={(e) => handleInput("username", e.target.value)}
                className="h-9 w-full"
              />
            </FormField>
            <FormField label="Email" required>
              <Input
                type="email"
                autoComplete="off"
                name="user_email_prevent_autofill"
                value={formData.email || ""}
                onChange={(e) => handleInput("email", e.target.value)}
                className="h-9 w-full"
              />
            </FormField>
            <FormField label="Password" required>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  name="user_new_password_prevent_autofill"
                  onChange={(e) => handleInput("password" as any, e.target.value)}
                  className="h-9 pr-10 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>

            <SectionTitle>Role &amp; Employment</SectionTitle>

            <FormField label="Role" required>
              <select
                value={formData.role || "farmer"}
                onChange={(e) => handleInput("role", e.target.value)}
                className={selectCls}
              >
                {roleOptionsLowercase.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Employee Type" required>
              <select
                value={formData.emp_type || "Full time"}
                onChange={(e) => handleInput("emp_type", e.target.value)}
                className={selectCls}
              >
                {employmentTypeOptions.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Manager">
              <select
                value={formData.manager_id?.toString() || ""}
                onChange={(e) =>
                  handleInput(
                    "manager_id",
                    e.target.value ? parseInt(e.target.value, 10) : undefined
                  )
                }
                className={selectCls}
              >
                <option value="">None selected</option>
                {managers?.map((m) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.first_name} {m.last_name} (@{m.username})
                  </option>
                ))}
              </select>
            </FormField>

            <SectionTitle>Dates</SectionTitle>

            <FormField label="Hire Date" required>
              <input
                type="date"
                value={formData.hire_date ? formData.hire_date.substring(0, 10) : ""}
                onChange={(e) =>
                  handleInput("hire_date", e.target.value ? e.target.value + "T00:00:00.000Z" : undefined)
                }
                className={selectCls}
              />
            </FormField>
            <FormField label="Relieve Date">
              <input
                type="date"
                value={formData.relive_date ? formData.relive_date.substring(0, 10) : ""}
                onChange={(e) =>
                  handleInput("relive_date", e.target.value ? e.target.value + "T00:00:00.000Z" : undefined)
                }
                className={selectCls}
              />
            </FormField>
          </form>
        </div>

        <DialogFooter className="pt-2 gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="h-9 cursor-pointer"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="h-9 gap-1.5 cursor-pointer"
            disabled={isLoading}
          >
            <UserCog className="h-4 w-4" />
            {isLoading ? "Creating…" : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
