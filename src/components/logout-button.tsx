"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LogOut } from "lucide-react";

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
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <div className="relative inline-flex shrink-0">
      <button
        type="button"
        className={cn(
          "inline-flex min-h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b4a37] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        disabled={pending}
        onClick={async () => {
          setErrorMessage("");
          setPending(true);

          try {
            const response = await fetch("/api/auth/logout", {
              method: "POST",
            });

            if (!response.ok) {
              throw new Error("로그아웃 요청에 실패했습니다.");
            }

            router.push("/");
            router.refresh();
          } catch (error) {
            setErrorMessage(
              error instanceof Error
                ? error.message
                : "로그아웃하지 못했습니다.",
            );
          } finally {
            setPending(false);
          }
        }}
      >
        {pending ? (
          <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut aria-hidden="true" className="h-4 w-4" />
        )}
        {pending ? "정리 중" : label}
      </button>
      {errorMessage ? (
        <span
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border border-[#e4b8ae] bg-[#fff3f0] px-3 py-2 text-xs font-medium text-[#8b3328] shadow-lg"
          role="alert"
        >
          {errorMessage}
        </span>
      ) : null}
    </div>
  );
}
