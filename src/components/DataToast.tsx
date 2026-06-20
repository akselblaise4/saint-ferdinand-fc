"use client";

import { useEffect } from "react";
import { sileo } from "sileo";

export default function DataToast({ fetchedAt }: { fetchedAt: string }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      sileo.success({
        title: "Datos actualizados",
        description: `Última sincronización: ${new Date(fetchedAt).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
      });
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
