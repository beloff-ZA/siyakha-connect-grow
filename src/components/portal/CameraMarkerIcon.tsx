import React from "react";
import { cameraPictogramRotation } from "@/lib/planGeometry";

/**
 * Reusable CCTV camera pictogram used everywhere a plan is rendered
 * (authenticated editor, read-only client deck, static print sheet).
 *
 * The silhouette is drawn POINTING UP at rest — mount/bracket at the bottom,
 * barrel and lens at the top — so a CSS rotation equal to the plan bearing
 * (see `cameraPictogramRotation`) aims the barrel the same way as the amber
 * field-of-view cone. Inline vector only; nothing is hotlinked.
 */
const CameraMarkerIcon: React.FC<{
  /** Saved plan bearing (`direction_deg`). 0 = up/north, increases clockwise. */
  directionDeg?: number | null;
  /** Accessible title; when omitted the glyph is decorative. */
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  strokeWidth?: number;
}> = ({ directionDeg, title, className, style, strokeWidth = 1.6 }) => {
  const rotation = cameraPictogramRotation(directionDeg);
  return (
    <svg
      viewBox="0 0 24 24"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      className={className}
      style={{
        ...style,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "50% 50%",
      }}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {title ? <title>{title}</title> : null}
      {/* Wall/ceiling mount plate and arm */}
      <path d="M9 22.2h6" />
      <path d="M12 22.2v-3.1" />
      {/* Camera body / barrel */}
      <rect x="8.1" y="7.4" width="7.8" height="11.6" rx="2.4" fill="currentColor" fillOpacity="0.14" />
      {/* Sun shield / hood over the lens */}
      <path d="M7.2 7.6c0-2.6 2.1-4.4 4.8-4.4s4.8 1.8 4.8 4.4" />
      {/* Lens */}
      <circle cx="12" cy="9.9" r="1.9" fill="currentColor" fillOpacity="0.35" />
      {/* Body detailing */}
      <path d="M9.6 15.4h4.8" />
    </svg>
  );
};

export default CameraMarkerIcon;
