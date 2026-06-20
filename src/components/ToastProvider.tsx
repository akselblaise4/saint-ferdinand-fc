"use client";

import { Toaster } from "sileo";

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        theme="light"
        offset={20}
      />
    </>
  );
}
