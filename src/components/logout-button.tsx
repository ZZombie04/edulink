"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
  label?: string;
}

export function LogoutButton({
  className,
  label = "로그아웃",
}: LogoutButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      disabled={pending}
      onClick={async () => {
        setPending(true);

        try {
          await fetch("/api/auth/logout", {
            method: "POST",
          });
        } finally {
          router.push("/");
          router.refresh();
          setPending(false);
        }
      }}
    >
      <LogOut className="h-4 w-4" />
      {pending ? "정리 중..." : label}
    </button>
  );
}
