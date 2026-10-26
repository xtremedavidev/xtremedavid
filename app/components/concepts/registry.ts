import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export const registry: Record<string, ComponentType> = {
  galcon: dynamic(() => import("./galcon/Galcon")),
  ecolit: dynamic(() => import("./ecolit/Ecolit")),
  arbe: dynamic(() => import("./arbe/Arbe")),
  unum: dynamic(() => import("./unum/Unum")),
  truerights: dynamic(() => import("./truerights/TrueRights")),
  "truerights-light": dynamic(() => import("./truerights-light/TrueRightsLight")),
};
