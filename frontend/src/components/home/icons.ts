import type { FC } from "react";
import {
    AlertTriangle,
    AnnotationAlert,
    Beaker01,
    Beaker02,
    BatteryCharging01,
    Droplets01,
    Feather,
    Package,
    Scissors01,
    ScissorsCut01,
    ShoppingBag01,
    ThermometerWarm,
    Tool01,
    Trash01,
    Trash03,
    Wind01,
} from "@untitledui/icons";
import type { EcoProblemKind, WasteKind } from "@/lib/types";

type Icon = FC<{ className?: string }>;

export const wasteKindIcons: Record<WasteKind, Icon> = {
    plastic: ShoppingBag01,
    glass: Beaker01,
    paper: Package,
    metal: Tool01,
    batteries: BatteryCharging01,
    textile: Scissors01,
};

export const ecoProblemIcons: Record<EcoProblemKind, Icon> = {
    illegal_dump: Trash03,
    overflowing_bins: Trash01,
    waste_burning: ThermometerWarm,
    water_pollution: Droplets01,
    air_pollution: Wind01,
    soil_contamination: Beaker02,
    illegal_logging: ScissorsCut01,
    greenery_damage: Feather,
    hazardous_waste: AlertTriangle,
    other: AnnotationAlert,
};
