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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, UserCog } from "lucide-react";
import { FormField, DatePickerField, SectionTitle } from "./user-form-elements";
import { Users } from "@/types/user";
import { languageOptions, roleOptions, employmentTypeOptions } from "@/data/user-management";

interface CreateUserDialogProps {
  isOpen: boolean;
  setOpen: (v: boolean) => void;
  onSave: (user: Partial<Users>) => void;
  isLoading?: boolean;
}

export function CreateUserDialog({ isOpen, setOpen, onSave, isLoading }: CreateUserDialogProps) {
  const [formData, setFormData] = useState<Partial<Users>>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowPassword(false);
      setFormData({ role: "Farmer", emp_type: "Full time", language: "English", is_active: true });
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
      <DialogContent className="w-[95vw] sm:max-w-[620px] max-h-[92vh] overflow-y-auto">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-lg">Create New User</DialogTitle>
          <DialogDescription className="text-sm">
            Fill out the details below to add a new team member.
          </DialogDescription>
        </DialogHeader>

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
            <Select value={formData.language || "English"} onValueChange={(val) => handleInput("language", val)}>
              <SelectTrigger className="h-9 w-full cursor-pointer"><SelectValue /></SelectTrigger>
              <SelectContent>
                {languageOptions.map((lang) => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Select value={formData.role || "Farmer"} onValueChange={(val) => handleInput("role", val)}>
              <SelectTrigger className="h-9 w-full cursor-pointer"><SelectValue /></SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Employee Type" required>
            <Select value={formData.emp_type || "Full time"} onValueChange={(val) => handleInput("emp_type", val)}>
              <SelectTrigger className="h-9 w-full cursor-pointer"><SelectValue /></SelectTrigger>
              <SelectContent>
                {employmentTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <SectionTitle>Dates</SectionTitle>

          <FormField label="Hire Date" required>
            <DatePickerField
              value={formData.hire_date}
              onChange={(date: Date | undefined) => handleInput("hire_date", date ? date.toISOString() : undefined)}
            />
          </FormField>
          <FormField label="Relieve Date">
            <DatePickerField
              value={formData.relive_date || undefined}
              onChange={(date: Date | undefined) =>
                handleInput("relive_date", date ? date.toISOString() : undefined)
              }
              placeholder="Not set"
            />
          </FormField>
        </form>

        <DialogFooter className="pt-2 gap-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-9 cursor-pointer" disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="h-9 gap-1.5 cursor-pointer" disabled={isLoading}>
              <UserCog className="h-4 w-4" />
              {isLoading ? "Creating…" : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
