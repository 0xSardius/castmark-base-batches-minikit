"use client";

import dynamic from "next/dynamic";

// Import QuickCastmarkButton with no SSR to avoid hydration issues
const QuickCastmarkButton = dynamic(
  () => import("./QuickCastmarkButton"),
  { ssr: false },
);

export default function QuickCastmarkButtonWrapper() {
  return <QuickCastmarkButton />;
}

