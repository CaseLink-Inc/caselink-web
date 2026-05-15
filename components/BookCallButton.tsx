"use client";

import { openCalendly } from "@/components/Calendly";

type Props = {
  className?: string;
  children: React.ReactNode;
};

export default function BookCallButton({ className, children }: Props) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => openCalendly()}
    >
      {children}
    </button>
  );
}
