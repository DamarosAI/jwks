/* @ds-bundle: {"format":3,"namespace":"FieldDamarosDesignSystem_4f31ac","components":[{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Eyebrow","sourcePath":"components/core/Eyebrow.jsx"},{"name":"Kbd","sourcePath":"components/core/Kbd.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Textarea","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Input.jsx"},{"name":"ReviewChip","sourcePath":"components/status/ReviewChip.jsx"},{"name":"StatusBadge","sourcePath":"components/status/StatusBadge.jsx"},{"name":"TrustPill","sourcePath":"components/status/TrustPill.jsx"},{"name":"Stepper","sourcePath":"components/workflow/Stepper.jsx"}],"sourceHashes":{"components/core/Button.jsx":"ac54e0707751","components/core/Card.jsx":"34b9d6fae95e","components/core/Eyebrow.jsx":"c23655fd3aae","components/core/Kbd.jsx":"794aa626e38e","components/forms/Input.jsx":"7c3ddd4fff6f","components/status/ReviewChip.jsx":"b2da32c7ef8d","components/status/StatusBadge.jsx":"76b3051a651b","components/status/TrustPill.jsx":"f387618fbb42","components/workflow/Stepper.jsx":"c5f845ce4ce3","ui_kits/console/ConsoleApp.jsx":"8b5a1c78c3da","ui_kits/node/NodeApp.jsx":"610d62ffb7db","ui_kits/node/NodeKit.jsx":"64bbe9aa3e4a","ui_kits/node/NodeResolve.jsx":"cdc95e8d87b3","ui_kits/node/NodeScreening.jsx":"f6065ac3a2ad"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.FieldDamarosDesignSystem_4f31ac = window.FieldDamarosDesignSystem_4f31ac || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — the Damaros action primitive.
 * Pill-shaped, mono, uppercase, tactile gradient fills. Reads as a
 * clinical instrument trigger, not an admin terminal button.
 * Tones: primary (steel) · secondary · danger · outline · default.
 */
function Button({
  tone = "default",
  variant,
  size = "md",
  loading = false,
  disabled,
  shortcut,
  children,
  style,
  ...props
}) {
  const effective = variant ?? tone;
  const sizes = {
    sm: {
      padding: "5px 10px",
      fontSize: 11
    },
    md: {
      padding: "8px 13px",
      fontSize: 12
    },
    lg: {
      padding: "11px 17px",
      fontSize: 13
    }
  };
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: "var(--radius-pill)",
    border: "1px solid rgba(148,163,184,0.18)",
    color: "var(--fg-primary)",
    background: "linear-gradient(180deg, rgba(19,28,41,0.94), rgba(11,16,24,0.92))",
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.03em",
    textTransform: "uppercase",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 0 rgba(0,0,0,0.28)",
    transition: "transform 140ms var(--ease-feedback), border-color 140ms ease, background 140ms ease, box-shadow 140ms ease, color 140ms ease",
    whiteSpace: "nowrap",
    ...sizes[size]
  };
  const tones = {
    default: {},
    primary: {
      background: "linear-gradient(180deg, color-mix(in srgb, var(--accent) 66%, #c3d2e5 34%), color-mix(in srgb, var(--accent) 92%, #7f93ad 8%))",
      color: "#06101b",
      borderColor: "color-mix(in srgb, var(--accent) 42%, rgba(255,255,255,0.12))",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28), 0 10px 24px rgba(20,46,82,0.2)"
    },
    secondary: {
      background: "linear-gradient(180deg, rgba(23,34,49,0.92), rgba(12,18,27,0.92))",
      borderColor: "rgba(148,163,184,0.14)"
    },
    danger: {
      background: "linear-gradient(180deg, rgba(87,27,28,0.88), rgba(38,14,15,0.92))",
      borderColor: "rgba(248,113,113,0.28)",
      color: "var(--ink-cold)"
    },
    outline: {
      background: "transparent",
      borderColor: "rgba(148,163,184,0.14)"
    }
  };
  const [hover, setHover] = React.useState(false);
  const hoverStyle = hover && !disabled && !loading ? {
    transform: "translateY(-1px)",
    borderColor: "color-mix(in srgb, var(--accent) 48%, rgba(148,163,184,0.2))"
  } : null;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled || loading,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      ...base,
      ...tones[effective],
      ...hoverStyle,
      ...style
    }
  }, props), loading ? /*#__PURE__*/React.createElement(Spinner, null) : null, /*#__PURE__*/React.createElement("span", null, children), shortcut != null && !loading ? /*#__PURE__*/React.createElement("kbd", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "0.85em",
      padding: "1px 5px",
      borderRadius: 3,
      border: "1px solid rgba(148,163,184,0.28)",
      opacity: 0.8
    }
  }, shortcut) : null);
}
function Spinner() {
  return /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      display: "inline-block",
      width: "0.85em",
      height: "0.85em",
      border: "2px solid color-mix(in srgb, var(--fg-secondary) 35%, transparent)",
      borderTopColor: "var(--accent)",
      borderRadius: "50%",
      animation: "fieldSpin 0.7s linear infinite"
    }
  });
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Card — the Damaros glass panel. Faint stone-blue inset ring over a
 * near-black gradient, 4px blur. Variants:
 *  · glass    — default brand panel (16px radius)
 *  · panel    — tighter operator panel (8px radius)
 *  · flagship — the proof / Replay beat (cold-white ring, faint glow)
 */
function Card({
  variant = "glass",
  interactive = false,
  children,
  style,
  ...props
}) {
  const [hover, setHover] = React.useState(false);
  const variants = {
    glass: {
      borderRadius: "var(--radius-card)",
      background: "var(--glass-bg)",
      boxShadow: "var(--glass-ring)"
    },
    panel: {
      borderRadius: "var(--radius-lg)",
      background: "var(--field-surface)",
      boxShadow: "inset 0 0 0 1px var(--border)"
    },
    flagship: {
      borderRadius: "var(--radius-card)",
      background: "linear-gradient(180deg, rgba(232,236,240,0.09), rgba(169,192,214,0.025)), rgba(8,11,17,0.6)",
      boxShadow: "inset 0 0 0 1px rgba(232,236,240,0.3), 0 0 30px rgba(169,192,214,0.07)"
    }
  };
  const hoverShadow = {
    glass: "var(--glass-ring), var(--shadow-lift)",
    panel: "inset 0 0 0 1px var(--border-strong), var(--shadow-lift)",
    flagship: "inset 0 0 0 1px rgba(232,236,240,0.5), var(--shadow-lift)"
  };
  const lift = interactive && hover ? {
    transform: "translateY(-2px)",
    boxShadow: hoverShadow[variant]
  } : null;
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => interactive && setHover(true),
    onMouseLeave: () => interactive && setHover(false),
    style: {
      padding: "18px 20px",
      WebkitBackdropFilter: "var(--glass-blur)",
      backdropFilter: "var(--glass-blur)",
      transition: "box-shadow 200ms var(--ease), transform 200ms var(--ease)",
      ...variants[variant],
      ...lift,
      ...style
    }
  }, props), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Eyebrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Eyebrow — a tracked, uppercase label. The R0 "Command" register.
 * Used above titles, on section heads, and as field labels.
 */
function Eyebrow({
  children,
  tone = "muted",
  style,
  ...props
}) {
  const colors = {
    muted: "color-mix(in srgb, var(--ink-cold) 56%, transparent)",
    steel: "var(--ink-steel)",
    cold: "var(--ink-cold)"
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-block",
      fontFamily: "var(--font-body)",
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: colors[tone] ?? colors.muted,
      ...style
    }
  }, props), children);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/core/Kbd.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Kbd — a single keyboard key cap, mono, for shortcut hints. */
function Kbd({
  children,
  style,
  ...props
}) {
  return /*#__PURE__*/React.createElement("kbd", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 18,
      padding: "1px 6px",
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      lineHeight: 1.4,
      color: "var(--ink-quiet)",
      background: "rgba(6,10,17,0.6)",
      border: "1px solid var(--border)",
      borderRadius: 4,
      boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.4)",
      ...style
    }
  }, props), children);
}
Object.assign(__ds_scope, { Kbd });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Kbd.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const fieldBase = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border-subtle)",
  background: "rgba(6,10,17,0.85)",
  color: "var(--fg-primary)",
  padding: "8px 10px",
  fontFamily: "var(--font-body)",
  fontSize: 13,
  transition: "border-color 120ms ease, box-shadow 120ms ease, background-color 120ms ease",
  outline: "none"
};
function useFocusRing() {
  const [focus, setFocus] = React.useState(false);
  const ring = focus ? {
    borderColor: "var(--focus)",
    boxShadow: "0 0 0 1px color-mix(in srgb, var(--focus) 60%, transparent)"
  } : null;
  return {
    ring,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false)
  };
}

/** Input — dark instrument text field. Mono placeholder. Optional error / helper. */
function Input({
  error,
  helperText,
  style,
  ...props
}) {
  const {
    ring,
    onFocus,
    onBlur
  } = useFocusRing();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    onFocus: onFocus,
    onBlur: onBlur,
    "aria-invalid": error ? true : undefined,
    style: {
      ...fieldBase,
      ...(error ? {
        borderColor: "color-mix(in srgb, var(--state-fail) 60%, var(--border))"
      } : null),
      ...ring,
      ...style
    }
  }, props)), helperText && !error ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--ink-faint)"
    }
  }, helperText) : null, error ? /*#__PURE__*/React.createElement("p", {
    role: "alert",
    style: {
      margin: 0,
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--state-fail)"
    }
  }, error) : null);
}

/** Textarea — multi-line variant. */
function Textarea({
  style,
  ...props
}) {
  const {
    ring,
    onFocus,
    onBlur
  } = useFocusRing();
  return /*#__PURE__*/React.createElement("textarea", _extends({
    onFocus: onFocus,
    onBlur: onBlur,
    style: {
      ...fieldBase,
      minHeight: 100,
      resize: "vertical",
      ...ring,
      ...style
    }
  }, props));
}

/** Select — native select styled as a Field instrument control. */
function Select({
  children,
  style,
  ...props
}) {
  const {
    ring,
    onFocus,
    onBlur
  } = useFocusRing();
  return /*#__PURE__*/React.createElement("select", _extends({
    onFocus: onFocus,
    onBlur: onBlur,
    style: {
      ...fieldBase,
      appearance: "none",
      cursor: "pointer",
      ...ring,
      ...style
    }
  }, props), children);
}
Object.assign(__ds_scope, { Input, Textarea, Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/status/ReviewChip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ReviewChip — a REVIEW-cause chip with a trailing resolve CTA. Amber by
 * default; the driver families recolor it. Used in worklists and the
 * Resolve workspace to name *why* a case routed to a human.
 */
function ReviewChip({
  label,
  cta = "Resolve",
  driver,
  onResolve,
  style,
  ...props
}) {
  const driverColor = {
    missing: "var(--driver-missing)",
    conflict: "var(--driver-conflict)",
    stale: "var(--driver-stale)",
    "narrative-only": "var(--driver-narrative-only)",
    unsupported: "var(--driver-unsupported)"
  }[driver] ?? "var(--state-review)";
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "2px 4px 2px 10px",
      background: `color-mix(in srgb, ${driverColor} 8%, transparent)`,
      border: `1px solid color-mix(in srgb, ${driverColor} 32%, transparent)`,
      color: "var(--ink-cold)",
      borderRadius: "var(--radius-pill)",
      fontFamily: "var(--font-body)",
      fontSize: 12,
      whiteSpace: "nowrap",
      maxWidth: "100%",
      ...style
    }
  }, props), /*#__PURE__*/React.createElement("span", {
    style: {
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, label), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onResolve,
    style: {
      display: "inline-flex",
      alignItems: "center",
      padding: "1px 10px",
      background: driverColor,
      color: "#0a0d12",
      border: "none",
      borderRadius: "var(--radius-pill)",
      fontFamily: "var(--font-body)",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.02em",
      cursor: "pointer"
    }
  }, cta));
}
Object.assign(__ds_scope, { ReviewChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/status/ReviewChip.jsx", error: String((e && e.message) || e) }); }

// components/status/StatusBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * StatusBadge — the deterministic disposition chip. Icon + text + color
 * (never color-only). The verdict taxonomy: PASS / REVIEW / FAIL / BLOCKED,
 * plus GOVERNED for AI-provenance / ceremony states.
 */
function StatusBadge({
  status = "REVIEW",
  size = "md",
  children,
  style,
  ...props
}) {
  const meta = {
    PASS: {
      color: "var(--state-pass)",
      label: "Pass"
    },
    REVIEW: {
      color: "var(--state-review)",
      label: "Review"
    },
    FAIL: {
      color: "var(--state-fail)",
      label: "Fail"
    },
    BLOCKED: {
      color: "var(--ink-dim)",
      label: "Blocked"
    },
    GOVERNED: {
      color: "var(--state-governed)",
      label: "Governed"
    }
  }[status] ?? {
    color: "var(--state-review)",
    label: status
  };
  const sz = size === "sm" ? {
    padding: "1px 7px",
    fontSize: 10,
    gap: 5
  } : {
    padding: "2px 9px",
    fontSize: 11,
    gap: 6
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    role: "status",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: sz.gap,
      padding: sz.padding,
      borderRadius: "var(--radius-sm)",
      fontFamily: "var(--font-body)",
      fontSize: sz.fontSize,
      fontWeight: 600,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
      color: meta.color,
      border: `1px solid color-mix(in srgb, ${meta.color} 45%, var(--border))`,
      background: `color-mix(in srgb, ${meta.color} 10%, transparent)`,
      ...style
    }
  }, props), /*#__PURE__*/React.createElement(DispositionIcon, {
    status: status
  }), /*#__PURE__*/React.createElement("span", null, children ?? meta.label));
}
function DispositionIcon({
  status
}) {
  const common = {
    width: 13,
    height: 13,
    viewBox: "0 0 16 16",
    fill: "none",
    "aria-hidden": true
  };
  const s = {
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };
  switch (status) {
    case "PASS":
      return /*#__PURE__*/React.createElement("svg", common, /*#__PURE__*/React.createElement("circle", _extends({
        cx: "8",
        cy: "8",
        r: "7"
      }, s)), /*#__PURE__*/React.createElement("path", _extends({
        d: "M4.75 8.25 7 10.5 11.25 5.5"
      }, s)));
    case "FAIL":
      return /*#__PURE__*/React.createElement("svg", common, /*#__PURE__*/React.createElement("circle", _extends({
        cx: "8",
        cy: "8",
        r: "7"
      }, s)), /*#__PURE__*/React.createElement("path", _extends({
        d: "M6 6 10 10M10 6 6 10"
      }, s)));
    case "BLOCKED":
      return /*#__PURE__*/React.createElement("svg", common, /*#__PURE__*/React.createElement("rect", _extends({
        x: "4",
        y: "7",
        width: "8",
        height: "7",
        rx: "1"
      }, s)), /*#__PURE__*/React.createElement("path", _extends({
        d: "M6 7V5a2 2 0 0 1 4 0v2"
      }, s)));
    case "GOVERNED":
      return /*#__PURE__*/React.createElement("svg", common, /*#__PURE__*/React.createElement("circle", _extends({
        cx: "8",
        cy: "8",
        r: "2.1"
      }, s)), /*#__PURE__*/React.createElement("circle", _extends({
        cx: "8",
        cy: "8",
        r: "6.6"
      }, s)));
    case "REVIEW":
    default:
      return /*#__PURE__*/React.createElement("svg", common, /*#__PURE__*/React.createElement("circle", _extends({
        cx: "8",
        cy: "8",
        r: "7"
      }, s)), /*#__PURE__*/React.createElement("path", _extends({
        d: "M8 4.5V9"
      }, s)), /*#__PURE__*/React.createElement("circle", {
        cx: "8",
        cy: "11.25",
        r: "0.75",
        fill: "currentColor"
      }));
  }
}
Object.assign(__ds_scope, { StatusBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/status/StatusBadge.jsx", error: String((e && e.message) || e) }); }

// components/status/TrustPill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * TrustPill — a small capsule for trust/guarantee state in trust strips
 * and headers. tone: ok · warn · muted. Optional leading dot.
 */
function TrustPill({
  tone = "muted",
  dot = true,
  children,
  style,
  ...props
}) {
  const tones = {
    ok: {
      color: "var(--state-pass)",
      bg: "color-mix(in srgb, var(--state-pass) 14%, transparent)",
      border: "currentColor"
    },
    warn: {
      color: "var(--state-review)",
      bg: "color-mix(in srgb, var(--state-review) 14%, transparent)",
      border: "currentColor"
    },
    steel: {
      color: "var(--ink-steel)",
      bg: "color-mix(in srgb, var(--ink-steel) 12%, transparent)",
      border: "currentColor"
    },
    muted: {
      color: "var(--fg-secondary)",
      bg: "color-mix(in srgb, var(--fg-secondary) 8%, transparent)",
      border: "var(--border)"
    }
  }[tone];
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "1px 9px",
      borderRadius: "var(--radius-pill)",
      fontFamily: "var(--font-body)",
      fontSize: 10.5,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: tones.color,
      background: tones.bg,
      border: `1px solid ${tones.border}`,
      ...style
    }
  }, props), dot ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 5,
      height: 5,
      borderRadius: "50%",
      background: "currentColor",
      flex: "none"
    }
  }) : null, children);
}
Object.assign(__ds_scope, { TrustPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/status/TrustPill.jsx", error: String((e && e.message) || e) }); }

// components/workflow/Stepper.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Stepper — the execution spine as clean tabs.
 * Protocol · Evidence · Screening · Resolve · Replay.
 * Equal-weight tabs (not a sequential checklist) — the spine isn't always
 * walked in order. The active tab carries a steel underline; the rest stay
 * quiet. No connector lines, no numbered checkboxes, no overflow scrollbar.
 */
const SPINE = ["Protocol", "Evidence", "Screening", "Resolve", "Replay"];
function Tab({
  label,
  active,
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "tab",
    "aria-selected": active,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: "relative",
      appearance: "none",
      border: "none",
      background: "transparent",
      padding: "11px 18px 12px",
      fontFamily: "var(--font-display)",
      fontSize: 13.5,
      fontWeight: active ? 600 : 500,
      letterSpacing: "-0.01em",
      whiteSpace: "nowrap",
      cursor: onClick ? "pointer" : "default",
      color: active ? "var(--ink-cold)" : hover ? "var(--ink-quiet)" : "color-mix(in srgb, var(--ink-cold) 52%, transparent)",
      transition: "color 140ms var(--ease)"
    }
  }, label, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      position: "absolute",
      left: 10,
      right: 10,
      bottom: -1,
      height: 2,
      borderRadius: 2,
      background: active ? "var(--accent)" : hover ? "color-mix(in srgb, var(--ink-cold) 18%, transparent)" : "transparent",
      boxShadow: active ? "0 0 10px color-mix(in srgb, var(--accent) 55%, transparent)" : "none",
      transition: "background 140ms var(--ease)"
    }
  }));
}
function Stepper({
  steps = SPINE,
  current = 0,
  onStep,
  style,
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 2,
      padding: "0 6px",
      background: "var(--bg-surface)",
      borderBottom: "1px solid var(--border)",
      fontFamily: "var(--font-display)",
      ...style
    }
  }, props), steps.map((label, i) => /*#__PURE__*/React.createElement(Tab, {
    key: label,
    label: label,
    active: i === current,
    onClick: onStep ? () => onStep(i) : undefined
  })));
}
Object.assign(__ds_scope, { Stepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/workflow/Stepper.jsx", error: String((e && e.message) || e) }); }

// ui_kits/console/ConsoleApp.jsx
try { (() => {
/* Field UI Kit — Console (Site-Network Console) · Damaros Eye command map
 * The site network's command center: one network watching its own sites across the
 * country, each running one or more Damaros trials. Damaros Eye surfaces where
 * execution is stuck — criterion friction, amendment pressure, evidence gaps,
 * capacity — so network ops can act before a site falls behind.ap — every site is a severity-graded marker (healthy /
 * review burden / critical). The Eye timeline is the live signal feed. The one
 * primary action is "Open Signal" → it narrows the field to the affected sites,
 * the first step of the loop: Console sees friction → Node resolves → Replay
 * proves → Console updates. Permissioned, PHI-free: Console sees sites, never
 * patients.
 */
const DS = window.FieldDamarosDesignSystem_4f31ac;
const {
  Button
} = DS;

/* ---- Network (synthetic) ---- */
const SITES = [{
  id: "002",
  name: "Meridian Cancer Center",
  city: "Boston, MA",
  region: "Northeast",
  lng: -71.06,
  lat: 42.36,
  sev: 1,
  cat: "enroll",
  review: 1,
  cand: 1,
  ready: 0.92,
  amend: false
}, {
  id: "005",
  name: "Front Range Oncology",
  city: "Denver, CO",
  region: "Mountain",
  lng: -104.99,
  lat: 39.74,
  sev: 4,
  cat: "amend",
  review: 3,
  cand: 1,
  ready: 0.74,
  amend: true
}, {
  id: "008",
  name: "Gulf Coast Hematology",
  city: "Houston, TX",
  region: "South",
  lng: -95.37,
  lat: 29.76,
  sev: 3,
  cat: "ecog",
  review: 2,
  cand: 0,
  ready: 0.81,
  amend: false
}, {
  id: "011",
  name: "Lakeshore Clinical",
  city: "Chicago, IL",
  region: "Midwest",
  lng: -87.63,
  lat: 41.88,
  sev: 5,
  cat: "ecog",
  review: 5,
  cand: 1,
  ready: 0.58,
  amend: true
}, {
  id: "014",
  name: "Cascade Oncology",
  city: "Portland, OR",
  region: "West",
  lng: -122.68,
  lat: 45.52,
  sev: 4,
  cat: "ecog",
  review: 4,
  cand: 2,
  ready: 0.69,
  amend: false,
  node: true
}, {
  id: "019",
  name: "Sierra Vista Health",
  city: "Sacramento, CA",
  region: "West",
  lng: -121.49,
  lat: 38.58,
  sev: 1,
  cat: "enroll",
  review: 1,
  cand: 2,
  ready: 0.88,
  amend: false
}, {
  id: "023",
  name: "Piedmont Trials Unit",
  city: "Atlanta, GA",
  region: "South",
  lng: -84.39,
  lat: 33.75,
  sev: 3,
  cat: "evidence",
  review: 2,
  cand: 0,
  ready: 0.63,
  amend: false
}, {
  id: "027",
  name: "Harbor Point Oncology",
  city: "Seattle, WA",
  region: "West",
  lng: -122.33,
  lat: 47.61,
  sev: 2,
  cat: "enroll",
  review: 2,
  cand: 1,
  ready: 0.79,
  amend: false
}, {
  id: "031",
  name: "Great Lakes Cancer",
  city: "Detroit, MI",
  region: "Midwest",
  lng: -83.05,
  lat: 42.33,
  sev: 5,
  cat: "amend",
  review: 6,
  cand: 0,
  ready: 0.41,
  amend: true
}, {
  id: "036",
  name: "Rio Grande Clinical",
  city: "Albuquerque, NM",
  region: "Mountain",
  lng: -106.65,
  lat: 35.08,
  sev: 1,
  cat: "enroll",
  review: 1,
  cand: 2,
  ready: 0.85,
  amend: false
}, {
  id: "040",
  name: "Blue Ridge Research",
  city: "Asheville, NC",
  region: "South",
  lng: -82.55,
  lat: 35.60,
  sev: 2,
  cat: "ecog",
  review: 2,
  cand: 1,
  ready: 0.72,
  amend: false
}, {
  id: "044",
  name: "Coastal Carolina Onc",
  city: "Charleston, SC",
  region: "South",
  lng: -79.93,
  lat: 32.78,
  sev: 3,
  cat: "evidence",
  review: 1,
  cand: 0,
  ready: 0.66,
  amend: false
}];

/* Other Damaros sites — in good standing but not yet in this network. If a
 * candidate site opts into network discovery, its Node instance emits PHI-free,
 * site-governed EXECUTION telemetry (never model-generated, never patient-level
 * identities).
 * `signals`: protocol-fit coverage, evidence connectivity, throughput, review
 * latency, replay coverage, and a clinician-confirmed (not modeled) count. */
const PROSPECTS = [{
  id: "P01",
  name: "Nashville Cancer Institute",
  city: "Nashville, TN",
  region: "South",
  lng: -86.78,
  lat: 36.16,
  prospect: true,
  signals: {
    fit: "33 / 36",
    ev: "Epic · labs <14d · molecular live",
    screen: "168 / 30d · 2.0d median",
    review: "1.3d median · 1 open",
    replay: "97%",
    confirmed: 5
  }
}, {
  id: "P02",
  name: "Heartland Oncology",
  city: "Kansas City, MO",
  region: "Midwest",
  lng: -94.58,
  lat: 39.10,
  prospect: true,
  signals: {
    fit: "28 / 36",
    ev: "Cerner · labs <14d · molecular pending",
    screen: "94 / 30d · 3.4d median",
    review: "2.1d median · 3 open",
    replay: "91%",
    confirmed: 2
  }
}, {
  id: "P03",
  name: "Sonoran Cancer Center",
  city: "Phoenix, AZ",
  region: "Mountain",
  lng: -112.07,
  lat: 33.45,
  prospect: true,
  signals: {
    fit: "31 / 36",
    ev: "Epic · labs <14d · molecular live",
    screen: "142 / 30d · 2.3d median",
    review: "1.6d median · 2 open",
    replay: "95%",
    confirmed: 4
  }
}, {
  id: "P04",
  name: "North Star Hematology",
  city: "Minneapolis, MN",
  region: "Midwest",
  lng: -93.27,
  lat: 44.98,
  prospect: true,
  signals: {
    fit: "24 / 36",
    ev: "Epic · labs stale · molecular live",
    screen: "61 / 30d · 4.1d median",
    review: "3.0d median · 4 open",
    replay: "88%",
    confirmed: 1
  }
}, {
  id: "P05",
  name: "Bayshore Oncology",
  city: "Tampa, FL",
  region: "South",
  lng: -82.46,
  lat: 27.95,
  prospect: true,
  signals: {
    fit: "32 / 36",
    ev: "Epic · labs <14d · molecular live",
    screen: "156 / 30d · 2.2d median",
    review: "1.4d median · 1 open",
    replay: "96%",
    confirmed: 4
  }
}, {
  id: "P06",
  name: "Wasatch Clinical",
  city: "Salt Lake City, UT",
  region: "Mountain",
  lng: -111.89,
  lat: 40.76,
  prospect: true,
  signals: {
    fit: "22 / 36",
    ev: "athenahealth · labs <14d · molecular pending",
    screen: "48 / 30d · 4.6d median",
    review: "3.4d median · 5 open",
    replay: "84%",
    confirmed: 1
  }
}];
const CATEGORIES = {
  ecog: {
    label: "Criterion friction",
    color: "#f2566e"
  },
  amend: {
    label: "Amendment pressure",
    color: "#8c7cf0"
  },
  evidence: {
    label: "Evidence gaps",
    color: "#d9a23e"
  },
  enroll: {
    label: "Execution capacity",
    color: "#5bb98c"
  }
};
const SIGNALS = [{
  id: "g1",
  cat: "ecog",
  sev: 5,
  ageH: 9,
  status: "Rising",
  head: "ECOG conflicts rising across 5 sites",
  scope: "DMR-204 · I-4.2 ECOG 0–1 within 14d",
  affected: "11 cases · 5 sites",
  owner: "PI / Sub-I",
  started: "8h ago",
  updated: "18m ago",
  sites: ["011", "014", "008", "040", "023"]
}, {
  id: "g2",
  cat: "amend",
  sev: 4,
  ageH: 12,
  status: "Action needed",
  head: "Amendment A3 invalidates screening states",
  scope: "DMR-204 · Amendment A3",
  affected: "18 states · 3 sites",
  owner: "System + PI",
  started: "12h ago",
  updated: "11h ago",
  sites: ["005", "011", "031"]
}, {
  id: "g3",
  cat: "evidence",
  sev: 4,
  ageH: 14,
  status: "Open",
  head: "Stale lab feeds blocking screening",
  scope: "HEM-072 · HL7 lab freshness",
  affected: "8 screenings · 5 sites",
  owner: "Coordinator",
  started: "14h ago",
  updated: "13h ago",
  sites: ["023", "044", "014", "031", "008"]
}, {
  id: "g4",
  cat: "enroll",
  sev: 2,
  ageH: 25,
  status: "Ready",
  head: "Site 014 ready for trial activation",
  scope: "ONC-118 · activation readiness",
  affected: "tier-1 health · 1 site",
  owner: "Network ops",
  started: "1d ago",
  updated: "22h ago",
  sites: ["014", "002", "019", "036"]
}, {
  id: "g5",
  cat: "ecog",
  sev: 3,
  ageH: 80,
  status: "Open",
  head: "Performance-status conflicts at Lakeshore",
  scope: "ONC-118 · I-4.2 ECOG",
  affected: "9 cases · 1 site",
  owner: "PI / Sub-I",
  started: "3d ago",
  updated: "2d ago",
  sites: ["011"]
}, {
  id: "g6",
  cat: "enroll",
  sev: 2,
  ageH: 200,
  status: "Ready",
  head: "4 candidate sites with strong execution health",
  scope: "Network growth · candidate sites",
  affected: "tier-1 execution health · 4 sites",
  owner: "Network ops",
  started: "8d ago",
  updated: "7d ago",
  sites: ["P01", "P03", "P05", "P02"]
}];

/* Healthy → review → critical (clinically restrained, brand palette) */
function sevColor(s) {
  return s >= 4 ? "#f2566e" : s >= 3 ? "#d9a23e" : s === 2 ? "#c79234" : "#5bb98c";
}
function sevSize(s) {
  return 11 + s * 2.6;
}
function Glyph({
  cat,
  size = 13
}) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };
  switch (cat) {
    case "ecog":
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M1.5 8h2.5l1.5-4 2.5 8 1.5-4H14.5"
      }));
    case "amend":
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M8 1.8 14 8l-6 6.2L2 8z"
      }));
    case "evidence":
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("path", {
        d: "M2.5 5.2 8 2.5l5.5 2.7L8 8z"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M2.5 8 8 10.7 13.5 8"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M2.5 10.8 8 13.5l5.5-2.7"
      }));
    case "enroll":
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("circle", {
        cx: "6",
        cy: "5.5",
        r: "2.4"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M2 13.5c0-2.2 1.8-3.6 4-3.6"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M10.5 9.5 12 11l2.5-3"
      }));
    default:
      return /*#__PURE__*/React.createElement("svg", p, /*#__PURE__*/React.createElement("circle", {
        cx: "8",
        cy: "8",
        r: "3"
      }));
  }
}

/* ---- Map ---- */
function NetworkMap({
  dims,
  markers
}) {
  const {
    w,
    h,
    statePaths
  } = dims;
  return /*#__PURE__*/React.createElement("svg", {
    width: w,
    height: h,
    style: {
      position: "absolute",
      inset: 0,
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("rect", {
    x: 0,
    y: 0,
    width: w,
    height: h,
    fill: "#050608"
  }), statePaths.map((d, i) => /*#__PURE__*/React.createElement("path", {
    key: i,
    d: d,
    fill: "#10141a",
    stroke: "rgba(169,192,214,0.09)",
    strokeWidth: 0.6
  })), markers.filter(m => m.s.sev >= 5).map(m => markers.filter(n => n.s.cat === m.s.cat && n.s.id !== m.s.id).map(n => /*#__PURE__*/React.createElement("line", {
    key: m.s.id + n.s.id,
    x1: m.x,
    y1: m.y,
    x2: n.x,
    y2: n.y,
    stroke: "rgba(242,86,110,0.09)",
    strokeWidth: 0.6
  }))));
}
function siteMatch(s, q) {
  if (!q) return true;
  const t = q.toLowerCase();
  return (s.name + " " + (s.city || "") + " " + s.id + " " + (s.region || "")).toLowerCase().includes(t);
}
function Markers({
  markers,
  threshold,
  filterCat,
  region,
  scope,
  q,
  activeSites,
  selected,
  onSelect,
  requested
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none"
    }
  }, markers.map(({
    s,
    x,
    y
  }) => {
    const isSelP = selected === s.id;
    const litP = !activeSites || activeSites.has(s.id);
    const regionOK = !region || s.region === region;
    const qOK = siteMatch(s, q);
    if (s.prospect) {
      const req = requested.has(s.id);
      const show = scope !== "trial" && !filterCat && threshold < 3 && regionOK && qOK;
      return /*#__PURE__*/React.createElement("div", {
        key: s.id,
        onClick: () => onSelect(isSelP ? null : s.id),
        title: `${s.name} — candidate · not in network`,
        style: {
          position: "absolute",
          left: x,
          top: y,
          transform: "translate(-50%,-50%)",
          pointerEvents: show ? "auto" : "none",
          opacity: show ? litP ? 1 : 0.16 : 0,
          transition: "opacity 220ms var(--ease)",
          cursor: "pointer",
          zIndex: isSelP ? 8 : 1
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "block",
          width: 13,
          height: 13,
          borderRadius: "50%",
          background: req ? "#a9c0d6" : "rgba(169,192,214,0.12)",
          border: `1.5px ${req ? "solid" : "dashed"} color-mix(in srgb, #a9c0d6 ${req ? 95 : 58}%, transparent)`,
          boxShadow: isSelP ? "0 0 0 5px rgba(169,192,214,0.32)" : "0 1px 5px rgba(0,0,0,0.5)",
          transition: "all 160ms var(--ease)"
        }
      }));
    }
    const visible = s.sev >= threshold && (!filterCat || filterCat === s.cat) && regionOK && scope !== "network" && qOK;
    const lit = !activeSites || activeSites.has(s.id);
    const color = sevColor(s.sev);
    const size = sevSize(s.sev);
    const isSel = selected === s.id;
    const halo = isSel ? "0 0 0 5px rgba(169,192,214,0.32)" : s.amend ? "0 0 0 3px color-mix(in srgb, #8c7cf0 55%, transparent)" : "0 0 0 0 transparent";
    return /*#__PURE__*/React.createElement("div", {
      key: s.id,
      onClick: () => onSelect(isSel ? null : s.id),
      title: `${s.name} — ${s.review} REVIEW`,
      style: {
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%,-50%)",
        pointerEvents: visible ? "auto" : "none",
        opacity: visible ? lit ? 1 : 0.16 : 0,
        transition: "opacity 220ms var(--ease)",
        cursor: "pointer",
        zIndex: isSel ? 8 : s.sev
      }
    }, s.sev >= 5 && lit ? /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        left: "50%",
        top: "50%",
        width: size + 4,
        height: size + 4,
        marginLeft: -(size + 4) / 2,
        marginTop: -(size + 4) / 2,
        borderRadius: "50%",
        background: color,
        animation: "eyePulse 2.8s ease-out infinite"
      }
    }) : null, /*#__PURE__*/React.createElement("span", {
      style: {
        position: "relative",
        display: "block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        border: "1.5px solid rgba(5,7,10,0.9)",
        boxShadow: `${halo}, 0 1px 7px rgba(0,0,0,0.65)`,
        transition: "box-shadow 160ms var(--ease)"
      }
    }));
  }));
}
function SitePopover({
  m,
  requested,
  onRequest,
  onClose
}) {
  if (!m) return null;
  const {
    s,
    x,
    y
  } = m;
  if (s.prospect) {
    const req = requested.has(s.id);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        left: x,
        top: y - 19,
        transform: "translate(-50%,-100%)",
        width: 252,
        background: "#0b0f14",
        border: "1px solid var(--border)",
        borderRadius: 6,
        boxShadow: "0 18px 44px rgba(0,0,0,0.6)",
        zIndex: 20,
        fontFamily: "var(--font-body)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "12px 14px 10px",
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--ink-steel)"
      }
    }, "Damaros network"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13.5,
        fontWeight: 600,
        color: "var(--ink-cold)",
        marginTop: 3
      }
    }, s.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: "var(--ink-dim)",
        marginTop: 1
      }
    }, s.city, " \xB7 ", s.region), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: "var(--ink-faint)",
        marginTop: 6
      }
    }, "Candidate site \xB7 not in network")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "11px 14px",
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--ink-dim)",
        marginBottom: 9
      }
    }, "Site-shared signals \xB7 opt-in"), [["Protocol fit", s.signals.fit + " criteria"], ["Evidence", s.signals.ev], ["Throughput", s.signals.screen], ["Review", s.signals.review], ["Replay", s.signals.replay + " verified"], ["Confirmed", s.signals.confirmed + " · PHI-free count"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        display: "grid",
        gridTemplateColumns: "68px 1fr",
        gap: 10,
        padding: "3px 0",
        alignItems: "baseline"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 9.5,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        color: "var(--ink-dim)"
      }
    }, k), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: k === "Confirmed" ? "#5bb98c" : "var(--ink-quiet)"
      }
    }, v))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: 9.5,
        color: "rgba(169,192,214,0.4)",
        marginTop: 9,
        lineHeight: 1.4
      }
    }, "Node execution telemetry \xB7 site-governed")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 10
      }
    }, req ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 10px",
        borderRadius: 5,
        background: "color-mix(in srgb, #5bb98c 9%, transparent)",
        border: "1px solid color-mix(in srgb, #5bb98c 32%, transparent)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "#5bb98c",
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--ink-quiet)"
      }
    }, "Invite sent \xB7 site review pending")) : /*#__PURE__*/React.createElement(Button, {
      tone: "primary",
      size: "sm",
      style: {
        width: "100%"
      },
      onClick: () => onRequest(s.id)
    }, "Invite to network")));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: x,
      top: y - sevSize(s.sev) / 2 - 12,
      transform: "translate(-50%,-100%)",
      width: 252,
      background: "#0b0f14",
      border: "1px solid var(--border)",
      borderRadius: 6,
      boxShadow: "0 18px 44px rgba(0,0,0,0.6)",
      zIndex: 20,
      fontFamily: "var(--font-body)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 14px 10px",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: sevColor(s.sev)
    }
  }, "SITE ", s.id), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      color: "var(--ink-dim)",
      textTransform: "uppercase",
      letterSpacing: "0.06em"
    }
  }, CATEGORIES[s.cat].label)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--ink-cold)",
      marginTop: 3
    }
  }, s.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--ink-dim)",
      marginTop: 1
    }
  }, s.city, " \xB7 ", s.region)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, [["Ready", `${Math.round(s.ready * 100)}%`], ["Review", s.review], ["Pressure", `${s.sev}/5`]].map(([k, v], i) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      padding: "9px 12px",
      borderLeft: i ? "1px solid var(--border-subtle)" : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 15,
      color: "var(--ink-cold)"
    }
  }, v), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9.5,
      color: "var(--ink-dim)",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginTop: 1
    }
  }, k)))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10
    }
  }, /*#__PURE__*/React.createElement(Button, {
    tone: s.node ? "primary" : "outline",
    size: "sm",
    style: {
      width: "100%"
    },
    onClick: onClose
  }, "Request authorized replay")));
}

/* ---- Left chrome ---- */
const REGIONS = ["West", "Mountain", "Midwest", "South", "Northeast"];
function SearchBar({
  q,
  setQ,
  filtersOn,
  onToggleFilters
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 16,
      left: 16,
      width: 360,
      display: "flex",
      gap: 8,
      zIndex: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      gap: 9,
      padding: "9px 12px",
      background: "rgba(11,15,20,0.92)",
      border: "1px solid var(--border)",
      borderRadius: 6,
      backdropFilter: "blur(8px)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "var(--ink-dim)",
    strokeWidth: "1.5"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "7",
    r: "4.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m11 11 3 3",
    strokeLinecap: "round"
  })), /*#__PURE__*/React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: "Search sites and signals\u2026",
    style: {
      flex: 1,
      background: "none",
      border: "none",
      outline: "none",
      color: "var(--ink-cold)",
      fontFamily: "var(--font-body)",
      fontSize: 13
    }
  }), q ? /*#__PURE__*/React.createElement("button", {
    onClick: () => setQ(""),
    title: "Clear",
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "var(--ink-dim)",
      fontSize: 16,
      lineHeight: 1,
      padding: 0
    }
  }, "\xD7") : null), /*#__PURE__*/React.createElement("button", {
    onClick: onToggleFilters,
    title: "Filters",
    style: {
      width: 38,
      display: "grid",
      placeItems: "center",
      background: filtersOn ? "color-mix(in srgb, var(--ink-steel) 18%, rgba(11,15,20,0.92))" : "rgba(11,15,20,0.92)",
      border: "1px solid " + (filtersOn ? "color-mix(in srgb, var(--ink-steel) 45%, transparent)" : "var(--border)"),
      borderRadius: 6,
      cursor: "pointer",
      backdropFilter: "blur(8px)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: filtersOn ? "var(--ink-cold)" : "var(--ink-steel)",
    strokeWidth: "1.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 4h12M4 8h8M6 12h4"
  }))));
}
function Chip({
  on,
  onClick,
  color,
  children
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "5px 10px",
      borderRadius: 99,
      cursor: "pointer",
      fontFamily: "var(--font-body)",
      fontSize: 11.5,
      fontWeight: on ? 600 : 500,
      border: "1px solid " + (on ? color || "var(--ink-steel)" : "rgba(169,192,214,0.16)"),
      background: on ? color ? `color-mix(in srgb, ${color} 16%, transparent)` : "color-mix(in srgb, var(--ink-steel) 16%, transparent)" : "transparent",
      color: on ? "var(--ink-cold)" : "var(--ink-quiet)",
      transition: "all 140ms var(--ease)"
    }
  }, color ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: color,
      opacity: on ? 1 : 0.6
    }
  }) : null, children);
}
function FilterPanel({
  threshold,
  setThreshold,
  filterCat,
  setFilterCat,
  region,
  setRegion,
  scope,
  setScope,
  onClear,
  activeCount
}) {
  const Section = ({
    label,
    hint,
    children
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 14px",
      borderTop: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--ink-dim)"
    }
  }, label), hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 9.5,
      color: "rgba(169,192,214,0.4)"
    }
  }, hint) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 10
    }
  }, children));
  const sevTiers = [[1, "All"], [2, "Watch+"], [3, "Elevated+"], [4, "Breaking"]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 70,
      left: 16,
      width: 256,
      background: "rgba(8,11,15,0.94)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      backdropFilter: "blur(10px)",
      zIndex: 11,
      fontFamily: "var(--font-body)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      padding: "11px 14px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10.5,
      fontWeight: 600,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--ink-cold)"
    }
  }, "Filters"), /*#__PURE__*/React.createElement("button", {
    onClick: onClear,
    disabled: !activeCount,
    style: {
      marginLeft: "auto",
      background: "none",
      border: "none",
      cursor: activeCount ? "pointer" : "default",
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      color: activeCount ? "var(--ink-steel)" : "var(--ink-dim)"
    }
  }, activeCount ? `Clear (${activeCount})` : "Clear")), /*#__PURE__*/React.createElement(Section, {
    label: "Min urgency",
    hint: "noise gate"
  }, sevTiers.map(([n, l]) => /*#__PURE__*/React.createElement(Chip, {
    key: n,
    on: threshold === n,
    onClick: () => setThreshold(n)
  }, l))), /*#__PURE__*/React.createElement(Section, {
    label: "Blocker cause"
  }, Object.entries(CATEGORIES).map(([k, c]) => /*#__PURE__*/React.createElement(Chip, {
    key: k,
    on: filterCat === k,
    color: c.color,
    onClick: () => setFilterCat(filterCat === k ? null : k)
  }, c.label))), /*#__PURE__*/React.createElement(Section, {
    label: "Region"
  }, REGIONS.map(r => /*#__PURE__*/React.createElement(Chip, {
    key: r,
    on: region === r,
    onClick: () => setRegion(region === r ? null : r)
  }, r))), /*#__PURE__*/React.createElement(Section, {
    label: "Site type"
  }, [["all", "All"], ["trial", "In network"], ["network", "Candidates"]].map(([k, l]) => /*#__PURE__*/React.createElement(Chip, {
    key: k,
    on: scope === k,
    onClick: () => setScope(k)
  }, l))));
}
function MapControls({
  onZoom,
  onReset,
  span,
  setSpan
}) {
  const ctrl = {
    width: 34,
    height: 34,
    display: "grid",
    placeItems: "center",
    background: "rgba(11,15,20,0.92)",
    border: "1px solid var(--border)",
    cursor: "pointer",
    color: "var(--ink-quiet)"
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      right: 446,
      bottom: 58,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      zIndex: 11
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 6,
      overflow: "hidden",
      border: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...ctrl,
      border: "none",
      borderBottom: "1px solid var(--border-subtle)"
    },
    onClick: () => onZoom(1),
    title: "Zoom in"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 16 16",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8 3v10M3 8h10"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...ctrl,
      border: "none",
      borderBottom: "1px solid var(--border-subtle)"
    },
    onClick: () => onZoom(-1),
    title: "Zoom out"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 16 16",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 8h10"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      ...ctrl,
      border: "none"
    },
    onClick: onReset,
    title: "Recenter"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.4"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "8",
    cy: "8",
    r: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2",
    strokeLinecap: "round"
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      right: 446,
      bottom: 14,
      display: "flex",
      alignItems: "center",
      background: "rgba(11,15,20,0.92)",
      border: "1px solid var(--border)",
      borderRadius: 6,
      overflow: "hidden",
      zIndex: 11
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.1em",
      color: "var(--ink-dim)",
      padding: "0 10px",
      borderRight: "1px solid var(--border-subtle)",
      alignSelf: "stretch",
      display: "flex",
      alignItems: "center"
    }
  }, "TIMELINE"), ["30d", "1w", "3d", "24h"].map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => setSpan(t),
    style: {
      padding: "7px 11px",
      background: span === t ? "color-mix(in srgb, var(--ink-steel) 14%, transparent)" : "none",
      border: "none",
      cursor: "pointer",
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: span === t ? "var(--ink-cold)" : "var(--ink-dim)"
    }
  }, t))));
}

/* ---- Network header — passes the 5-second test ---- */
function NetworkHeader() {
  const stats = [["12", "sites"], ["214", "screened"], ["23", "review cases"], ["4", "blocked"], ["3", "amendment-risk"]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 16,
      left: 390,
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "8px 16px",
      background: "rgba(8,11,15,0.86)",
      border: "1px solid var(--border)",
      borderRadius: 6,
      backdropFilter: "blur(8px)",
      zIndex: 10,
      fontFamily: "var(--font-body)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      lineHeight: 1.1,
      paddingRight: 14,
      borderRight: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: 14,
      fontWeight: 700,
      letterSpacing: "-0.01em",
      color: "var(--ink-cold)"
    }
  }, "Cascade Research Network"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      color: "var(--ink-dim)"
    }
  }, "12 sites \xB7 4 active trials \xB7 synthetic")), stats.map(([n, l]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 15,
      fontWeight: 600,
      color: "var(--ink-cold)",
      fontVariantNumeric: "tabular-nums"
    }
  }, n), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--ink-dim)"
    }
  }, l))));
}

/* ---- Top bar ---- */
function TopBar({
  view,
  setView
}) {
  const [t, setT] = React.useState("");
  React.useEffect(() => {
    const tick = () => setT(new Date().toISOString().slice(11, 19));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const Tab = ({
    active,
    onClick,
    title,
    children
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    title: title,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      height: 32,
      padding: "0 12px",
      borderRadius: 6,
      cursor: "pointer",
      border: "1px solid " + (active ? "color-mix(in srgb, var(--ink-steel) 40%, transparent)" : "transparent"),
      background: active ? "color-mix(in srgb, var(--ink-steel) 12%, transparent)" : "transparent",
      color: active ? "var(--ink-cold)" : "var(--ink-dim)",
      fontFamily: "var(--font-body)",
      fontSize: 12.5,
      fontWeight: active ? 600 : 500
    }
  }, children);
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      padding: "0 18px",
      height: 56,
      background: "#080b0f",
      borderBottom: "1px solid var(--border)",
      zIndex: 14,
      fontFamily: "var(--font-body)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 11
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 476 520",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 33,
    strokeLinejoin: "round",
    strokeLinecap: "round",
    style: {
      height: 24,
      width: "auto",
      color: "var(--ink-steel)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 104.82 74.50 L 366.46 74.50 A 40.50 40.50 0 0 1 402.59 133.29 L 368.99 199.68 A 63.50 63.50 0 0 1 312.33 234.50 L 158.12 234.50 A 63.50 63.50 0 0 1 101.18 199.11 L 68.50 132.93 A 40.50 40.50 0 0 1 104.82 74.50 Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M 158.62 284.50 L 312.06 284.50 A 63.50 63.50 0 0 1 368.75 319.39 L 403.25 387.75 A 40.50 40.50 0 0 1 367.09 446.50 L 104.32 446.50 A 40.50 40.50 0 0 1 68.01 388.07 L 101.68 319.88 A 63.50 63.50 0 0 1 158.62 284.50 Z"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 17,
      letterSpacing: "-0.01em",
      color: "var(--ink-cold)"
    }
  }, "Console")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Tab, {
    active: view === "map",
    onClick: () => setView("map"),
    title: "Map"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.4",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 4.5 6.5 3 11.5 4.5 16 3v10.5L11.5 15 6.5 13.5 2 15z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6.5 3v10.5M11.5 4.5V15"
  })), "Map"), /*#__PURE__*/React.createElement(Tab, {
    active: view === "list",
    onClick: () => setView("list"),
    title: "List"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.4",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "2.5",
    width: "12",
    height: "13",
    rx: "1.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M6 6h6M6 9h6M6 12h4",
    strokeLinecap: "round"
  })), "List")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      lineHeight: 1.15
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: 12.5,
      fontWeight: 600,
      color: "var(--ink-cold)"
    }
  }, "Cascade Research Network"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 9.5,
      color: "var(--ink-dim)",
      letterSpacing: "0.04em"
    }
  }, "Network operations \xB7 12 sites \xB7 4 trials")), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 30,
      height: 30,
      borderRadius: "50%",
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
      border: "1px solid var(--border)",
      background: "#0b0f14",
      fontFamily: "var(--font-body)",
      fontSize: 11,
      color: "var(--ink-quiet)"
    }
  }, "CR")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 26,
      background: "var(--border)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      lineHeight: 1.1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 14,
      color: "var(--ink-cold)",
      fontVariantNumeric: "tabular-nums"
    }
  }, t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 9.5,
      color: "var(--ink-dim)",
      letterSpacing: "0.1em"
    }
  }, "UTC"))));
}

/* ---- Right: Eye timeline ---- */
const SPAN_HOURS = {
  "24h": 24,
  "3d": 72,
  "1w": 168,
  "30d": 720
};
const SEV_META = {
  5: {
    l: "Breaching",
    c: "#f2566e"
  },
  4: {
    l: "At risk",
    c: "#d9a23e"
  },
  3: {
    l: "Elevated",
    c: "#c79234"
  },
  2: {
    l: "Watch",
    c: "#7b96b2"
  },
  1: {
    l: "Steady",
    c: "#5bb98c"
  }
};

/* 5-segment pressure meter — deterministic SLA/pressure tier, lit 1–5 */
function PressureMeter({
  n,
  color
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      gap: 2.5,
      alignItems: "flex-end"
    },
    title: `Pressure tier ${n} of 5`
  }, [1, 2, 3, 4, 5].map(i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      width: 3.5,
      height: 5 + i * 1.8,
      borderRadius: 1,
      background: i <= n ? color : "rgba(169,192,214,0.16)"
    }
  })));
}
function SignalCard({
  sig,
  active,
  onOpen
}) {
  const c = CATEGORIES[sig.cat];
  const sm = SEV_META[sig.sev] || SEV_META[3];
  return /*#__PURE__*/React.createElement("article", {
    style: {
      margin: "10px 14px",
      padding: "14px 15px",
      borderRadius: 12,
      border: `1px solid ${active ? "color-mix(in srgb, var(--ink-steel) 45%, transparent)" : "var(--border-subtle)"}`,
      background: active ? "color-mix(in srgb, var(--ink-steel) 7%, #0b0f14)" : "#0b0f14",
      boxShadow: active ? "0 8px 24px rgba(0,0,0,0.4)" : "none",
      transition: "border-color 150ms, background 150ms"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: c.color
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.07em",
      textTransform: "uppercase",
      color: "var(--ink-quiet)"
    }
  }, c.label), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      display: "inline-flex",
      alignItems: "center",
      gap: 7
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 9.5,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      color: sm.c
    }
  }, sm.l), /*#__PURE__*/React.createElement(PressureMeter, {
    n: sig.sev,
    color: sm.c
  }))), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: "0 0 9px",
      fontFamily: "var(--font-body)",
      fontSize: 14,
      fontWeight: 600,
      lineHeight: 1.32,
      color: "var(--ink-cold)"
    }
  }, sig.head), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "3px 8px",
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--ink-dim)",
      marginBottom: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--ink-quiet)"
    }
  }, sig.scope), /*#__PURE__*/React.createElement("span", null, "\xB7 ", sig.affected), /*#__PURE__*/React.createElement("span", null, "\xB7 ", sig.owner)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    tone: active ? "primary" : "outline",
    size: "sm",
    onClick: onOpen
  }, active ? "Showing on map" : "Show on map"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      color: "var(--ink-dim)"
    }
  }, sig.started)));
}
function EyeTimeline({
  signals,
  span,
  q,
  active,
  onOpen
}) {
  const [sort, setSort] = React.useState("Relevant");
  const windowed = React.useMemo(() => signals.filter(s => s.ageH <= SPAN_HOURS[span] && (!q || (s.head + " " + s.scope + " " + s.owner).toLowerCase().includes(q.toLowerCase()))), [signals, span, q]);
  const sorted = React.useMemo(() => {
    const a = [...windowed];
    if (sort === "Started") return a.sort((x, y) => x.ageH - y.ageH);
    if (sort === "Last updated") return a.sort((x, y) => x.ageH - y.ageH);
    return a.sort((x, y) => y.sev - x.sev);
  }, [windowed, sort]);
  const spanLabel = {
    "24h": "last 24 hours",
    "3d": "last 3 days",
    "1w": "last week",
    "30d": "last 30 days"
  }[span];
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      width: 430,
      background: "#080b0f",
      borderLeft: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      zIndex: 13,
      fontFamily: "var(--font-body)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 18px 12px",
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: 17,
      fontWeight: 700,
      letterSpacing: "-0.01em",
      color: "var(--ink-cold)"
    }
  }, "Damaros Eye"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      color: "var(--ink-steel)"
    }
  }, sorted.length, " signals \xB7 ", spanLabel)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--ink-dim)"
    }
  }, "Sort by"), ["Relevant", "Started", "Last updated"].map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    onClick: () => setSort(s),
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 0,
      paddingBottom: 3,
      fontFamily: "var(--font-body)",
      fontSize: 12.5,
      fontWeight: sort === s ? 700 : 400,
      color: sort === s ? "var(--ink-cold)" : "var(--ink-dim)",
      borderBottom: sort === s ? "2px solid var(--ink-steel)" : "2px solid transparent"
    }
  }, s)))), /*#__PURE__*/React.createElement("div", {
    className: "eyeScroll",
    style: {
      flex: 1,
      overflowY: "auto"
    }
  }, sorted.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "40px 18px",
      textAlign: "center",
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--ink-dim)"
    }
  }, "No signals in this window.", /*#__PURE__*/React.createElement("br", null), "Widen the timeline below.") : sorted.map(sig => /*#__PURE__*/React.createElement(SignalCard, {
    key: sig.id,
    sig: sig,
    active: active === sig.id,
    onOpen: () => onOpen(active === sig.id ? null : sig.id)
  }))));
}

/* ---- List view (roster) ---- */
function ListView({
  q,
  threshold,
  filterCat,
  region,
  scope,
  onPick
}) {
  const rows = SITES.concat(PROSPECTS).filter(s => {
    if (!siteMatch(s, q)) return false;
    if (region && s.region !== region) return false;
    if (s.prospect) return scope !== "trial" && !filterCat && threshold < 3;
    if (scope === "network") return false;
    if (s.sev < threshold) return false;
    if (filterCat && filterCat !== s.cat) return false;
    return true;
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      right: 430,
      overflowY: "auto",
      background: "#070a0e",
      zIndex: 9
    },
    className: "eyeScroll"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 880,
      margin: "0 auto",
      padding: "86px 28px 40px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "56px 1fr 110px 70px 70px 90px",
      gap: 12,
      padding: "0 14px 10px",
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      letterSpacing: "0.07em",
      textTransform: "uppercase",
      color: "var(--ink-dim)",
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "Site"), /*#__PURE__*/React.createElement("span", null, "Name"), /*#__PURE__*/React.createElement("span", null, "Region"), /*#__PURE__*/React.createElement("span", null, "Ready"), /*#__PURE__*/React.createElement("span", null, "Review"), /*#__PURE__*/React.createElement("span", null, "Status")), rows.map(s => /*#__PURE__*/React.createElement("button", {
    key: s.id,
    onClick: () => onPick(s.id),
    style: {
      width: "100%",
      display: "grid",
      gridTemplateColumns: "56px 1fr 110px 70px 70px 90px",
      gap: 12,
      alignItems: "center",
      padding: "13px 14px",
      borderBottom: "1px solid var(--border-subtle)",
      background: "none",
      border: "none",
      borderBottomStyle: "solid",
      cursor: "pointer",
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: s.prospect ? "var(--ink-steel)" : sevColor(s.sev)
    }
  }, s.id), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--ink-cold)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, s.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      color: "var(--ink-dim)"
    }
  }, s.region), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--ink-quiet)"
    }
  }, s.prospect ? "—" : Math.round(s.ready * 100) + "%"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: s.prospect ? "var(--ink-dim)" : s.review > 3 ? "#d9a23e" : "var(--ink-quiet)"
    }
  }, s.prospect ? "—" : s.review), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      color: s.prospect ? "var(--ink-steel)" : "var(--ink-dim)"
    }
  }, s.prospect ? "network" : "on trial"))), rows.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 40,
      textAlign: "center",
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--ink-dim)"
    }
  }, "No sites match these filters.") : null));
}

/* ---- App ---- */
function ConsoleApp() {
  const mapRef = React.useRef(null);
  const [dims, setDims] = React.useState({
    w: 0,
    h: 0,
    statePaths: [],
    proj: null
  });
  const [threshold, setThreshold] = React.useState(1);
  const [filterCat, setFilterCat] = React.useState(null);
  const [selected, setSelected] = React.useState(null);
  const [activeSignal, setActiveSignal] = React.useState(null);
  const [span, setSpan] = React.useState("30d");
  const [zoom, setZoom] = React.useState(0);
  const [pan, setPan] = React.useState({
    x: 0,
    y: 0
  });
  const [q, setQ] = React.useState("");
  const [region, setRegion] = React.useState(null);
  const [scope, setScope] = React.useState("all");
  const [showFilters, setShowFilters] = React.useState(true);
  const [view, setView] = React.useState("map");
  const dragRef = React.useRef(null);
  const [requested, setRequested] = React.useState(() => new Set());
  const onRequest = id => setRequested(p => {
    const n = new Set(p);
    n.add(id);
    return n;
  });
  const usRef = React.useRef(null);
  const build = React.useCallback(() => {
    const el = mapRef.current,
      us = usRef.current;
    if (!el || !us) return;
    const w = el.clientWidth,
      h = el.clientHeight;
    const states = topojson.feature(us, us.objects.states);
    const proj = d3.geoAlbersUsa().fitSize([w, h], states);
    const path = d3.geoPath(proj);
    setDims({
      w,
      h,
      statePaths: states.features.map(f => path(f)),
      proj
    });
  }, []);
  React.useEffect(() => {
    let alive = true;
    d3.json("https://unpkg.com/us-atlas@3.0.1/states-10m.json").then(us => {
      if (!alive) return;
      usRef.current = us;
      build();
    });
    const onR = () => build();
    window.addEventListener("resize", onR);
    return () => {
      alive = false;
      window.removeEventListener("resize", onR);
    };
  }, [build]);
  const markers = React.useMemo(() => {
    if (!dims.proj) return [];
    return SITES.concat(PROSPECTS).map(s => {
      const xy = dims.proj([s.lng, s.lat]);
      return xy ? {
        s,
        x: xy[0],
        y: xy[1]
      } : null;
    }).filter(Boolean);
  }, [dims]);
  const activeSites = activeSignal ? new Set(SIGNALS.find(g => g.id === activeSignal).sites) : null;
  const selMarker = selected ? markers.find(m => m.s.id === selected) : null;
  const k = 1 + zoom * 0.16;

  // Clear an active signal if the timeline window hides it.
  React.useEffect(() => {
    if (activeSignal) {
      const g = SIGNALS.find(s => s.id === activeSignal);
      if (g && g.ageH > SPAN_HOURS[span]) setActiveSignal(null);
    }
  }, [span, activeSignal]);
  const onDown = e => {
    if (e.button !== 0) return;
    dragRef.current = {
      sx: e.clientX,
      sy: e.clientY,
      px: pan.x,
      py: pan.y,
      moved: false
    };
  };
  const onMove = e => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.sx,
      dy = e.clientY - d.sy;
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
    setPan({
      x: d.px + dx,
      y: d.py + dy
    });
  };
  const onUp = () => {
    dragRef.current = null;
  };
  const activeCount = (threshold > 1 ? 1 : 0) + (filterCat ? 1 : 0) + (region ? 1 : 0) + (scope !== "all" ? 1 : 0);
  const clearFilters = () => {
    setThreshold(1);
    setFilterCat(null);
    setRegion(null);
    setScope("all");
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#050608",
      color: "var(--ink-cold)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    view: view,
    setView: setView
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      flex: 1,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: mapRef,
    onMouseDown: onDown,
    onMouseMove: onMove,
    onMouseUp: onUp,
    onMouseLeave: onUp,
    style: {
      position: "absolute",
      inset: 0,
      cursor: dragRef.current ? "grabbing" : "grab",
      visibility: view === "map" ? "visible" : "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      transform: `translate(${pan.x}px, ${pan.y}px) scale(${k})`,
      transformOrigin: "center center",
      transition: dragRef.current ? "none" : "transform 200ms var(--ease)"
    }
  }, dims.w ? /*#__PURE__*/React.createElement(NetworkMap, {
    dims: dims,
    markers: markers
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "grid",
      placeItems: "center",
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--ink-dim)"
    }
  }, "Loading network\u2026"), /*#__PURE__*/React.createElement(Markers, {
    markers: markers,
    threshold: threshold,
    filterCat: filterCat,
    region: region,
    scope: scope,
    q: q,
    activeSites: activeSites,
    selected: selected,
    onSelect: id => {
      if (!dragRef.current || !dragRef.current.moved) setSelected(id);
    },
    requested: requested
  }), /*#__PURE__*/React.createElement(SitePopover, {
    m: selMarker,
    requested: requested,
    onRequest: onRequest,
    onClose: () => setSelected(null)
  }))), view === "list" ? /*#__PURE__*/React.createElement(ListView, {
    q: q,
    threshold: threshold,
    filterCat: filterCat,
    region: region,
    scope: scope,
    onPick: id => {
      setSelected(id);
      setView("map");
    }
  }) : null, /*#__PURE__*/React.createElement(SearchBar, {
    q: q,
    setQ: setQ,
    filtersOn: showFilters,
    onToggleFilters: () => setShowFilters(f => !f)
  }), view === "map" ? /*#__PURE__*/React.createElement(NetworkHeader, null) : null, showFilters ? /*#__PURE__*/React.createElement(FilterPanel, {
    threshold: threshold,
    setThreshold: setThreshold,
    filterCat: filterCat,
    setFilterCat: setFilterCat,
    region: region,
    setRegion: setRegion,
    scope: scope,
    setScope: setScope,
    onClear: clearFilters,
    activeCount: activeCount
  }) : null, view === "map" ? /*#__PURE__*/React.createElement(MapControls, {
    onZoom: d => setZoom(z => Math.max(0, Math.min(4, z + d))),
    onReset: () => {
      setZoom(0);
      setPan({
        x: 0,
        y: 0
      });
    },
    span: span,
    setSpan: setSpan
  }) : null, /*#__PURE__*/React.createElement(EyeTimeline, {
    signals: SIGNALS,
    span: span,
    q: q,
    active: activeSignal,
    onOpen: id => {
      setActiveSignal(id);
      setView("map");
    }
  })));
}
window.ConsoleApp = ConsoleApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/console/ConsoleApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/node/NodeApp.jsx
try { (() => {
/* Field UI Kit — Node · the site execution room
 * Left spine nav (Protocol · Evidence · Screening · Resolve · Replay) — the
 * only chrome. Each step is a full-bleed operating surface:
 *   Protocol   executable criterion board
 *   Evidence   FHIR readiness plane
 *   Screening  patient mind-map (hover = high-yield; click = Resolve)
 *   Resolve    coordinator cockpit
 *   Replay     audit reconstruction
 */
const K = window.NodeKit;
const {
  ACCENT,
  PASS,
  REVIEW,
  FAIL,
  GOV,
  BLOCK,
  HAIR,
  SUBT,
  Mono,
  CRITERIA,
  GATES,
  CANDIDATES,
  DOMAINS,
  CLUSTERS,
  evColor,
  patientOf
} = K;
const TABS = ["Protocol", "Evidence", "Screening", "Resolve", "Replay"];
const PANEL = "#0a0e13";
const crit = code => CRITERIA.find(c => c.code === code);
const READY = {
  ok: {
    l: "Ready",
    c: PASS,
    cov: 1
  },
  stale: {
    l: "Stale",
    c: REVIEW,
    cov: 0.68
  },
  conflict: {
    l: "Conflict",
    c: FAIL,
    cov: 0.55
  },
  missing: {
    l: "Missing",
    c: "#c77d3a",
    cov: 0.18
  }
};

/* Protocol-level ingestion detail — how Trident maps each I/E rule. No patient data. */
const PROTO = {
  "I-2.1": {
    rule: "EGFR / ALK molecular alteration present (targetable subtype).",
    determinacy: "source",
    note: "Computable once the molecular DiagnosticReport is ingested — the anchor is defined but the source has not arrived from the lab.",
    anchors: [{
      t: "Observation",
      code: "LOINC 21667-1",
      st: "mapped"
    }, {
      t: "DiagnosticReport",
      code: "molecular path.",
      st: "awaiting"
    }]
  },
  "I-4.2": {
    rule: "ECOG performance status 0–1, assessed within 14 days of C1D1.",
    determinacy: "subjective",
    note: "Trident maps the structured value deterministically; the narrative note is non-computable and can disagree — flagged for human judgment, never auto-resolved.",
    anchors: [{
      t: "Observation",
      code: "LOINC 89247-1",
      st: "mapped"
    }, {
      t: "Clinical note",
      code: "narrative ECOG",
      st: "subjective"
    }]
  },
  "I-4.4": {
    rule: "Measurable disease per RECIST 1.1 on baseline imaging.",
    determinacy: "computable",
    note: "Fully deterministic from the imaging DiagnosticReport — no human judgment required.",
    anchors: [{
      t: "DiagnosticReport",
      code: "imaging · RECIST",
      st: "mapped"
    }]
  },
  "E-5.3": {
    rule: "≥ 21-day washout from prior systemic therapy before C1D1.",
    determinacy: "source",
    note: "Date arithmetic is deterministic, but the last-dose anchor resolves across multiple sources that may disagree — Trident surfaces the conflict for confirmation.",
    anchors: [{
      t: "MedicationRequest",
      code: "last administration",
      st: "mapped"
    }, {
      t: "DocumentReference",
      code: "discharge summary",
      st: "subjective"
    }]
  },
  "E-7": {
    rule: "Active CNS metastases requiring escalating corticosteroids.",
    determinacy: "subjective",
    note: "‘Active’ and ‘escalating’ require clinical interpretation — Trident maps the anchors but routes the determination to a clinician.",
    anchors: [{
      t: "Condition",
      code: "SNOMED · CNS mets",
      st: "mapped"
    }, {
      t: "MedicationRequest",
      code: "corticosteroid course",
      st: "subjective"
    }]
  }
};
const DETERMINACY = {
  computable: {
    c: "#5bb98c",
    label: "Computable",
    sub: "deterministic from structured FHIR"
  },
  source: {
    c: "#d9a23e",
    label: "Source-dependent",
    sub: "computable once source is ingested"
  },
  subjective: {
    c: "#a9c0d6",
    label: "Subjective",
    sub: "requires human judgment"
  }
};
const SPONSOR = {
  name: "Meridian Oncology Therapeutics",
  nct: "NCT03032484",
  protocol: "DMR-204 · v2.1",
  hash: "aead45cf",
  monitor: "Dr. E. Salgado",
  monitorRole: "Medical Monitor",
  cra: "J. Okafor",
  craRole: "Lead CRA",
  email: "trials@meridian-onc.com"
};
const AMENDMENTS = [{
  id: "A3",
  date: "2026-06-21",
  status: "cascaded",
  change: "Added structured ECOG re-assessment rule; +2 evidence requirements per case.",
  affected: "I-4.2 · E-7"
}, {
  id: "A2",
  date: "2026-05-02",
  status: "superseded",
  change: "Therapy washout extended 14 → 21 days.",
  affected: "E-5.3"
}];

/* ============ execution header ============ */
function ExecHeader({
  openStates
}) {
  const stat = (v, l, c) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontVariantNumeric: "tabular-nums lining-nums",
      fontSize: 14,
      color: c || "var(--ink-cold)",
      fontVariantNumeric: "tabular-nums"
    }
  }, v), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--ink-dim)"
    }
  }, l));
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 18,
      padding: "0 22px",
      height: 54,
      background: "#080b0f",
      borderBottom: `1px solid ${HAIR}`,
      flexShrink: 0,
      zIndex: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 476 520",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 33,
    strokeLinejoin: "round",
    strokeLinecap: "round",
    style: {
      height: 21,
      width: "auto",
      color: "var(--ink-cold)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M 104.82 74.50 L 366.46 74.50 A 40.50 40.50 0 0 1 402.59 133.29 L 368.99 199.68 A 63.50 63.50 0 0 1 312.33 234.50 L 158.12 234.50 A 63.50 63.50 0 0 1 101.18 199.11 L 68.50 132.93 A 40.50 40.50 0 0 1 104.82 74.50 Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M 158.62 284.50 L 312.06 284.50 A 63.50 63.50 0 0 1 368.75 319.39 L 403.25 387.75 A 40.50 40.50 0 0 1 367.09 446.50 L 104.32 446.50 A 40.50 40.50 0 0 1 68.01 388.07 L 101.68 319.88 A 63.50 63.50 0 0 1 158.62 284.50 Z"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 16,
      letterSpacing: "-0.01em"
    }
  }, "Node")), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingLeft: 16,
      borderLeft: `1px solid ${HAIR}`,
      display: "flex",
      alignItems: "baseline",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: "var(--ink-cold)"
    }
  }, "Site 014"), /*#__PURE__*/React.createElement(Mono, {
    c: "var(--ink-dim)",
    style: {
      fontSize: 11
    }
  }, "DMR-204 \xB7 v2.1")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto",
      display: "flex",
      alignItems: "center",
      gap: 18
    }
  }, stat("72", "screened"), stat(openStates, "open states", openStates ? REVIEW : PASS), stat("5", "critical", FAIL), stat("94%", "replay coverage", ACCENT)));
}

/* ============ left spine nav (the only chrome) ============ */
function SpineRail({
  step,
  setStep,
  openStates
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      width: 198,
      flexShrink: 0,
      background: "#080b0f",
      borderRight: `1px solid ${HAIR}`,
      display: "flex",
      flexDirection: "column",
      padding: "12px 12px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontVariantNumeric: "tabular-nums lining-nums",
      fontSize: 9,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "var(--ink-dim)",
      padding: "6px 8px 12px"
    }
  }, "Execution spine"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, TABS.map((t, i) => {
    const active = step === i;
    return /*#__PURE__*/React.createElement("button", {
      key: t,
      onClick: () => setStep(i),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: "10px 12px",
        borderRadius: 8,
        border: `1px solid ${active ? "color-mix(in srgb," + ACCENT + " 38%, transparent)" : "transparent"}`,
        background: active ? "color-mix(in srgb," + ACCENT + " 13%, transparent)" : "transparent",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 130ms var(--ease), border-color 130ms"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-body)",
        fontVariantNumeric: "tabular-nums lining-nums",
        fontSize: 10.5,
        fontWeight: 600,
        color: active ? ACCENT : "color-mix(in srgb, var(--ink-cold) 34%, transparent)",
        width: 16,
        flexShrink: 0
      }
    }, "0" + (i + 1)), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontFamily: "var(--font-display)",
        fontSize: 14,
        fontWeight: active ? 600 : 500,
        letterSpacing: "-0.01em",
        color: active ? "var(--ink-cold)" : "color-mix(in srgb, var(--ink-cold) 62%, transparent)"
      }
    }, t), t === "Resolve" && openStates ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-body)",
        fontVariantNumeric: "tabular-nums lining-nums",
        fontSize: 9.5,
        fontWeight: 600,
        color: REVIEW,
        padding: "0 6px",
        borderRadius: 99,
        border: `1px solid color-mix(in srgb, ${REVIEW} 36%, transparent)`
      }
    }, openStates) : null, active ? /*#__PURE__*/React.createElement("span", {
      style: {
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: ACCENT,
        boxShadow: `0 0 8px ${ACCENT}`,
        flexShrink: 0
      }
    }) : null);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto",
      padding: "0 8px"
    }
  }, [["Protocol v2.1", PASS], ["Snapshot 06-22", ACCENT]].map(([t, col]) => /*#__PURE__*/React.createElement("div", {
    key: t,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      padding: "3px 0"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 5,
      height: 5,
      borderRadius: "50%",
      background: col,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontVariantNumeric: "tabular-nums lining-nums",
      fontSize: 9.5,
      color: "var(--ink-dim)"
    }
  }, t)))));
}

/* ============ shared ============ */
function Canvas({
  children,
  pad
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      flex: 1,
      minWidth: 0,
      background: "radial-gradient(900px 520px at 42% -5%, #0c1219, #07090c 70%)",
      overflow: "hidden",
      padding: pad || 0
    }
  }, children);
}
function ModuleHead({
  n,
  eyebrow,
  title,
  status,
  statusTone
}) {
  const c = {
    ok: PASS,
    review: REVIEW,
    steel: ACCENT,
    gov: GOV
  }[statusTone] || ACCENT;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontVariantNumeric: "tabular-nums lining-nums",
      fontSize: 10,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "var(--ink-dim)"
    }
  }, n, "\u2002", eyebrow), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: "7px 0 0",
      fontFamily: "var(--font-display)",
      fontSize: 25,
      fontWeight: 700,
      letterSpacing: "-0.02em",
      lineHeight: 1
    }
  }, title)), status ? /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: 14,
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: "4px 11px",
      borderRadius: 99,
      border: `1px solid color-mix(in srgb, ${c} 36%, transparent)`,
      fontFamily: "var(--font-body)",
      fontVariantNumeric: "tabular-nums lining-nums",
      fontSize: 10,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: c
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: c
    }
  }), status) : null);
}

/* ============ PROTOCOL — clean criterion board ============ */
function ProtocolModule({
  sel,
  setSel,
  setStep
}) {
  const c = crit(sel.criterion);
  const p = PROTO[sel.criterion] || PROTO["I-4.2"];
  const Col = ({
    title,
    list
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontVariantNumeric: "tabular-nums lining-nums",
      fontSize: 10,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--ink-dim)",
      marginBottom: 11
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, list.map(cr => {
    const col = evColor[cr.evidence],
      on = sel.criterion === cr.code;
    const R = {
      ok: {
        anchors: "2 / 2 anchors",
        av: 2,
        ap: 0,
        rule: "ready",
        rc: PASS
      },
      conflict: {
        anchors: "2 / 2 anchors",
        av: 2,
        ap: 0,
        rule: "conflict",
        rc: FAIL
      },
      stale: {
        anchors: "2 / 2 anchors",
        av: 2,
        ap: 0,
        rule: "stale",
        rc: REVIEW
      },
      missing: {
        anchors: "1 / 2 unmapped",
        av: 1,
        ap: 0,
        rule: "missing",
        rc: "#c77d3a"
      }
    }[cr.evidence] || {
      anchors: "2 / 2 anchors",
      av: 2,
      ap: 0,
      rule: "ready",
      rc: PASS
    };
    const seg = [R.av, R.ap, 2 - R.av - R.ap];
    return /*#__PURE__*/React.createElement("button", {
      key: cr.code,
      onClick: () => setSel(s => ({
        ...s,
        criterion: cr.code
      })),
      style: {
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "13px 15px",
        borderRadius: 10,
        cursor: "pointer",
        border: `1px solid ${on ? "color-mix(in srgb," + ACCENT + " 45%, transparent)" : HAIR}`,
        borderLeft: `2px solid ${on ? ACCENT : col}`,
        background: on ? "color-mix(in srgb," + ACCENT + " 7%, " + PANEL + ")" : PANEL,
        transition: "border-color 140ms, background 140ms"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 9
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-body)",
        fontVariantNumeric: "tabular-nums lining-nums",
        fontSize: 11.5,
        color: col,
        whiteSpace: "nowrap"
      }
    }, cr.code), cr.amendment ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-body)",
        fontVariantNumeric: "tabular-nums lining-nums",
        fontSize: 9,
        color: ACCENT,
        padding: "1px 6px",
        borderRadius: 99,
        border: `1px solid color-mix(in srgb, ${ACCENT} 38%, transparent)`
      }
    }, "A3") : null, /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: "auto",
        fontFamily: "var(--font-body)",
        fontVariantNumeric: "tabular-nums lining-nums",
        fontSize: 10,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: cr.evidence === "ok" ? "var(--ink-dim)" : col
      }
    }, cr.evidence === "ok" ? "deterministic" : cr.evidence)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13.5,
        color: "var(--ink-cold)",
        margin: "8px 0 10px",
        lineHeight: 1.25
      }
    }, cr.t), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        height: 4,
        borderRadius: 99,
        overflow: "hidden",
        background: "rgba(169,192,214,0.06)",
        marginBottom: 7,
        gap: 2
      }
    }, seg.map((n, k) => n > 0 ? /*#__PURE__*/React.createElement("span", {
      key: k,
      style: {
        flex: n,
        background: k === 0 ? ACCENT : k === 1 ? REVIEW : "rgba(124,138,153,0.4)"
      }
    }) : null)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 10,
        whiteSpace: "nowrap",
        flexShrink: 0
      }
    }, R.anchors, " \xB7 Trident"), /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 10,
        marginLeft: "auto",
        color: R.rc,
        whiteSpace: "nowrap",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        flexShrink: 0
      }
    }, R.rule)));
  })));
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Canvas, {
    pad: "26px 30px"
  }, /*#__PURE__*/React.createElement(ModuleHead, {
    n: "01",
    eyebrow: "Protocol",
    title: "Executable criteria",
    status: "Locked \xB7 v2.1",
    statusTone: "steel"
  }), /*#__PURE__*/React.createElement(Mono, {
    style: {
      display: "block",
      marginBottom: 20
    }
  }, "NCT03032484 \xB7 hash aead45cf \xB7 36 criteria \xB7 25 Trident-mapped \xB7 amendment A3 pending"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 22
    }
  }, /*#__PURE__*/React.createElement(Col, {
    title: "Inclusion",
    list: CRITERIA.filter(x => x.kind === "incl")
  }), /*#__PURE__*/React.createElement(Col, {
    title: "Exclusion",
    list: CRITERIA.filter(x => x.kind === "excl")
  }))), /*#__PURE__*/React.createElement(ProtocolRail, {
    c: c,
    p: p,
    setStep: setStep
  }));
}
function ProtocolRail({
  c,
  p,
  setStep
}) {
  const det = DETERMINACY[p.determinacy];
  const stSt = {
    mapped: {
      c: PASS,
      label: "mapped"
    },
    awaiting: {
      c: "#c77d3a",
      label: "awaiting source"
    },
    subjective: {
      c: ACCENT,
      label: "needs judgment"
    }
  };
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 286,
      flexShrink: 0,
      borderLeft: `1px solid ${HAIR}`,
      background: "#080b0f",
      overflowY: "auto"
    },
    className: "eyeScroll"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "14px 16px 13px",
      borderBottom: `1px solid ${HAIR}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontVariantNumeric: "tabular-nums lining-nums",
      fontSize: 9.5,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--ink-dim)"
    }
  }, "Trident ingestion"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 9,
      marginTop: 9
    }
  }, /*#__PURE__*/React.createElement(Mono, {
    c: evColor[c.evidence] || ACCENT,
    style: {
      fontSize: 12,
      flexShrink: 0,
      whiteSpace: "nowrap"
    }
  }, c.code), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--ink-cold)",
      lineHeight: 1.2
    }
  }, c.t)), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "9px 0 0",
      fontSize: 12,
      lineHeight: 1.45,
      color: "var(--ink-faint)"
    }
  }, p.rule), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      marginTop: 13,
      padding: "9px 11px",
      borderRadius: 9,
      border: `1px solid color-mix(in srgb, ${det.c} 30%, transparent)`,
      background: `color-mix(in srgb, ${det.c} 7%, transparent)`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: det.c,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      color: det.c
    }
  }, det.label)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontVariantNumeric: "tabular-nums lining-nums",
      fontSize: 9,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--ink-dim)",
      margin: "14px 0 8px"
    }
  }, "FHIR anchors"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7
    }
  }, p.anchors.map((a, i) => {
    const s = stSt[a.st];
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        alignItems: "center",
        gap: 9
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: s.c,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--ink-quiet)",
        whiteSpace: "nowrap"
      }
    }, a.t), /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 10,
        color: "var(--ink-dim)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, a.code), /*#__PURE__*/React.createElement(Mono, {
      c: s.c,
      style: {
        fontSize: 9.5,
        marginLeft: "auto",
        flexShrink: 0,
        letterSpacing: "0.04em",
        textTransform: "uppercase"
      }
    }, s.label));
  })), p.determinacy === "subjective" ? /*#__PURE__*/React.createElement("button", {
    onClick: () => setStep(3),
    style: {
      width: "100%",
      marginTop: 13,
      padding: "9px 14px",
      borderRadius: 8,
      cursor: "pointer",
      border: `1px solid color-mix(in srgb, ${ACCENT} 38%, transparent)`,
      background: "linear-gradient(180deg, color-mix(in srgb, " + ACCENT + " 22%, transparent), color-mix(in srgb, " + ACCENT + " 9%, transparent))",
      color: "var(--ink-cold)",
      fontFamily: "var(--font-display)",
      fontSize: 13,
      fontWeight: 600
    }
  }, "Open in Resolve \u2192") : null), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "13px 16px",
      borderBottom: `1px solid ${SUBT}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontVariantNumeric: "tabular-nums lining-nums",
      fontSize: 9.5,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--ink-dim)",
      marginBottom: 9
    }
  }, "Sponsor"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: "var(--ink-cold)"
    }
  }, SPONSOR.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "3px 10px",
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Mono, {
    style: {
      fontSize: 10.5
    }
  }, SPONSOR.nct), /*#__PURE__*/React.createElement(Mono, {
    style: {
      fontSize: 10.5,
      color: "var(--ink-quiet)"
    }
  }, SPONSOR.protocol), /*#__PURE__*/React.createElement(Mono, {
    style: {
      fontSize: 10.5
    }
  }, "hash ", SPONSOR.hash)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 11,
      display: "flex",
      flexDirection: "column",
      gap: 7
    }
  }, [[SPONSOR.monitor, SPONSOR.monitorRole], [SPONSOR.cra, SPONSOR.craRole]].map(([n, r]) => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 22,
      height: 22,
      borderRadius: "50%",
      flexShrink: 0,
      display: "grid",
      placeItems: "center",
      border: `1px solid ${HAIR}`,
      background: "#0a0e13",
      fontFamily: "var(--font-body)",
      fontSize: 9.5,
      color: "var(--ink-quiet)"
    }
  }, n.split(/[ .]/).filter(Boolean).map(x => x[0]).slice(0, 2).join("")), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: "var(--ink-cold)",
      whiteSpace: "nowrap"
    }
  }, n), /*#__PURE__*/React.createElement(Mono, {
    style: {
      fontSize: 9.5,
      display: "block"
    }
  }, r))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 11,
      paddingTop: 11,
      borderTop: `1px solid ${SUBT}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: ACCENT,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement(Mono, {
    c: "var(--ink-quiet)",
    style: {
      fontSize: 10.5
    }
  }, SPONSOR.email))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "13px 16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontVariantNumeric: "tabular-nums lining-nums",
      fontSize: 9.5,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--ink-dim)",
      marginBottom: 10
    }
  }, "Amendments cascaded"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 9
    }
  }, AMENDMENTS.map(a => {
    const live = a.status === "cascaded";
    return /*#__PURE__*/React.createElement("div", {
      key: a.id,
      style: {
        display: "flex",
        gap: 11
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        fontFamily: "var(--font-body)",
        fontVariantNumeric: "tabular-nums lining-nums",
        fontSize: 10,
        fontWeight: 600,
        color: live ? ACCENT : "var(--ink-dim)",
        border: `1px solid ${live ? "color-mix(in srgb, " + ACCENT + " 42%, transparent)" : HAIR}`,
        background: live ? "color-mix(in srgb, " + ACCENT + " 8%, transparent)" : "transparent"
      }
    }, a.id)), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      c: live ? ACCENT : "var(--ink-dim)",
      style: {
        fontSize: 9.5,
        letterSpacing: "0.05em",
        textTransform: "uppercase"
      }
    }, a.status), /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 9.5
      }
    }, a.date)), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: "4px 0 0",
        fontSize: 12,
        lineHeight: 1.4,
        color: live ? "var(--ink-quiet)" : "var(--ink-dim)"
      }
    }, a.change), /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 9.5,
        marginTop: 4,
        display: "block",
        color: evColor.conflict
      }
    }, a.affected)));
  }))));
}

/* ============ EVIDENCE — reality terrain ============ */
const EV_CRIT = [{
  code: "I-2.1",
  title: "EGFR / ALK molecular status",
  sev: "blocked",
  headline: "Molecular report not received",
  why: "No structured EGFR / ALK result is mapped to this gate. Screening cannot evaluate it — 3 candidates are hard-stalled until it arrives.",
  fix: {
    verb: "Request molecular report",
    to: "pathology",
    act: "request"
  },
  trace: [{
    d: "Pathology",
    res: "DiagnosticReport · 06-21",
    st: "ok",
    note: "histology present"
  }, {
    d: "Biomarker",
    res: "molecular · EGFR / ALK",
    st: "missing",
    note: "not received from lab"
  }]
}, {
  code: "I-4.2",
  title: "ECOG 0–1 within 14 days",
  sev: "conflict",
  headline: "Sources disagree — structured 1 ≠ note 2",
  why: "Structured ECOG resolves to 1; the oncology note says 2. Deterministic logic cannot break the tie — it needs a human verdict.",
  fix: {
    verb: "Adjudicate in Resolve",
    to: "PI / Sub-I",
    act: "route"
  },
  trace: [{
    d: "ECOG · structured",
    res: "Observation · 06-18",
    st: "ok",
    note: "resolves to 1"
  }, {
    d: "ECOG · note",
    res: "Progress note · 06-20",
    st: "conflict",
    note: "reads 2"
  }]
}, {
  code: "E-5.3",
  title: "≥ 21-day therapy washout",
  sev: "risk",
  headline: "Evidence stale · last dose ambiguous",
  why: "Labs exceed the 14-day freshness window and the last-dose date conflicts across infusion and discharge records.",
  fix: {
    verb: "Confirm last dose",
    to: "infusion records",
    act: "request"
  },
  trace: [{
    d: "Labs",
    res: "Observation · freshness > 14d",
    st: "stale",
    note: "past window"
  }, {
    d: "Therapy history",
    res: "05-30 vs 06-02",
    st: "conflict",
    note: "last-dose conflict"
  }]
}, {
  code: "I-4.4",
  title: "Measurable disease · RECIST 1.1",
  sev: "ready",
  headline: "Evidence ready",
  why: "Imaging confirms measurable disease per RECIST 1.1. Fully computable from the DiagnosticReport.",
  trace: [{
    d: "Diagnosis",
    res: "Condition · stage IIIB · 06-19",
    st: "ok",
    note: "complete"
  }]
}, {
  code: "E-7",
  title: "Active CNS mets on steroids",
  sev: "ready",
  headline: "Evidence ready",
  why: "Steroid course and CNS status are both present and current — deterministic.",
  trace: [{
    d: "Medications",
    res: "MedicationRequest · steroids",
    st: "ok",
    note: "current"
  }]
}];
const EV_SEV = {
  blocked: {
    c: "#e0863a",
    label: "Hard-blocked"
  },
  conflict: {
    c: "#f2566e",
    label: "Conflict"
  },
  risk: {
    c: "#d9a23e",
    label: "At risk"
  },
  ready: {
    c: "#5bb98c",
    label: "Ready"
  }
};
const EV_BIND = {
  "I-2.1": {
    fhir: "LOINC 21667-1 · molecular",
    affected: "3 candidates hard-stalled"
  },
  "I-4.2": {
    fhir: "LOINC 89247-1 · ECOG",
    affected: "5 candidates need a verdict"
  },
  "E-5.3": {
    fhir: "MedicationRequest · last dose",
    affected: "3 candidates at risk"
  },
  "I-4.4": {
    fhir: "DiagnosticReport · RECIST 1.1",
    affected: "cohort-wide · computable"
  },
  "E-7": {
    fhir: "Condition + MedicationRequest",
    affected: "current · deterministic"
  }
};
function EvidenceModule({
  setStep,
  setSel
}) {
  const [pick, setPick] = React.useState("I-2.1");
  const [done, setDone] = React.useState({});
  const cur = EV_CRIT.find(c => c.code === pick) || EV_CRIT[0];
  const problems = EV_CRIT.filter(c => c.sev !== "ready");
  const ready = EV_CRIT.filter(c => c.sev === "ready");
  const stamp = () => new Date().toISOString().slice(11, 19) + "Z";
  const doFix = cr => {
    if (cr.fix && cr.fix.act === "route") {
      setSel(s => ({
        ...s,
        criterion: cr.code
      }));
      setStep(3);
      return;
    }
    setDone(d => ({
      ...d,
      [cr.code]: stamp()
    }));
  };
  return /*#__PURE__*/React.createElement(Canvas, null, /*#__PURE__*/React.createElement("style", null, `@keyframes evPulse{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,#e0863a 22%,transparent)}50%{box-shadow:0 0 0 7px color-mix(in srgb,#e0863a 0%,transparent)}}`), /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      display: "flex",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "13px 30px 12px",
      borderBottom: `1px solid ${HAIR}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontVariantNumeric: "tabular-nums lining-nums",
      fontSize: 10,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "var(--ink-dim)"
    }
  }, "02\u2002Evidence"), /*#__PURE__*/React.createElement(Mono, {
    c: "var(--ink-dim)",
    style: {
      marginLeft: "auto",
      fontSize: 10
    }
  }, "HAPI FHIR R4 \xB7 snapshot pop-2026-06-22 \xB7 PHI-bounded")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 14,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: 21,
      fontWeight: 700,
      letterSpacing: "-0.02em",
      whiteSpace: "nowrap"
    }
  }, "Criterion readiness"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: "var(--ink-faint)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#e0863a",
      fontWeight: 600
    }
  }, "2 hard-blocked"), " \xB7 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: REVIEW,
      fontWeight: 600
    }
  }, "1 at risk"), " \xB7 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: PASS
    }
  }, "2 ready")))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: "hidden",
      padding: "15px 30px 16px",
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, problems.map(cr => {
    const m = EV_SEV[cr.sev],
      on = pick === cr.code,
      isDone = done[cr.code];
    const big = cr.sev === "blocked";
    return /*#__PURE__*/React.createElement("div", {
      key: cr.code,
      onClick: () => setPick(cr.code),
      style: {
        cursor: "pointer",
        borderRadius: 12,
        padding: big ? "12px 18px" : "11px 18px",
        background: `color-mix(in srgb, ${m.c} ${big ? 9 : 7}%, #0a0e13)`,
        border: `1px solid color-mix(in srgb, ${m.c} ${on ? 60 : 38}%, transparent)`,
        boxShadow: on ? `0 0 0 1px color-mix(in srgb,${m.c} 40%, transparent), 0 18px 40px rgba(0,0,0,0.4)` : "0 6px 18px rgba(0,0,0,0.3)",
        animation: big && !isDone ? "evPulse 2.6s ease-in-out infinite" : "none",
        transition: "border-color 140ms"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 11
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: big ? 11 : 9,
        height: big ? 11 : 9,
        borderRadius: "50%",
        background: m.c,
        boxShadow: `0 0 10px ${m.c}`,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      c: m.c,
      style: {
        fontSize: big ? 13 : 12,
        whiteSpace: "nowrap"
      }
    }, cr.code), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: big ? 15 : 13.5,
        color: "var(--ink-cold)",
        fontWeight: 500
      }
    }, cr.title), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: "auto",
        fontFamily: "var(--font-body)",
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: m.c,
        padding: "3px 9px",
        borderRadius: 99,
        border: `1px solid color-mix(in srgb, ${m.c} 40%, transparent)`,
        whiteSpace: "nowrap"
      }
    }, m.label)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: big ? 16 : 14.5,
        fontWeight: 700,
        letterSpacing: "-0.01em",
        color: "var(--ink-cold)",
        margin: big ? "8px 0 5px" : "7px 0 4px"
      }
    }, cr.headline), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 12,
        lineHeight: 1.4,
        color: "var(--ink-faint)",
        maxWidth: "64ch"
      }
    }, cr.why), /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 10,
        color: isDone ? PASS : m.c,
        marginTop: 8,
        display: "block",
        letterSpacing: "0.05em",
        textTransform: "uppercase"
      }
    }, isDone ? "requested " + isDone + " · routed to " + cr.fix.to : cr.fix.act === "route" ? "needs a human verdict · adjudicate in resolve" : "one request clears the gate → see fix"));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      margin: "15px 0 10px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontVariantNumeric: "tabular-nums lining-nums",
      fontSize: 10,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--ink-dim)"
    }
  }, "Ready \xB7 no action"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      background: HAIR
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 7
    }
  }, ready.map(cr => {
    const on = pick === cr.code;
    return /*#__PURE__*/React.createElement("div", {
      key: cr.code,
      onClick: () => setPick(cr.code),
      style: {
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 18px",
        borderRadius: 9,
        background: on ? "color-mix(in srgb," + PASS + " 5%, #080b0f)" : "#080b0f",
        border: `1px solid ${on ? "color-mix(in srgb," + PASS + " 28%, transparent)" : SUBT}`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "color-mix(in srgb," + PASS + " 60%, transparent)",
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 11,
        color: "var(--ink-dim)",
        whiteSpace: "nowrap"
      }
    }, cr.code), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: "var(--ink-quiet)"
      }
    }, cr.title), /*#__PURE__*/React.createElement(Mono, {
      style: {
        marginLeft: "auto",
        fontSize: 10.5,
        color: "color-mix(in srgb," + PASS + " 60%, var(--ink-dim))"
      }
    }, "ready"));
  })))), /*#__PURE__*/React.createElement("aside", {
    style: {
      width: 340,
      flexShrink: 0,
      borderLeft: `1px solid ${HAIR}`,
      background: "#080b0f",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    }
  }, (() => {
    const m = EV_SEV[cur.sev];
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "20px 22px 16px",
        borderBottom: `1px solid ${HAIR}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        fontVariantNumeric: "tabular-nums lining-nums",
        fontSize: 9.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--ink-dim)"
      }
    }, "Lineage \xB7 drill-down"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginTop: 9
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      c: m.c,
      style: {
        fontSize: 12
      }
    }, cur.code), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-body)",
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: m.c,
        padding: "3px 9px",
        borderRadius: 99,
        border: `1px solid color-mix(in srgb, ${m.c} 40%, transparent)`
      }
    }, m.label)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14.5,
        color: "var(--ink-cold)",
        fontWeight: 600,
        marginTop: 9,
        lineHeight: 1.3
      }
    }, cur.title)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflow: "hidden",
        padding: "18px 22px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        fontVariantNumeric: "tabular-nums lining-nums",
        fontSize: 9.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--ink-dim)",
        marginBottom: 14
      }
    }, "Evidence feeding this gate"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 0
      }
    }, cur.trace.map((t, i) => {
      const tc = EV_SEV[{
        ok: "ready",
        missing: "blocked",
        conflict: "conflict",
        stale: "risk"
      }[t.st]].c;
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          display: "flex",
          gap: 12,
          paddingBottom: i < cur.trace.length - 1 ? 24 : 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 13,
          height: 13,
          borderRadius: "50%",
          border: `1.5px ${t.st === "missing" ? "dashed" : "solid"} ${tc}`,
          background: t.st === "ok" ? tc : "transparent"
        }
      }), i < cur.trace.length - 1 ? /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          width: 1.5,
          background: HAIR,
          marginTop: 3
        }
      }) : null), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0,
          paddingTop: -2
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 13,
          color: "var(--ink-cold)",
          fontWeight: 500
        }
      }, t.d), /*#__PURE__*/React.createElement(Mono, {
        style: {
          fontSize: 10.5,
          display: "block",
          marginTop: 2
        }
      }, t.res), /*#__PURE__*/React.createElement(Mono, {
        c: t.st === "ok" ? "var(--ink-dim)" : tc,
        style: {
          fontSize: 10.5,
          display: "block",
          marginTop: 3,
          textTransform: "uppercase",
          letterSpacing: "0.05em"
        }
      }, t.st === "ok" ? "mapped · " + t.note : t.st + " · " + t.note)));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 24,
        paddingTop: 16,
        borderTop: `1px solid ${SUBT}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        fontVariantNumeric: "tabular-nums lining-nums",
        fontSize: 9.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--ink-dim)",
        marginBottom: 11
      }
    }, "Binding"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 9
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      c: m.c,
      style: {
        fontSize: 11.5,
        flexShrink: 0
      }
    }, cur.code), /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 10.5,
        color: "var(--ink-quiet)"
      }
    }, EV_BIND[cur.code].fhir)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: cur.sev === "ready" ? "var(--ink-dim)" : m.c,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 10.5,
        color: cur.sev === "ready" ? "var(--ink-dim)" : m.c
      }
    }, EV_BIND[cur.code].affected)))), cur.sev !== "ready" ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 22px",
        borderTop: `1px solid ${HAIR}`,
        background: `color-mix(in srgb, ${m.c} 5%, transparent)`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        fontVariantNumeric: "tabular-nums lining-nums",
        fontSize: 9.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: m.c,
        marginBottom: 9
      }
    }, "The fix"), done[cur.code] ? /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 12.5,
        color: PASS
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: PASS
      }
    }), "Requested ", done[cur.code], " \xB7 ", cur.fix.to) : /*#__PURE__*/React.createElement("button", {
      onClick: () => doFix(cur),
      style: {
        width: "100%",
        padding: "11px 16px",
        borderRadius: 9,
        cursor: "pointer",
        fontFamily: "var(--font-display)",
        fontSize: 13.5,
        fontWeight: 600,
        color: "var(--ink-cold)",
        border: `1px solid color-mix(in srgb, ${m.c} 55%, transparent)`,
        background: `linear-gradient(180deg, color-mix(in srgb, ${m.c} 26%, transparent), color-mix(in srgb, ${m.c} 11%, transparent))`
      }
    }, cur.fix.verb, " \u2192 ", cur.fix.to)) : /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 22px",
        borderTop: `1px solid ${HAIR}`
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      c: PASS,
      style: {
        fontSize: 11.5
      }
    }, "Evidence complete \xB7 no action required")));
  })())));
}

/* Screening lives in NodeScreening.jsx (window.NodeScreening) */

/* ============ REPLAY — audit reconstruction ============ */
function ReplayModule() {
  const [t, setT] = React.useState(1);
  const frames = [{
    label: "Screening",
    time: "06-22 09:14Z",
    ecog: {
      s: "stall",
      v: "REVIEW · ECOG conflict"
    },
    human: {
      s: "none",
      v: "— pending"
    },
    state: "amber"
  }, {
    label: "After Resolve",
    time: "06-23 14:02Z",
    ecog: {
      s: "ok",
      v: "Deferred · repeat ECOG"
    },
    human: {
      s: "ok",
      v: "PI / Sub-I committed"
    },
    state: "green"
  }, {
    label: "After A3",
    time: "06-23 18:40Z",
    ecog: {
      s: "ok",
      v: "Superseded · A3 lineage"
    },
    human: {
      s: "ok",
      v: "re-attested"
    },
    state: "gov"
  }];
  const f = frames[t];
  const chain = [{
    k: "Protocol",
    v: "v2.1 · hash aead45cf"
  }, {
    k: "Evidence snapshot",
    v: "pop-2026-06-22 · 1,284 resources"
  }, {
    k: "Screening",
    v: f.ecog.v,
    tone: f.ecog.s
  }, {
    k: "Human action",
    v: f.human.v,
    tone: f.human.s
  }, {
    k: "Verification",
    v: t === 0 ? "incomplete" : "signed · PHI-free · Ed25519",
    tone: t === 0 ? "none" : "ok"
  }];
  const toneC = {
    stall: REVIEW,
    ok: PASS,
    none: BLOCK
  };
  const delta = [{
    f: 0,
    k: "Eligibility state",
    v: "REVIEW · stalled at I-4.2",
    tone: "stall"
  }, {
    f: 1,
    k: "Eligibility state",
    v: "Deferred · repeat ECOG ordered",
    tone: "ok"
  }, {
    f: 2,
    k: "Eligibility state",
    v: "Superseded · re-evaluated under A3",
    tone: "ok"
  }][t];
  return /*#__PURE__*/React.createElement(Canvas, {
    pad: "26px 40px"
  }, /*#__PURE__*/React.createElement(ModuleHead, {
    n: "05",
    eyebrow: "Replay \xB7 proof",
    title: "Reconstruct the decision",
    status: "Verified",
    statusTone: "ok"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(Mono, {
    style: {
      fontSize: 10,
      letterSpacing: "0.14em",
      textTransform: "uppercase"
    }
  }, "Flight recorder \xB7 Marcus Bell \xB7 S-1047 \xB7 scrub the chain"), /*#__PURE__*/React.createElement(Mono, {
    c: "var(--ink-dim)",
    style: {
      marginLeft: "auto"
    }
  }, f.time)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 8,
      marginBottom: 24,
      maxWidth: 620
    }
  }, frames.map((fr, i) => {
    const active = t === i,
      passed = t > i;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => setT(i),
      style: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "10px 13px",
        borderRadius: 9,
        cursor: "pointer",
        textAlign: "left",
        border: `1px solid ${active ? "color-mix(in srgb," + ACCENT + " 45%, transparent)" : HAIR}`,
        background: active ? "color-mix(in srgb," + ACCENT + " 12%, transparent)" : PANEL,
        transition: "border-color 130ms, background 130ms"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 18,
        height: 18,
        borderRadius: "50%",
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        fontFamily: "var(--font-body)",
        fontVariantNumeric: "tabular-nums lining-nums",
        fontSize: 10,
        fontWeight: 600,
        color: active || passed ? "#06090c" : "var(--ink-dim)",
        background: active || passed ? ACCENT : "transparent",
        border: `1.5px solid ${active || passed ? ACCENT : "rgba(169,192,214,0.3)"}`
      }
    }, i + 1), /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontFamily: "var(--font-body)",
        fontSize: 12.5,
        fontWeight: active ? 600 : 500,
        color: active ? "var(--ink-cold)" : "var(--ink-quiet)",
        whiteSpace: "nowrap"
      }
    }, fr.label), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontFamily: "var(--font-body)",
        fontVariantNumeric: "tabular-nums lining-nums",
        fontSize: 9,
        color: "var(--ink-dim)"
      }
    }, fr.time.split(" ")[1])));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 20,
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "1 1 0",
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontVariantNumeric: "tabular-nums lining-nums",
      fontSize: 10,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--ink-dim)",
      marginBottom: 11
    }
  }, "Execution chain"), /*#__PURE__*/React.createElement("div", {
    style: {
      border: `1px solid ${HAIR}`,
      borderRadius: 12,
      background: PANEL,
      overflow: "hidden"
    }
  }, chain.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: l.k,
    style: {
      display: "grid",
      gridTemplateColumns: "20px 120px 1fr",
      gap: 14,
      alignItems: "center",
      padding: "16px 22px",
      borderTop: i ? `1px solid ${SUBT}` : "none"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      justifySelf: "center",
      width: 9,
      height: 9,
      borderRadius: "50%",
      background: l.tone ? toneC[l.tone] : ACCENT,
      boxShadow: l.tone === "stall" ? `0 0 8px ${REVIEW}` : "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--ink-cold)"
    }
  }, l.k), /*#__PURE__*/React.createElement(Mono, {
    c: l.tone === "stall" ? REVIEW : l.tone === "none" ? "var(--ink-dim)" : "var(--ink-quiet)",
    style: {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, l.v))))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "1 1 320px",
      minWidth: 0,
      maxWidth: 420
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontVariantNumeric: "tabular-nums lining-nums",
      fontSize: 10,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "var(--ink-dim)",
      marginBottom: 11
    }
  }, "What changed \xB7 ", frames[t].label), /*#__PURE__*/React.createElement("div", {
    style: {
      border: `1px solid ${f.state === "amber" ? "color-mix(in srgb," + REVIEW + " 32%, transparent)" : f.state === "gov" ? "color-mix(in srgb," + ACCENT + " 32%, transparent)" : "color-mix(in srgb," + PASS + " 30%, transparent)"}`,
      borderRadius: 12,
      background: PANEL,
      padding: "18px 20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 9,
      height: 9,
      borderRadius: "50%",
      background: f.state === "amber" ? REVIEW : f.state === "gov" ? ACCENT : PASS
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--ink-cold)"
    }
  }, delta.v)), [["ECOG", f.ecog.v, f.ecog.s], ["Human", f.human.v, f.human.s]].map(([k, v, tn]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 10,
      padding: "7px 0",
      borderTop: `1px solid ${SUBT}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontVariantNumeric: "tabular-nums lining-nums",
      fontSize: 9.5,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--ink-dim)",
      width: 56,
      flexShrink: 0
    }
  }, k), /*#__PURE__*/React.createElement(Mono, {
    c: tn === "stall" ? REVIEW : tn === "none" ? "var(--ink-dim)" : "var(--ink-quiet)",
    style: {
      fontSize: 11.5
    }
  }, v))), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "13px 0 0",
      fontSize: 11.5,
      lineHeight: 1.5,
      color: "var(--ink-dim)"
    }
  }, t === 0 ? "Before judgment — the candidate is stalled at ECOG with the conflict unresolved." : t === 1 ? "After Resolve — deferred with a bound PI attestation; decision reconstructable." : "After amendment A3 — the prior state is superseded with full lineage retained."), /*#__PURE__*/React.createElement("button", {
    style: {
      width: "100%",
      marginTop: 16,
      padding: "10px 16px",
      borderRadius: 8,
      cursor: "pointer",
      border: `1px solid color-mix(in srgb, ${ACCENT} 40%, transparent)`,
      background: "color-mix(in srgb, " + ACCENT + " 12%, transparent)",
      color: "var(--ink-cold)",
      fontFamily: "var(--font-body)",
      fontVariantNumeric: "tabular-nums lining-nums",
      fontSize: 11,
      letterSpacing: "0.03em",
      textTransform: "uppercase"
    }
  }, "Export Replay Packet")))));
}

/* ============ app ============ */
function NodeApp() {
  const [step, setStep] = React.useState(0);
  const [sel, setSel] = React.useState({
    criterion: "I-4.2",
    case: "S-1047"
  });
  const [resolvedCases, setResolvedCases] = React.useState(() => new Set());
  const openStates = 13 - resolvedCases.size;
  const Resolve = window.NodeResolve;
  const Screening = window.NodeScreening;
  let body;
  if (step === 0) body = /*#__PURE__*/React.createElement(ProtocolModule, {
    sel: sel,
    setSel: setSel,
    setStep: setStep
  });else if (step === 1) body = /*#__PURE__*/React.createElement(EvidenceModule, {
    setStep: setStep,
    setSel: setSel
  });else if (step === 2) body = /*#__PURE__*/React.createElement(Screening, {
    sel: sel,
    setSel: setSel,
    setStep: setStep
  });else if (step === 3) body = /*#__PURE__*/React.createElement(Resolve, {
    focus: sel.case,
    resolvedCases: resolvedCases,
    onLock: id => setResolvedCases(p => new Set(p).add(id))
  });else body = /*#__PURE__*/React.createElement(ReplayModule, null);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#06090c",
      color: "var(--ink-cold)",
      fontFamily: "var(--font-body)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement(ExecHeader, {
    openStates: openStates
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: "hidden",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(SpineRail, {
    step: step,
    setStep: setStep,
    openStates: openStates
  }), body));
}
window.NodeApp = NodeApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/node/NodeApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/node/NodeKit.jsx
try { (() => {
/* Field UI Kit — Node · shared kit
 * Constants, atoms, and the synthetic execution dataset shared by every
 * Node module. Exposed on window.NodeKit so each Babel script can read it.
 */
(function () {
  const ACCENT = "#a9c0d6";
  const PASS = "#5bb98c",
    REVIEW = "#d9a23e",
    FAIL = "#f2566e",
    GOV = "#8c7cf0",
    BLOCK = "#7c8a99";
  const HAIR = "rgba(169,192,214,0.10)",
    SUBT = "rgba(169,192,214,0.06)";
  function Kicker({
    children,
    color
  }) {
    return React.createElement("span", {
      style: {
        fontFamily: "var(--font-body)",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: color || "var(--ink-dim)"
      }
    }, children);
  }
  function Mono({
    children,
    c,
    style
  }) {
    return React.createElement("span", {
      style: {
        fontFamily: "var(--font-body)",
        fontSize: 11.5,
        fontVariantNumeric: "tabular-nums lining-nums",
        letterSpacing: "0.02em",
        color: c || "var(--ink-dim)",
        ...style
      }
    }, children);
  }
  function Focal({
    children,
    glow,
    style
  }) {
    return React.createElement("div", {
      style: {
        borderRadius: 14,
        border: `1px solid ${HAIR}`,
        background: "linear-gradient(180deg, rgba(169,192,214,0.035), rgba(169,192,214,0.005) 40%), #0a0e13",
        boxShadow: glow ? `0 1px 0 rgba(255,255,255,0.03) inset, 0 24px 60px rgba(0,0,0,0.5), 0 0 40px color-mix(in srgb, ${glow} 8%, transparent)` : "0 1px 0 rgba(255,255,255,0.03) inset, 0 24px 60px rgba(0,0,0,0.45)",
        ...style
      }
    }, children);
  }
  function Tag({
    label,
    color
  }) {
    return React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        fontFamily: "var(--font-body)",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color,
        padding: "4px 10px",
        borderRadius: 99,
        border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
        background: `color-mix(in srgb, ${color} 8%, transparent)`
      }
    }, React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: color
      }
    }), label);
  }
  function StatusPill({
    label,
    tone
  }) {
    const c = {
      pass: PASS,
      review: REVIEW,
      fail: FAIL,
      steel: ACCENT,
      gov: GOV,
      muted: BLOCK
    }[tone] || ACCENT;
    return React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "4px 11px",
        borderRadius: 99,
        border: `1px solid color-mix(in srgb, ${c} 36%, transparent)`,
        fontFamily: "var(--font-body)",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        color: c,
        whiteSpace: "nowrap"
      }
    }, React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: c
      }
    }), label);
  }
  function Head({
    num,
    eyebrow,
    title,
    desc,
    status
  }) {
    return React.createElement("div", {
      style: {
        border: `1px solid ${HAIR}`,
        borderRadius: 12,
        background: "#0a0e13",
        padding: "20px 26px",
        marginBottom: 22
      }
    }, React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, React.createElement("span", {
      style: {
        fontFamily: "var(--font-body)",
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--ink-dim)"
      }
    }, (num ? num + "\u2003" : "") + (eyebrow || "")), status ? React.createElement("span", {
      style: {
        marginLeft: "auto"
      }
    }, React.createElement(StatusPill, {
      label: status.label,
      tone: status.tone
    })) : null), React.createElement("h1", {
      style: {
        margin: "12px 0 0",
        fontFamily: "var(--font-display)",
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: "-0.02em",
        lineHeight: 1.05,
        color: "var(--ink-cold)"
      }
    }, title), desc ? React.createElement("p", {
      style: {
        margin: "8px 0 0",
        fontSize: 14,
        lineHeight: 1.5,
        color: "var(--ink-faint)",
        maxWidth: "72ch"
      }
    }, desc) : null);
  }

  /* type → urgency color + glyph + ring style (clean circular language) */
  const TYPE = {
    evidence: {
      label: "Evidence gap",
      color: REVIEW,
      ring: "dashed"
    },
    conflict: {
      label: "Source conflict",
      color: FAIL,
      ring: "solid"
    },
    role: {
      label: "Role decision",
      color: ACCENT,
      ring: "double"
    },
    amendment: {
      label: "Amendment impact",
      color: ACCENT,
      ring: "solid"
    },
    sponsor: {
      label: "Sponsor-facing",
      color: ACCENT,
      ring: "dotted"
    }
  };

  /* The synthetic execution field for Site 014 / DMR-204 */
  const CLUSTERS = [{
    id: "ecog",
    label: "ECOG Conflict Cluster",
    type: "conflict",
    cases: 5,
    urgency: "critical",
    criterion: "I-4.2 · ECOG 0–1 within 14 days",
    role: "PI / Sub-I",
    x: 28,
    y: 36,
    cause: "Structured ECOG and note-derived ECOG disagree",
    evidence: ["Structured ECOG observation · 06-18", "Oncology progress note · 06-20"],
    path: [{
      n: 2,
      label: "Build PI packet — high-priority conflicts",
      act: "pi"
    }, {
      n: 2,
      label: "Request repeat ECOG — stale assessments",
      act: "evidence"
    }, {
      n: 1,
      label: "Defer — pending scheduled visit",
      act: "defer"
    }],
    replay: "5 decisions will bind to I-4.2"
  }, {
    id: "biomarker",
    label: "Biomarker Source Missing",
    type: "evidence",
    cases: 3,
    urgency: "high",
    criterion: "I-2.1 · EGFR / ALK status required",
    role: "Coordinator",
    x: 62,
    y: 28,
    cause: "No structured molecular report mapped to the criterion",
    evidence: ["Pathology molecular report — not found", "Outside lab result — unmapped"],
    path: [{
      n: 3,
      label: "Request molecular report from pathology",
      act: "evidence"
    }, {
      n: 0,
      label: "Re-run screening once evidence lands",
      act: "rescreen"
    }],
    replay: "3 evidence requests will open"
  }, {
    id: "washout",
    label: "Washout Timing Ambiguity",
    type: "conflict",
    cases: 3,
    urgency: "high",
    criterion: "E-5.3 · ≥ 21-day therapy washout",
    role: "PI / Sub-I",
    x: 44,
    y: 70,
    cause: "Last-dose date ambiguous across sources",
    evidence: ["Infusion record · 05-30", "Discharge summary · 06-02 (conflicting)"],
    path: [{
      n: 2,
      label: "Build PI packet — timing judgment",
      act: "pi"
    }, {
      n: 1,
      label: "Request infusion records — confirm last dose",
      act: "evidence"
    }],
    replay: "3 decisions will bind to E-5.3"
  }, {
    id: "steroid",
    label: "Steroid Exclusion Review",
    type: "role",
    cases: 2,
    urgency: "medium",
    criterion: "E-7 · Active CNS mets on escalating steroids",
    role: "PI / Sub-I",
    x: 76,
    y: 62,
    cause: "Steroid course requires clinical interpretation",
    evidence: ["Medication administration record · 06-19", "Neuro-oncology note · 06-17"],
    path: [{
      n: 2,
      label: "Route to PI for exclusion judgment",
      act: "pi"
    }],
    replay: "2 decisions will bind to E-7"
  }, {
    id: "amendment",
    label: "Amendment A3 — Auto-Applied",
    type: "amendment",
    cases: 7,
    urgency: "high",
    criterion: "A3 · +2 evidence rules per case",
    role: "System",
    x: 24,
    y: 70,
    auto: true,
    cause: "Sponsor published Amendment A3. It propagated to this site and re-screened automatically — no manual run needed",
    evidence: ["Amendment A3 · published by sponsor · 06-21 14:02Z", "Cascade completed · 06-21 14:02Z · 7 states re-evaluated"],
    cascade: [{
      v: "+2 evidence rules added per case",
      tone: "gov"
    }, {
      v: "5 prior decisions held — still valid under A3",
      tone: "ok"
    }, {
      v: "2 decisions reopened — new ECOG evidence rule applies",
      tone: "review"
    }, {
      v: "Re-consent not required · lineage preserved in Replay",
      tone: "ok"
    }],
    path: [],
    replay: "7 states superseded with full A3 lineage"
  }];

  /* a few individual cases for case-level resolve */
  const CASES = [{
    id: "S-1047",
    cluster: "ecog",
    state: "review",
    note: "Structured 1 · note suggests 2",
    priority: "high"
  }, {
    id: "S-1051",
    cluster: "ecog",
    state: "review",
    note: "ECOG assessment 19 days old",
    priority: "stale"
  }, {
    id: "S-1066",
    cluster: "biomarker",
    state: "stall",
    note: "EGFR/ALK report missing",
    priority: "med"
  }, {
    id: "S-1078",
    cluster: "washout",
    state: "review",
    note: "Last-dose date conflict",
    priority: "high"
  }, {
    id: "S-1090",
    cluster: "steroid",
    state: "review",
    note: "Dexamethasone taper unclear",
    priority: "med"
  }];
  const patientOf = id => CANDIDATES.find(c => c.id === id) || {
    name: "Synthetic patient",
    mrn: id,
    age: "—",
    sex: "—"
  };
  const urgencyColor = u => u === "critical" ? FAIL : u === "high" ? REVIEW : u === "medium" ? ACCENT : BLOCK;

  /* ---- spatial execution model (the field every module is a lens on) ---- */
  const evColor = {
    ok: ACCENT,
    conflict: FAIL,
    missing: REVIEW,
    stale: REVIEW
  };

  // protocol gates — positioned for the rule circuit
  const CRITERIA = [{
    code: "I-2.1",
    t: "EGFR / ALK molecular status",
    kind: "incl",
    fhir: "Observation · molecular · LOINC 21667-1",
    review: 3,
    fail: 9,
    cluster: "biomarker",
    evidence: "missing",
    row: 0
  }, {
    code: "I-4.2",
    t: "ECOG 0–1 within 14 days",
    kind: "incl",
    fhir: "Observation · ECOG · LOINC 89247-1",
    review: 5,
    fail: 14,
    cluster: "ecog",
    evidence: "conflict",
    amendment: true,
    row: 1
  }, {
    code: "I-4.4",
    t: "Measurable disease · RECIST 1.1",
    kind: "incl",
    fhir: "DiagnosticReport · imaging",
    review: 0,
    fail: 8,
    cluster: null,
    evidence: "ok",
    row: 2
  }, {
    code: "E-5.3",
    t: "≥ 21-day therapy washout",
    kind: "excl",
    fhir: "MedicationRequest · last dose",
    review: 3,
    fail: 10,
    cluster: "washout",
    evidence: "conflict",
    row: 0
  }, {
    code: "E-7",
    t: "Active CNS mets on steroids",
    kind: "excl",
    fhir: "Condition + MedicationRequest",
    review: 2,
    fail: 6,
    cluster: "steroid",
    evidence: "ok",
    amendment: true,
    row: 1
  }];

  // candidate trajectories through the gates (the screening atlas)
  const GATES = ["Diagnosis", "Biomarker", "ECOG", "Washout", "Steroid"];
  const CANDIDATES = [{
    id: "S-1047",
    name: "Marcus Bell",
    mrn: "SYN-4471",
    age: 64,
    sex: "M",
    stall: "ECOG",
    cluster: "ecog",
    note: "Structured ECOG 1 vs note 2"
  }, {
    id: "S-1051",
    name: "Patricia Voss",
    mrn: "SYN-4490",
    age: 71,
    sex: "F",
    stall: "ECOG",
    cluster: "ecog",
    note: "Assessment 19 days old"
  }, {
    id: "S-1066",
    name: "Andre Coleman",
    mrn: "SYN-4512",
    age: 58,
    sex: "M",
    stall: "Biomarker",
    cluster: "biomarker",
    note: "EGFR / ALK report missing"
  }, {
    id: "S-1071",
    name: "Lena Marsh",
    mrn: "SYN-4530",
    age: 62,
    sex: "F",
    stall: "Biomarker",
    cluster: "biomarker",
    note: "Molecular unmapped"
  }, {
    id: "S-1078",
    name: "Raymond Tan",
    mrn: "SYN-4548",
    age: 69,
    sex: "M",
    stall: "Washout",
    cluster: "washout",
    note: "Last-dose date conflict"
  }, {
    id: "S-1083",
    name: "Sofia Reyes",
    mrn: "SYN-4560",
    age: 55,
    sex: "F",
    stall: "Washout",
    cluster: "washout",
    note: "Infusion record ambiguous"
  }, {
    id: "S-1090",
    name: "Walter Kim",
    mrn: "SYN-4577",
    age: 73,
    sex: "M",
    stall: "Steroid",
    cluster: "steroid",
    note: "Dexamethasone taper unclear"
  }, {
    id: "S-1102",
    name: "Grace Idris",
    mrn: "SYN-4601",
    age: 60,
    sex: "F",
    stall: "ECOG",
    cluster: "ecog",
    note: "No repeat ECOG in window"
  }, {
    id: "S-1009",
    name: "Thomas Vance",
    mrn: "SYN-4402",
    age: 67,
    sex: "M",
    stall: null
  }, {
    id: "S-1014",
    name: "Nadia Hassan",
    mrn: "SYN-4410",
    age: 59,
    sex: "F",
    stall: null
  }, {
    id: "S-1022",
    name: "Carl Jensen",
    mrn: "SYN-4423",
    age: 65,
    sex: "M",
    stall: null
  }, {
    id: "S-1031",
    name: "Maria Lopez",
    mrn: "SYN-4438",
    age: 70,
    sex: "F",
    stall: null
  }, {
    id: "S-1040",
    name: "David Pak",
    mrn: "SYN-4455",
    age: 61,
    sex: "M",
    stall: null
  }, {
    id: "S-1055",
    name: "Ruth Adeyemi",
    mrn: "SYN-4498",
    age: 56,
    sex: "F",
    stall: null
  }];

  // evidence terrain — clinical reality domains
  const DOMAINS = [{
    id: "diagnosis",
    label: "Diagnosis",
    state: "ok",
    binds: "I-4.4",
    detail: "Condition · histology, stage IIIB",
    x: 15,
    y: 24
  }, {
    id: "pathology",
    label: "Pathology",
    state: "ok",
    binds: "I-2.1",
    detail: "DiagnosticReport · 06-21",
    x: 15,
    y: 68
  }, {
    id: "biomarker",
    label: "Biomarker",
    state: "missing",
    binds: "I-2.1",
    detail: "EGFR / ALK — not received",
    x: 43,
    y: 17
  }, {
    id: "ecog",
    label: "ECOG",
    state: "conflict",
    binds: "I-4.2",
    detail: "structured 1 · note 2",
    x: 43,
    y: 51
  }, {
    id: "labs",
    label: "Labs",
    state: "stale",
    binds: "E-5.3",
    detail: "HL7 freshness > 14d",
    x: 43,
    y: 84
  }, {
    id: "therapy",
    label: "Therapy history",
    state: "conflict",
    binds: "E-5.3",
    detail: "last-dose ambiguous",
    x: 75,
    y: 31
  }, {
    id: "meds",
    label: "Medications",
    state: "ok",
    binds: "E-7",
    detail: "MedicationRequest · steroids",
    x: 75,
    y: 67
  }];
  window.NodeKit = {
    ACCENT,
    PASS,
    REVIEW,
    FAIL,
    GOV,
    BLOCK,
    HAIR,
    SUBT,
    Kicker,
    Mono,
    Focal,
    Tag,
    Head,
    StatusPill,
    TYPE,
    CLUSTERS,
    CASES,
    CRITERIA,
    GATES,
    CANDIDATES,
    DOMAINS,
    evColor,
    urgencyColor,
    patientOf
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/node/NodeKit.jsx", error: String((e && e.message) || e) }); }

// ui_kits/node/NodeResolve.jsx
try { (() => {
/* Field UI Kit — Node · Resolve (the patient adjudication workspace)
 * Patient-first, mirroring how a coordinator/PI actually works a screening list:
 * one candidate at a time, walk to their blocking criterion, render a verdict, commit it.
 *   LEFT   · candidate queue — stalled patients awaiting judgment (by urgency)
 *   CENTER · the selected patient — their conflict (zone 1) → the call (zone 2) → commit (zone 3)
 *   RIGHT  · this candidate's path · who else is blocked here · required role · replay impact
 * Verdicts bind to the patient, not the cluster. window.NodeResolve.
 */
(function () {
  // Per-candidate adjudication — what THIS patient is blocked on and what the human decides.
  const VERDICTS = {
    "ecog-conflict": [{
      id: "accept-a",
      label: "Accept structured",
      sub: "ECOG 1 · proceed",
      tone: "ok"
    }, {
      id: "accept-b",
      label: "Accept note",
      sub: "ECOG 2 · exclude",
      tone: "review"
    }, {
      id: "repeat",
      label: "Request repeat ECOG",
      sub: "fresh assessment",
      tone: "steel"
    }, {
      id: "defer",
      label: "Defer",
      sub: "pending visit",
      tone: "muted"
    }],
    "ecog-stale": [{
      id: "repeat",
      label: "Request repeat ECOG",
      sub: "within 14-day window",
      tone: "steel"
    }, {
      id: "accept-prior",
      label: "Accept prior, attest",
      sub: "clinically unchanged",
      tone: "review"
    }, {
      id: "defer",
      label: "Defer",
      sub: "pending visit",
      tone: "muted"
    }],
    "biomarker-missing": [{
      id: "request",
      label: "Request molecular report",
      sub: "route to pathology",
      tone: "steel"
    }, {
      id: "ineligible",
      label: "Mark ineligible",
      sub: "no biomarker on file",
      tone: "fail"
    }, {
      id: "defer",
      label: "Defer",
      sub: "await result",
      tone: "muted"
    }],
    "washout-conflict": [{
      id: "accept-a",
      label: "Accept infusion date",
      sub: "washout met",
      tone: "ok"
    }, {
      id: "accept-b",
      label: "Accept later date",
      sub: "short of washout",
      tone: "review"
    }, {
      id: "request",
      label: "Request infusion records",
      sub: "confirm last dose",
      tone: "steel"
    }, {
      id: "defer",
      label: "Defer",
      sub: "pending",
      tone: "muted"
    }],
    "steroid-judgment": [{
      id: "eligible",
      label: "Eligible",
      sub: "steroids not disqualifying",
      tone: "ok"
    }, {
      id: "ineligible",
      label: "Exclude",
      sub: "meets E-7",
      tone: "fail"
    }, {
      id: "defer",
      label: "Defer",
      sub: "more data needed",
      tone: "muted"
    }]
  };

  // Patient-specific figure + which criterion blocks them. Keyed by candidate id.
  const ADJ = {
    "S-1047": {
      urgency: "critical",
      crit: "I-4.2",
      critName: "ECOG 0–1 within 14 days",
      gate: "ECOG",
      role: "PI / Sub-I",
      arche: "ecog-conflict",
      kind: "conflict",
      unit: "ECOG",
      q: "Two sources disagree on performance status. A PI must decide which governs eligibility.",
      a: {
        src: "Structured EHR",
        res: "Observation · 06-18",
        val: "1"
      },
      b: {
        src: "Oncology note",
        res: "Progress note · 06-20",
        val: "2"
      }
    },
    "S-1051": {
      urgency: "high",
      crit: "I-4.2",
      critName: "ECOG 0–1 within 14 days",
      gate: "ECOG",
      role: "PI / Sub-I",
      arche: "ecog-stale",
      kind: "stale",
      need: "ECOG within 14 days",
      res: "last assessment ECOG 1 · 06-01 · 19 days old",
      q: "The qualifying ECOG falls outside the 14-day window — it can't be used as-is."
    },
    "S-1066": {
      urgency: "high",
      crit: "I-2.1",
      critName: "EGFR / ALK molecular status",
      gate: "Biomarker",
      role: "Coordinator",
      arche: "biomarker-missing",
      kind: "missing",
      need: "EGFR / ALK",
      res: "molecular DiagnosticReport · not received",
      q: "Required evidence has not arrived — there is nothing to adjudicate until it does."
    },
    "S-1071": {
      urgency: "medium",
      crit: "I-2.1",
      critName: "EGFR / ALK molecular status",
      gate: "Biomarker",
      role: "Coordinator",
      arche: "biomarker-missing",
      kind: "missing",
      need: "EGFR / ALK",
      res: "outside-lab result · unmapped to criterion",
      q: "A molecular result exists but is not mapped to this criterion — it needs to be reconciled."
    },
    "S-1078": {
      urgency: "high",
      crit: "E-5.3",
      critName: "≥ 21-day therapy washout",
      gate: "Washout",
      role: "PI / Sub-I",
      arche: "washout-conflict",
      kind: "conflict",
      unit: "last dose",
      q: "Last-dose date is ambiguous across sources — it sets the washout clock.",
      a: {
        src: "Infusion record",
        res: "MedicationAdministration",
        val: "05-30"
      },
      b: {
        src: "Discharge summary",
        res: "DocumentReference",
        val: "06-02"
      }
    },
    "S-1083": {
      urgency: "medium",
      crit: "E-5.3",
      critName: "≥ 21-day therapy washout",
      gate: "Washout",
      role: "PI / Sub-I",
      arche: "washout-conflict",
      kind: "conflict",
      unit: "last dose",
      q: "Infusion timing is ambiguous between records — confirm the true last dose.",
      a: {
        src: "Infusion record",
        res: "MedicationAdministration",
        val: "05-29"
      },
      b: {
        src: "Pharmacy dispense",
        res: "MedicationDispense",
        val: "05-31"
      }
    },
    "S-1090": {
      urgency: "medium",
      crit: "E-7",
      critName: "Active CNS mets on steroids",
      gate: "Steroid",
      role: "PI / Sub-I",
      arche: "steroid-judgment",
      kind: "judgment",
      q: "The steroid course requires clinical interpretation against the E-7 exclusion.",
      a: {
        src: "MAR",
        res: "06-19",
        val: "Dexamethasone 4 mg, tapering"
      },
      b: {
        src: "Neuro-onc note",
        res: "06-17",
        val: "CNS mets radiologically stable"
      }
    },
    "S-1102": {
      urgency: "high",
      crit: "I-4.2",
      critName: "ECOG 0–1 within 14 days",
      gate: "ECOG",
      role: "PI / Sub-I",
      arche: "ecog-stale",
      kind: "stale",
      need: "ECOG within 14 days",
      res: "no assessment recorded in the window",
      q: "No ECOG has been recorded inside the 14-day window — a fresh assessment is required."
    }
  };
  const URG_RANK = {
    critical: 0,
    high: 1,
    medium: 2
  };
  function Resolve({
    focus,
    resolvedCases,
    onLock
  }) {
    const K = window.NodeKit;
    const {
      ACCENT,
      PASS,
      REVIEW,
      FAIL,
      BLOCK,
      HAIR,
      SUBT,
      Mono,
      CANDIDATES,
      GATES,
      urgencyColor
    } = K;
    const TONE = {
      ok: PASS,
      review: REVIEW,
      fail: FAIL,
      steel: ACCENT,
      muted: BLOCK
    };

    // the stalled patients, ordered by urgency then id
    const QUEUE = CANDIDATES.filter(c => c.stall && ADJ[c.id]).sort((a, b) => URG_RANK[ADJ[a.id].urgency] - URG_RANK[ADJ[b.id].urgency] || a.id.localeCompare(b.id));
    const firstOpen = QUEUE.find(c => !resolvedCases.has(c.id)) || QUEUE[0];
    const [sel, setSel] = React.useState(focus && ADJ[focus] ? focus : firstOpen.id);
    const [picks, setPicks] = React.useState({});
    const [reasons, setReasons] = React.useState({});
    const [seal, setSeal] = React.useState({});
    React.useEffect(() => {
      if (focus && ADJ[focus]) setSel(focus);
    }, [focus]);
    const patient = CANDIDATES.find(c => c.id === sel);
    const adj = ADJ[sel];
    const adjCol = urgencyColor(adj.urgency);
    const verdicts = VERDICTS[adj.arche] || [];
    const locked = resolvedCases.has(sel);
    const pick = picks[sel],
      reason = reasons[sel] || "";
    const canCommit = !!pick && reason.trim().length >= 4;
    const chosen = verdicts.find(v => v.id === pick);
    const record = seal[sel];
    const stamp = () => new Date().toISOString().slice(11, 19) + "Z";
    // other candidates blocked on the same criterion (each needs their own verdict)
    const cohort = QUEUE.filter(c => c.id !== sel && ADJ[c.id].crit === adj.crit);
    const commit = () => {
      setSeal(s => ({
        ...s,
        [sel]: {
          verdict: chosen,
          reason: reason.trim(),
          time: stamp()
        }
      }));
      onLock(sel);
    };
    const openCount = QUEUE.filter(c => !resolvedCases.has(c.id)).length;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        height: "100%",
        display: "flex",
        overflow: "hidden",
        background: "radial-gradient(900px 520px at 42% -5%, #0c1219, #07090c 70%)"
      }
    }, /*#__PURE__*/React.createElement("aside", {
      style: {
        width: 244,
        flexShrink: 0,
        borderRight: `1px solid ${HAIR}`,
        background: "#080b0f",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 18px 13px",
        borderBottom: `1px solid ${HAIR}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: 15,
        fontWeight: 700
      }
    }, "Awaiting judgment"), /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 10.5
      }
    }, openCount, " candidates \xB7 one verdict each")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 9,
        padding: "11px 16px",
        borderBottom: `1px solid ${HAIR}`,
        background: `color-mix(in srgb, ${ACCENT} 5%, transparent)`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: ACCENT,
        marginTop: 4,
        flexShrink: 0,
        boxShadow: `0 0 7px ${ACCENT}`
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      c: ACCENT,
      style: {
        fontSize: 10,
        letterSpacing: "0.06em",
        textTransform: "uppercase"
      }
    }, "Amendment A3 applied"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: "var(--ink-dim)",
        marginTop: 2,
        lineHeight: 1.4
      }
    }, "06-21 \xB7 2 candidates reopened with a new ECOG rule"))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: "auto",
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 6
      },
      className: "eyeScroll"
    }, QUEUE.map(c => {
      const a = ADJ[c.id],
        on = sel === c.id,
        cl = resolvedCases.has(c.id),
        cc = urgencyColor(a.urgency);
      return /*#__PURE__*/React.createElement("button", {
        key: c.id,
        onClick: () => setSel(c.id),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 11,
          width: "100%",
          textAlign: "left",
          padding: "10px 12px",
          borderRadius: 10,
          border: `1px solid ${on ? "color-mix(in srgb," + ACCENT + " 45%, transparent)" : "transparent"}`,
          borderLeft: `2px solid ${cl ? PASS : cc}`,
          background: on ? "color-mix(in srgb," + ACCENT + " 8%, transparent)" : "transparent",
          cursor: "pointer",
          opacity: cl && !on ? 0.5 : 1,
          transition: "background 130ms, border-color 130ms"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 20,
          height: 20,
          borderRadius: "50%",
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          border: `1.5px solid ${cl ? PASS : cc}`,
          background: cl ? "color-mix(in srgb," + PASS + " 18%, transparent)" : "transparent"
        }
      }, cl ? /*#__PURE__*/React.createElement("svg", {
        width: "10",
        height: "10",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: PASS,
        strokeWidth: "3",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("polyline", {
        points: "20 6 9 17 4 12"
      })) : /*#__PURE__*/React.createElement("span", {
        style: {
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: cc
        }
      })), /*#__PURE__*/React.createElement("span", {
        style: {
          minWidth: 0,
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "flex",
          alignItems: "baseline",
          gap: 6
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 13,
          fontWeight: on ? 600 : 500,
          color: on ? "var(--ink-cold)" : "var(--ink-quiet)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }
      }, c.name), /*#__PURE__*/React.createElement(Mono, {
        style: {
          fontSize: 9.5,
          color: "var(--ink-dim)",
          marginLeft: "auto",
          flexShrink: 0
        }
      }, c.id)), /*#__PURE__*/React.createElement(Mono, {
        c: cl ? PASS : cc,
        style: {
          fontSize: 10,
          display: "block",
          marginTop: 2
        }
      }, cl ? "committed" : "blocked · " + a.gate)));
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "15px 30px 14px",
        borderBottom: `1px solid ${HAIR}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 11
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        margin: 0,
        fontFamily: "var(--font-display)",
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: "-0.02em",
        whiteSpace: "nowrap"
      }
    }, patient.name), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 9px",
        borderRadius: 99,
        border: `1px solid ${HAIR}`,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: "var(--ink-dim)"
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 9.5,
        letterSpacing: "0.06em",
        textTransform: "uppercase"
      }
    }, "Synthetic \xB7 FHIR")), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: "auto",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: locked ? PASS : adjCol
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      c: locked ? PASS : adjCol,
      style: {
        fontSize: 10.5,
        letterSpacing: "0.06em",
        textTransform: "uppercase"
      }
    }, locked ? "verdict committed" : "blocked at " + adj.gate))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginTop: 9
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 11,
        color: "var(--ink-dim)",
        flexShrink: 0
      }
    }, patient.mrn, " \xB7 ", patient.age, patient.sex, " \xB7 ", patient.id), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 3,
        height: 3,
        borderRadius: "50%",
        background: "var(--ink-dim)",
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      c: adjCol,
      style: {
        fontSize: 11.5,
        flexShrink: 0
      }
    }, adj.crit), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: "var(--ink-quiet)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, adj.critName))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: "auto",
        padding: "22px 30px 30px"
      },
      className: "eyeScroll"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 1060
      }
    }, /*#__PURE__*/React.createElement(ZoneLabel, {
      n: "1",
      text: adj.kind === "missing" ? "The gap" : adj.kind === "stale" ? "Out of window" : adj.kind === "judgment" ? "The clinical picture" : "The disagreement",
      K: K
    }), adj.kind === "missing" || adj.kind === "stale" ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "24px 24px",
        borderRadius: 14,
        border: `1.5px dashed color-mix(in srgb, ${REVIEW} 50%, transparent)`,
        background: "color-mix(in srgb," + REVIEW + " 5%, #0a0e13)",
        display: "flex",
        alignItems: "center",
        gap: 20
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 50,
        height: 50,
        borderRadius: "50%",
        flexShrink: 0,
        border: `1.5px dashed ${REVIEW}`,
        display: "grid",
        placeItems: "center",
        fontSize: 20,
        color: REVIEW
      }
    }, adj.kind === "missing" ? "?" : "⟳"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: "-0.01em",
        color: "var(--ink-cold)"
      }
    }, adj.need), /*#__PURE__*/React.createElement(Mono, {
      c: REVIEW,
      style: {
        fontSize: 12,
        marginTop: 5,
        display: "block"
      }
    }, adj.res))) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "stretch",
        borderRadius: 14,
        border: `1px solid ${HAIR}`,
        overflow: "hidden",
        background: "#0a0e13"
      }
    }, [adj.a, adj.b].map((side, i) => /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, i === 1 ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 8px",
        background: "color-mix(in srgb," + FAIL + " 7%, transparent)",
        borderLeft: `1px solid color-mix(in srgb, ${FAIL} 30%, transparent)`,
        borderRight: `1px solid color-mix(in srgb, ${FAIL} 30%, transparent)`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: 22,
        fontWeight: 700,
        color: FAIL,
        lineHeight: 1
      }
    }, "\u2260")) : null, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 4
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 10,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--ink-dim)"
      }
    }, side.src), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "baseline",
        gap: 10,
        margin: "6px 0 2px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: adj.kind === "conflict" ? 40 : 17,
        fontWeight: 700,
        letterSpacing: "-0.02em",
        color: "var(--ink-cold)",
        lineHeight: 1.05
      }
    }, side.val), adj.unit && adj.kind === "conflict" ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--ink-dim)"
      }
    }, adj.unit) : null), /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 10.5
      }
    }, side.res))))), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: "13px 0 0",
        fontSize: 13.5,
        lineHeight: 1.5,
        color: "var(--ink-faint)"
      }
    }, adj.q), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 28
      }
    }, /*#__PURE__*/React.createElement(ZoneLabel, {
      n: "2",
      text: "Your call",
      K: K
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: verdicts.length === 3 ? "repeat(3,1fr)" : "repeat(2,1fr)",
        gap: 10
      }
    }, verdicts.map(v => {
      const on = pick === v.id,
        tc = TONE[v.tone];
      return /*#__PURE__*/React.createElement("button", {
        key: v.id,
        disabled: locked,
        onClick: () => setPicks(p => ({
          ...p,
          [sel]: v.id
        })),
        style: {
          textAlign: "left",
          padding: "14px 16px",
          borderRadius: 11,
          cursor: locked ? "default" : "pointer",
          opacity: locked && !on ? 0.4 : 1,
          border: `1px solid ${on ? tc : HAIR}`,
          background: on ? `color-mix(in srgb, ${tc} 12%, #0a0e13)` : "#0a0e13",
          boxShadow: on ? `0 0 0 1px ${tc} inset` : "none",
          transition: "border-color 130ms, background 130ms"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 9
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 15,
          height: 15,
          borderRadius: "50%",
          flexShrink: 0,
          border: `1.5px solid ${on ? tc : "rgba(169,192,214,0.3)"}`,
          display: "grid",
          placeItems: "center"
        }
      }, on ? /*#__PURE__*/React.createElement("span", {
        style: {
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: tc
        }
      }) : null), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 13.5,
          fontWeight: 600,
          color: "var(--ink-cold)"
        }
      }, v.label)), /*#__PURE__*/React.createElement(Mono, {
        c: on ? tc : "var(--ink-dim)",
        style: {
          fontSize: 10.5,
          marginTop: 7,
          marginLeft: 24,
          display: "block"
        }
      }, v.sub));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 10,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        display: "block",
        marginBottom: 8
      }
    }, "Clinical rationale \xB7 bound to ", patient.id), /*#__PURE__*/React.createElement("textarea", {
      value: reason,
      disabled: locked,
      onChange: e => setReasons(r => ({
        ...r,
        [sel]: e.target.value
      })),
      placeholder: adj.kind === "missing" ? "Why this disposition — e.g. molecular result outstanding, requesting from pathology…" : "State the basis for the verdict — which source you trust and why…",
      style: {
        width: "100%",
        minHeight: 60,
        resize: "vertical",
        padding: "12px 14px",
        borderRadius: 10,
        background: "#0a0e13",
        border: `1px solid ${HAIR}`,
        color: "var(--ink-cold)",
        fontFamily: "var(--font-body)",
        fontSize: 13,
        lineHeight: 1.5,
        outline: "none",
        opacity: locked ? 0.55 : 1
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 28
      }
    }, /*#__PURE__*/React.createElement(ZoneLabel, {
      n: "3",
      text: "Commit the verdict",
      K: K
    }), locked && record ? /*#__PURE__*/React.createElement("div", {
      "data-seal": "1",
      style: {
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid color-mix(in srgb,${PASS} 34%, transparent)`,
        background: "color-mix(in srgb," + PASS + " 6%, #0a0e13)",
        animation: "sealIn 460ms ease-out"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "15px 18px",
        borderBottom: `1px solid ${SUBT}`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 22,
        height: 22,
        borderRadius: "50%",
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        background: "color-mix(in srgb," + PASS + " 22%, transparent)",
        border: `1.5px solid ${PASS}`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: PASS
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        fontVariantNumeric: "tabular-nums lining-nums",
        fontSize: 9.5,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: PASS
      }
    }, "Verdict committed \xB7 ", patient.id, " attested"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14.5,
        fontWeight: 600,
        color: "var(--ink-cold)",
        marginTop: 3
      }
    }, record.verdict.label, " ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--ink-dim)",
        fontWeight: 400
      }
    }, "\xB7 ", record.verdict.sub))), /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 9.5,
        color: "var(--ink-dim)",
        textAlign: "right",
        flexShrink: 0
      }
    }, "human-owned", /*#__PURE__*/React.createElement("br", null), "bound to Replay")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "12px 18px",
        borderBottom: `1px solid ${SUBT}`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: "var(--ink-quiet)",
        fontStyle: "italic",
        lineHeight: 1.5
      }
    }, "\u201C", record.reason, "\u201D")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: "9px 18px",
        padding: "14px 18px"
      }
    }, [["Reviewer", "Dr. A. Reyes"], ["Role", adj.role], ["Candidate", patient.id], ["Protocol", "v2.1 · aead45cf"], ["Evidence-hash", "c1f9…7e"], ["Committed", record.time]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-body)",
        fontVariantNumeric: "tabular-nums lining-nums",
        fontSize: 9,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--ink-dim)"
      }
    }, k), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-body)",
        fontVariantNumeric: "tabular-nums lining-nums",
        fontSize: 11.5,
        color: "var(--ink-cold)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, v))))) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 20px",
        borderRadius: 12,
        border: `1px solid ${canCommit ? "color-mix(in srgb," + ACCENT + " 42%, transparent)" : HAIR}`,
        background: canCommit ? "color-mix(in srgb," + ACCENT + " 8%, #0a0e13)" : "#0a0e13"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: "var(--ink-cold)"
      }
    }, chosen ? chosen.label : "Select a verdict"), /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 10.5,
        marginTop: 4,
        display: "block"
      }
    }, !pick ? "A judgment is required before commit" : !reason.trim() ? "Add the rationale to enable commit" : `Binds ${patient.id} to ${adj.crit} · ${adj.role} · WORM`)), /*#__PURE__*/React.createElement("button", {
      onClick: commit,
      disabled: !canCommit,
      style: {
        padding: "11px 22px",
        borderRadius: 8,
        cursor: canCommit ? "pointer" : "not-allowed",
        fontFamily: "var(--font-display)",
        fontSize: 14,
        fontWeight: 600,
        color: "var(--ink-cold)",
        flexShrink: 0,
        border: `1px solid color-mix(in srgb,${ACCENT} ${canCommit ? 50 : 18}%, transparent)`,
        background: canCommit ? "linear-gradient(180deg, color-mix(in srgb," + ACCENT + " 30%, transparent), color-mix(in srgb," + ACCENT + " 12%, transparent))" : "rgba(169,192,214,0.04)",
        opacity: canCommit ? 1 : 0.5
      }
    }, "Acknowledge & commit")))))), /*#__PURE__*/React.createElement("aside", {
      style: {
        width: 224,
        flexShrink: 0,
        borderLeft: `1px solid ${HAIR}`,
        background: "#080b0f",
        overflowY: "auto"
      },
      className: "eyeScroll"
    }, /*#__PURE__*/React.createElement(Block, {
      K: K,
      title: "This candidate's path"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 0
      }
    }, GATES.map((g, i) => {
      const stallIdx = GATES.indexOf(adj.gate);
      const st = locked && i === stallIdx ? "done" : i < stallIdx ? "pass" : i === stallIdx ? "stall" : "pending";
      const c = st === "pass" ? "var(--ink-dim)" : st === "stall" ? adjCol : st === "done" ? PASS : "rgba(169,192,214,0.2)";
      return /*#__PURE__*/React.createElement("div", {
        key: g,
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "6px 0"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 16,
          height: 16,
          borderRadius: "50%",
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          border: `1.5px solid ${c}`,
          background: st === "stall" || st === "done" ? `color-mix(in srgb, ${c} 18%, transparent)` : "transparent"
        }
      }, st === "pass" || st === "done" ? /*#__PURE__*/React.createElement("svg", {
        width: "8",
        height: "8",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: c,
        strokeWidth: "3.5",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }, /*#__PURE__*/React.createElement("polyline", {
        points: "20 6 9 17 4 12"
      })) : st === "stall" ? /*#__PURE__*/React.createElement("span", {
        style: {
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: c
        }
      }) : null), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 12.5,
          color: st === "pending" ? "var(--ink-dim)" : st === "stall" ? "var(--ink-cold)" : "var(--ink-quiet)",
          fontWeight: st === "stall" ? 600 : 400
        }
      }, g), st === "stall" ? /*#__PURE__*/React.createElement(Mono, {
        c: c,
        style: {
          fontSize: 9.5,
          marginLeft: "auto"
        }
      }, "here") : null);
    }))), /*#__PURE__*/React.createElement(Block, {
      K: K,
      title: "Required role"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: adj.role.includes("PI") ? ACCENT : "var(--ink-dim)"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: "var(--ink-cold)"
      }
    }, adj.role)), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: "7px 0 0",
        fontSize: 10.5,
        color: "var(--ink-dim)",
        lineHeight: 1.45
      }
    }, "Only this role can commit the verdict. The system never renders it.")), cohort.length ? /*#__PURE__*/React.createElement(Block, {
      K: K,
      title: `Also blocked at ${adj.crit} · ${cohort.length}`
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 7
      }
    }, cohort.map(c => /*#__PURE__*/React.createElement("button", {
      key: c.id,
      onClick: () => setSel(c.id),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 9,
        width: "100%",
        textAlign: "left",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: resolvedCases.has(c.id) ? PASS : urgencyColor(ADJ[c.id].urgency),
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "var(--ink-quiet)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, c.name), /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 9.5,
        marginLeft: "auto",
        flexShrink: 0
      }
    }, c.id)))), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: "9px 0 0",
        fontSize: 10.5,
        color: "var(--ink-dim)",
        lineHeight: 1.45
      }
    }, "Each requires its own verdict \u2014 judgments are not shared across patients.")) : null, /*#__PURE__*/React.createElement(Block, {
      K: K,
      title: "Replay impact"
    }, /*#__PURE__*/React.createElement(Mono, {
      c: locked ? PASS : "var(--ink-quiet)",
      style: {
        fontSize: 11
      }
    }, locked ? "Bound · 1 decision sealed" : "1 decision will bind to " + adj.crit), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: "7px 0 0",
        fontSize: 10.5,
        color: "var(--ink-dim)",
        lineHeight: 1.45
      }
    }, "The verdict, its rationale, the evidence snapshot, and the reviewer are sealed together \u2014 reconstructable in Replay."))));
  }
  function ZoneLabel({
    n,
    text,
    K
  }) {
    const {
      ACCENT
    } = K;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 13
      }
    }, n ? /*#__PURE__*/React.createElement("span", {
      style: {
        width: 20,
        height: 20,
        borderRadius: 6,
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        fontFamily: "var(--font-body)",
        fontVariantNumeric: "tabular-nums lining-nums",
        fontSize: 11,
        fontWeight: 700,
        color: ACCENT,
        border: `1px solid color-mix(in srgb, ${ACCENT} 32%, transparent)`,
        background: "color-mix(in srgb," + ACCENT + " 8%, transparent)"
      }
    }, n) : null, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-body)",
        fontVariantNumeric: "tabular-nums lining-nums",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--ink-quiet)"
      }
    }, text));
  }
  function Block({
    K,
    title,
    children
  }) {
    const {
      SUBT
    } = K;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "16px 18px",
        borderBottom: `1px solid ${SUBT}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-body)",
        fontVariantNumeric: "tabular-nums lining-nums",
        fontSize: 9.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--ink-dim)",
        marginBottom: 10
      }
    }, title), children);
  }
  window.NodeResolve = Resolve;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/node/NodeResolve.jsx", error: String((e && e.message) || e) }); }

// ui_kits/node/NodeScreening.jsx
try { (() => {
/* Field UI Kit — Node · Screening (gate flowchart)
 * Simple and clean: the protocol gates as nodes on one line, each showing its
 * pass · review · fail in real patient counts. The candidates a gate holds for
 * review appear as interactive dots above it — hover for the conflict, click to
 * resolve. No flow fills, no decorative dots. Deterministic engine; never a verdict.
 * window.NodeScreening.
 */
(function () {
  const GATES = [{
    id: "Biomarker",
    code: "I-2.1",
    pass: 55,
    review: 3,
    fail: 14,
    reason: "EGFR / ALK wild-type · squamous histology · no molecular profile on file"
  }, {
    id: "ECOG",
    code: "I-4.2",
    pass: 32,
    review: 5,
    fail: 18,
    reason: "ECOG ≥ 2 documented — exceeds the 0–1 performance limit"
  }, {
    id: "Washout",
    code: "E-5.3",
    pass: 17,
    review: 3,
    fail: 12,
    reason: "Systemic therapy administered inside the 21-day washout window"
  }, {
    id: "Steroid",
    code: "E-7",
    pass: 6,
    review: 2,
    fail: 9,
    reason: "Active CNS metastases on escalating steroids — meets exclusion"
  }];
  function Screening({
    sel,
    setSel,
    setStep
  }) {
    const K = window.NodeKit;
    const {
      ACCENT,
      PASS,
      REVIEW,
      HAIR,
      SUBT,
      Mono,
      CANDIDATES,
      patientOf
    } = K;
    const [selGate, setSelGate] = React.useState(null);
    const [hovCand, setHovCand] = React.useState(null);
    const reviewAt = g => CANDIDATES.filter(c => c.stall === g);
    const open = c => {
      setSel(s => ({
        ...s,
        case: c.id,
        criterion: c.cluster === "ecog" ? "I-4.2" : c.cluster === "biomarker" ? "I-2.1" : c.cluster === "washout" ? "E-5.3" : "E-7"
      }));
      setStep(3);
    };
    const hg = GATES.find(g => g.id === selGate);
    const Connector = () => /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 1,
        background: HAIR,
        minWidth: 8
      }
    });
    const Terminus = ({
      n,
      label,
      color
    }) => /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 56,
        height: 56,
        borderRadius: "50%",
        border: `1.5px solid ${color}`,
        display: "grid",
        placeItems: "center",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: 22,
        fontWeight: 700,
        color: color
      }
    }, n)), /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 10.5,
        letterSpacing: "0.06em",
        textTransform: "uppercase"
      }
    }, label));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        flex: 1,
        minWidth: 0,
        height: "100%",
        overflow: "hidden",
        background: "#07090c"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 52,
        borderBottom: `1px solid ${HAIR}`,
        background: "rgba(8,11,15,0.6)",
        display: "flex",
        alignItems: "center",
        gap: 22,
        padding: "0 26px",
        zIndex: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-display)",
        fontSize: 16,
        fontWeight: 700
      }
    }, "Screening"), /*#__PURE__*/React.createElement(Mono, {
      style: {
        fontSize: 10.5
      }
    }, "deterministic \xB7 re-run after A3"), [["72", "evaluated", "var(--ink-cold)"], ["6", "eligible", PASS], ["13", "review", REVIEW], ["53", "ineligible", "var(--ink-dim)"]].map(([v, l, col]) => /*#__PURE__*/React.createElement("div", {
      key: l,
      style: {
        display: "flex",
        alignItems: "baseline",
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-body)",
        fontVariantNumeric: "tabular-nums lining-nums",
        fontSize: 14,
        color: col
      }
    }, v), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "var(--ink-dim)"
      }
    }, l))), /*#__PURE__*/React.createElement(Mono, {
      c: "var(--ink-dim)",
      style: {
        marginLeft: "auto",
        fontSize: 10
      }
    }, "snapshot pop-2026-06-22 \xB7 72 FHIR patients \xB7 synthetic")), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        top: 52,
        left: 0,
        right: 0,
        bottom: 72,
        display: "flex",
        alignItems: "center",
        padding: "0 22px"
      }
    }, /*#__PURE__*/React.createElement(Terminus, {
      n: "72",
      label: "Cohort",
      color: "var(--ink-quiet)"
    }), /*#__PURE__*/React.createElement(Connector, null), GATES.map((g, i) => {
      const named = reviewAt(g.id);
      const on = selGate === g.id,
        dim = selGate && !on;
      return /*#__PURE__*/React.createElement(React.Fragment, {
        key: g.id
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
          opacity: dim ? 0.4 : 1,
          transition: "opacity 140ms"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: 8,
          height: 30,
          alignItems: "center",
          marginBottom: 12
        }
      }, named.map(c => {
        const isH = hovCand === c.id;
        return /*#__PURE__*/React.createElement("button", {
          key: c.id,
          onMouseEnter: () => setHovCand(c.id),
          onMouseLeave: () => setHovCand(null),
          onClick: () => open(c),
          style: {
            width: 15,
            height: 15,
            borderRadius: "50%",
            padding: 0,
            cursor: "pointer",
            border: `1.5px solid ${REVIEW}`,
            background: `radial-gradient(circle at 50% 35%, color-mix(in srgb, ${REVIEW} 55%, #0a0e13), #0a0e13)`,
            transform: `scale(${isH ? 1.25 : 1})`,
            boxShadow: isH ? `0 0 0 4px color-mix(in srgb, ${REVIEW} 22%, transparent)` : "none",
            transition: "transform 120ms, box-shadow 120ms"
          }
        });
      }), g.review > named.length ? /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: "var(--font-body)",
          fontVariantNumeric: "tabular-nums lining-nums",
          fontSize: 10,
          color: REVIEW
        }
      }, "+", g.review - named.length) : null), /*#__PURE__*/React.createElement("button", {
        onClick: () => setSelGate(on ? null : g.id),
        style: {
          width: 128,
          textAlign: "center",
          padding: "12px 12px",
          borderRadius: 12,
          cursor: "pointer",
          background: "transparent",
          border: `1px solid ${on ? "color-mix(in srgb, " + ACCENT + " 55%, transparent)" : HAIR}`,
          boxShadow: on ? `0 0 0 1px color-mix(in srgb, ${ACCENT} 40%, transparent)` : "none",
          transition: "border-color 140ms"
        }
      }, /*#__PURE__*/React.createElement(Mono, {
        c: g.review ? REVIEW : "var(--ink-dim)",
        style: {
          fontSize: 10.5,
          display: "block"
        }
      }, g.code), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 14,
          fontWeight: 600,
          color: "var(--ink-cold)",
          margin: "5px 0 9px"
        }
      }, g.id), /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
          fontFamily: "var(--font-body)",
          fontVariantNumeric: "tabular-nums lining-nums",
          fontSize: 11
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          color: PASS
        }
      }, g.pass), /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--ink-dim)"
        }
      }, "\xB7"), /*#__PURE__*/React.createElement("span", {
        style: {
          color: REVIEW
        }
      }, g.review), /*#__PURE__*/React.createElement("span", {
        style: {
          color: "var(--ink-dim)"
        }
      }, "\xB7"), /*#__PURE__*/React.createElement("span", {
        style: {
          color: "rgba(124,138,153,0.85)"
        }
      }, g.fail))), named.some(c => c.id === hovCand) ? (() => {
        const c = named.find(x => x.id === hovCand),
          p = patientOf(c.id);
        return /*#__PURE__*/React.createElement("div", {
          style: {
            position: "absolute",
            top: -8,
            left: "50%",
            transform: "translate(-50%,-100%)",
            width: 200,
            padding: "11px 13px",
            borderRadius: 10,
            background: "#0b0f14",
            border: `1px solid ${HAIR}`,
            boxShadow: "0 16px 36px rgba(0,0,0,0.55)",
            zIndex: 20,
            pointerEvents: "none"
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: "flex",
            alignItems: "center",
            gap: 8
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: REVIEW
          }
        }), /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 13,
            fontWeight: 600,
            color: "var(--ink-cold)"
          }
        }, p.name), /*#__PURE__*/React.createElement(Mono, {
          style: {
            marginLeft: "auto",
            fontSize: 10
          }
        }, c.id)), /*#__PURE__*/React.createElement("p", {
          style: {
            margin: "6px 0 0",
            fontSize: 11.5,
            lineHeight: 1.4,
            color: "var(--ink-quiet)"
          }
        }, c.note), /*#__PURE__*/React.createElement(Mono, {
          c: "var(--ink-dim)",
          style: {
            fontSize: 10,
            marginTop: 7,
            display: "block"
          }
        }, "click to resolve \u2192"));
      })() : null), /*#__PURE__*/React.createElement(Connector, null));
    }), /*#__PURE__*/React.createElement(Terminus, {
      n: "6",
      label: "Eligible",
      color: PASS
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 72,
        borderTop: `1px solid ${HAIR}`,
        background: "#080b0f",
        display: "flex",
        alignItems: "center",
        zIndex: 7
      }
    }, hg ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 26px",
        width: "100%"
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      c: REVIEW,
      style: {
        fontSize: 11,
        whiteSpace: "nowrap",
        flexShrink: 0
      }
    }, hg.code), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        fontWeight: 600,
        color: "var(--ink-cold)",
        flexShrink: 0
      }
    }, hg.id), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12.5,
        color: "var(--ink-quiet)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, hg.reason), /*#__PURE__*/React.createElement(Mono, {
      style: {
        marginLeft: "auto",
        fontSize: 11,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: PASS
      }
    }, hg.pass, " pass"), " \xB7 ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: REVIEW
      }
    }, hg.review, " review"), " \xB7 ", hg.fail, " fail"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setSelGate(null),
      style: {
        flexShrink: 0,
        padding: "5px 11px",
        borderRadius: 7,
        cursor: "pointer",
        border: `1px solid ${HAIR}`,
        background: "transparent",
        fontFamily: "var(--font-body)",
        fontVariantNumeric: "tabular-nums lining-nums",
        fontSize: 10.5,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "var(--ink-dim)"
      }
    }, "clear")) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "0 26px",
        width: "100%"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 11.5,
        color: "var(--ink-dim)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: "50%",
        background: PASS
      }
    }), "pass"), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 11.5,
        color: "var(--ink-dim)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: "50%",
        background: REVIEW
      }
    }), "review \xB7 click a dot to resolve"), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 11.5,
        color: "var(--ink-dim)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: "50%",
        background: "rgba(124,138,153,0.7)"
      }
    }), "fail"), /*#__PURE__*/React.createElement(Mono, {
      c: "var(--ink-dim)",
      style: {
        marginLeft: "auto",
        fontSize: 10.5
      }
    }, "Click a gate to focus \xB7 the engine renders the split, never the verdict"))));
  }
  window.NodeScreening = Screening;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/node/NodeScreening.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.Kbd = __ds_scope.Kbd;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.ReviewChip = __ds_scope.ReviewChip;

__ds_ns.StatusBadge = __ds_scope.StatusBadge;

__ds_ns.TrustPill = __ds_scope.TrustPill;

__ds_ns.Stepper = __ds_scope.Stepper;

})();
