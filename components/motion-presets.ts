// Shared easing curves so every entrance feels like part of one system.
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
// Overshoots slightly: used for "stamp slammed onto paper" moments.
export const EASE_SLAM = [0.34, 1.56, 0.64, 1] as const;

export const SHADOW_NONE = "0px 0px 0 rgba(0,0,0,0)";
export const SHADOW_REST = "5px 5px 0 rgba(0,0,0,.42)";
export const SHADOW_LIFT = "11px 13px 0 rgba(0,0,0,.5)";
