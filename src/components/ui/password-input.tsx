import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  icon?: React.ReactNode;
}

export function PasswordInput({ className, icon, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-3.5 text-muted-foreground">
          {icon}
        </div>
      )}
      <input
        type={showPassword ? "text" : "password"}
        className={`w-full bg-background border border-border rounded-xl py-3 ${icon ? 'pl-10' : 'pl-4'} pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow ${className || ""}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-primary transition-colors focus:outline-none rounded-md"
        title={showPassword ? "Şifrəni gizlət" : "Şifrəni göstər"}
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}
