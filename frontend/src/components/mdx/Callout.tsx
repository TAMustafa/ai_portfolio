import React from "react";

type CalloutType = "info" | "success" | "warning" | "danger";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children?: React.ReactNode;
}

const palette: Record<
  CalloutType,
  { accentBorder: string; icon: React.ReactNode; titleColor: string }
> = {
  info: {
    accentBorder: "border-l-link",
    titleColor: "text-link",
    icon: (
      <svg className="w-5 h-5 text-link" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11 9h2V7h-2v2zm0 8h2v-6h-2v6zm1-16C6.48 1 2 5.48 2 11s4.48 10 10 10 10-4.48 10-10S17.52 1 12 1z" />
      </svg>
    ),
  },
  success: {
    accentBorder: "border-l-teal-600",
    titleColor: "text-teal-700",
    icon: (
      <svg className="w-5 h-5 text-teal-600" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.2l-3.5-3.5L4 14.2 9 19l12-12-1.5-1.5z" />
      </svg>
    ),
  },
  warning: {
    accentBorder: "border-l-amber-600",
    titleColor: "text-amber-700",
    icon: (
      <svg className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="currentColor">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
      </svg>
    ),
  },
  danger: {
    accentBorder: "border-l-rose-600",
    titleColor: "text-rose-700",
    icon: (
      <svg className="w-5 h-5 text-rose-600" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
    ),
  },
};

export default function Callout({ type = "info", title, children }: CalloutProps) {
  const p = palette[type];
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border border-border bg-surface p-4 border-l-4 ${p.accentBorder}`}
    >
      <div className="mt-0.5">{p.icon}</div>
      <div>
        {title ? <div className={`font-semibold ${p.titleColor}`}>{title}</div> : null}
        <div className="muted">{children}</div>
      </div>
    </div>
  );
}
