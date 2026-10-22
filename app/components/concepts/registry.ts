import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export const registry: Record<string, ComponentType> = {
  galcon: dynamic(() => import("./galcon/Galcon")),
};
