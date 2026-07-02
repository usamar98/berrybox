"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useToast } from "@/components/shared/toast";

type ToastButtonProps = Omit<ButtonProps, "onClick" | "type"> & {
  message?: string;
};

export function ToastButton({
  children,
  message = "Coming soon",
  ...props
}: ToastButtonProps) {
  const { showToast } = useToast();

  return (
    <Button type="button" onClick={() => showToast(message)} {...props}>
      {children}
    </Button>
  );
}
