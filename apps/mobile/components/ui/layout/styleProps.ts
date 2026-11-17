import { StyleProp, ViewStyle, TextStyle, FlexAlignType } from "react-native";
import type { ColorMode } from "@av/ui";
import {
  spaceValue,
  sizeValue,
  radiusValue,
  fontSizeValue,
  resolveColor,
  FONT_WEIGHTS,
} from "./tokens";

export type StylePropBag = Record<string, unknown>;

function pickAlign(v: unknown): FlexAlignType | undefined {
  if (typeof v !== "string") return undefined;
  return v as FlexAlignType;
}

/** Map NativeBase-like layout props → RN ViewStyle */
export function viewStyleFromProps(
  props: StylePropBag,
  mode: ColorMode,
): ViewStyle {
  const style: ViewStyle = {};

  const flex = props.flex;
  if (flex != null) style.flex = flex as number;

  if (props.flexDir || props.flexDirection) {
    style.flexDirection = (props.flexDir || props.flexDirection) as ViewStyle["flexDirection"];
  }
  if (props.alignItems) style.alignItems = pickAlign(props.alignItems);
  if (props.alignSelf) style.alignSelf = pickAlign(props.alignSelf) as ViewStyle["alignSelf"];
  if (props.justifyContent)
    style.justifyContent = props.justifyContent as ViewStyle["justifyContent"];
  if (props.flexWrap) style.flexWrap = props.flexWrap as ViewStyle["flexWrap"];
  if (props.overflow) style.overflow = props.overflow as ViewStyle["overflow"];
  if (props.position) style.position = props.position as ViewStyle["position"];
  if (props.display) style.display = props.display as ViewStyle["display"];
  if (props.zIndex != null) style.zIndex = props.zIndex as number;
  if (props.opacity != null) style.opacity = props.opacity as number;

  const w = sizeValue(props.w ?? props.width);
  if (w != null) style.width = w as ViewStyle["width"];
  const h = sizeValue(props.h ?? props.height);
  if (h != null) style.height = h as ViewStyle["height"];
  const minW = sizeValue(props.minW ?? props.minWidth);
  if (minW != null) style.minWidth = minW as ViewStyle["minWidth"];
  const maxW = sizeValue(props.maxW ?? props.maxWidth);
  if (maxW != null) style.maxWidth = maxW as ViewStyle["maxWidth"];
  const minH = sizeValue(props.minH ?? props.minHeight);
  if (minH != null) style.minHeight = minH as ViewStyle["minHeight"];
  const maxH = sizeValue(props.maxH ?? props.maxHeight);
  if (maxH != null) style.maxHeight = maxH as ViewStyle["maxHeight"];

  const p = spaceValue(props.p ?? props.padding);
  if (p != null) style.padding = p;
  const px = spaceValue(props.px ?? props.paddingX);
  if (px != null) {
    style.paddingHorizontal = px;
  }
  const py = spaceValue(props.py ?? props.paddingY);
  if (py != null) style.paddingVertical = py;
  const pt = spaceValue(props.pt ?? props.paddingTop);
  if (pt != null) style.paddingTop = pt;
  const pb = spaceValue(props.pb ?? props.paddingBottom);
  if (pb != null) style.paddingBottom = pb;
  const pl = spaceValue(props.pl ?? props.paddingLeft);
  if (pl != null) style.paddingLeft = pl;
  const pr = spaceValue(props.pr ?? props.paddingRight);
  if (pr != null) style.paddingRight = pr;

  const m = spaceValue(props.m ?? props.margin);
  if (m != null) style.margin = m;
  const mx = spaceValue(props.mx ?? props.marginX);
  if (mx != null) style.marginHorizontal = mx;
  const my = spaceValue(props.my ?? props.marginY);
  if (my != null) style.marginVertical = my;
  const mt = spaceValue(props.mt ?? props.marginTop);
  if (mt != null) style.marginTop = mt;
  const mb = spaceValue(props.mb ?? props.marginBottom);
  if (mb != null) style.marginBottom = mb;
  const ml = spaceValue(props.ml ?? props.marginLeft);
  if (ml != null) style.marginLeft = ml;
  const mr = spaceValue(props.mr ?? props.marginRight);
  if (mr != null) style.marginRight = mr;

  const top = spaceValue(props.top);
  if (top != null) style.top = top;
  const bottom = spaceValue(props.bottom);
  if (bottom != null) style.bottom = bottom;
  const left = spaceValue(props.left);
  if (left != null) style.left = left;
  const right = spaceValue(props.right);
  if (right != null) style.right = right;

  const bg = resolveColor(props.bg ?? props.backgroundColor, mode);
  if (bg) style.backgroundColor = bg;

  const borderColor = resolveColor(props.borderColor, mode);
  if (borderColor) style.borderColor = borderColor;
  if (props.borderWidth != null) style.borderWidth = props.borderWidth as number;
  if (props.borderBottomWidth != null)
    style.borderBottomWidth = props.borderBottomWidth as number;
  if (props.borderTopWidth != null)
    style.borderTopWidth = props.borderTopWidth as number;

  const br = radiusValue(props.borderRadius ?? props.rounded);
  if (br != null) style.borderRadius = br;

  if (props.gap != null) {
    const g = spaceValue(props.gap);
    if (g != null) style.gap = g;
  }

  // Soft shadow approximation from token name (RN limited)
  if (props.shadow && props.shadow !== "none") {
    style.shadowColor = "#000";
    style.shadowOffset = { width: 0, height: 2 };
    style.shadowOpacity = mode === "dark" ? 0.35 : 0.12;
    style.shadowRadius = 8;
    style.elevation = 3;
  }

  return style;
}

export function textStyleFromProps(
  props: StylePropBag,
  mode: ColorMode,
): TextStyle {
  const style: TextStyle = { ...viewStyleFromProps(props, mode) };

  const color = resolveColor(props.color, mode);
  if (color) style.color = color;

  const fs = fontSizeValue(props.fontSize);
  if (fs != null) style.fontSize = fs;

  if (typeof props.fontWeight === "string" && props.fontWeight in FONT_WEIGHTS) {
    style.fontWeight = FONT_WEIGHTS[props.fontWeight];
  } else if (props.fontWeight != null) {
    style.fontWeight = String(props.fontWeight) as TextStyle["fontWeight"];
  }

  if (props.fontFamily === "heading") {
    style.fontWeight = style.fontWeight ?? "600";
  }

  if (props.textAlign)
    style.textAlign = props.textAlign as TextStyle["textAlign"];
  if (props.textTransform)
    style.textTransform = props.textTransform as TextStyle["textTransform"];
  if (props.letterSpacing != null)
    style.letterSpacing = props.letterSpacing as number;
  if (props.lineHeight != null) style.lineHeight = props.lineHeight as number;
  if (props.textDecorationLine)
    style.textDecorationLine =
      props.textDecorationLine as TextStyle["textDecorationLine"];

  return style;
}

export function mergeStyles<T>(
  ...styles: Array<StyleProp<T> | false | null | undefined>
): StyleProp<T> {
  return styles.filter(Boolean) as StyleProp<T>;
}

const STYLE_PROP_KEYS = new Set([
  "flex",
  "flexDir",
  "flexDirection",
  "alignItems",
  "alignSelf",
  "justifyContent",
  "flexWrap",
  "overflow",
  "position",
  "display",
  "zIndex",
  "opacity",
  "w",
  "width",
  "h",
  "height",
  "minW",
  "minWidth",
  "maxW",
  "maxWidth",
  "minH",
  "minHeight",
  "maxH",
  "maxHeight",
  "p",
  "padding",
  "px",
  "paddingX",
  "py",
  "paddingY",
  "pt",
  "paddingTop",
  "pb",
  "paddingBottom",
  "pl",
  "paddingLeft",
  "pr",
  "paddingRight",
  "m",
  "margin",
  "mx",
  "marginX",
  "my",
  "marginY",
  "mt",
  "marginTop",
  "mb",
  "marginBottom",
  "ml",
  "marginLeft",
  "mr",
  "marginRight",
  "top",
  "bottom",
  "left",
  "right",
  "bg",
  "backgroundColor",
  "borderColor",
  "borderWidth",
  "borderBottomWidth",
  "borderTopWidth",
  "borderRadius",
  "rounded",
  "gap",
  "shadow",
  "color",
  "fontSize",
  "fontWeight",
  "fontFamily",
  "textAlign",
  "textTransform",
  "letterSpacing",
  "lineHeight",
  "textDecorationLine",
  "space",
  "_pressed",
  "style",
  "children",
]);

export function restNativeProps(props: StylePropBag): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    if (!STYLE_PROP_KEYS.has(k)) out[k] = v;
  }
  return out;
}
