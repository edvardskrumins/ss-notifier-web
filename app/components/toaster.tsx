"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#18181b",
          color: "#f4f4f5",
          border: "1px solid #3f3f46",
          borderRadius: "0.75rem",
        },
        success: {
          iconTheme: {
            primary: "#22c55e",
            secondary: "#f4f4f5",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "#f4f4f5",
          },
        },
      }}
    />
  );
}

