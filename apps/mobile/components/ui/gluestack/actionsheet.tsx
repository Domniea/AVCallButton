import {
  View,
  Text,
  Pressable,
  ScrollView,
  FlatList,
  SectionList,
  VirtualizedList,
} from "react-native";
import { createActionsheet } from "@gluestack-ui/core/actionsheet/creator";

/**
 * Gluestack headless Actionsheet → RN primitives (no NativeWind / AnimatePresence).
 */
export const Actionsheet: any = createActionsheet({
  Root: View as any,
  Backdrop: Pressable as any,
  Content: View as any,
  Item: Pressable as any,
  ItemText: Text as any,
  DragIndicator: View as any,
  IndicatorWrapper: View as any,
  ScrollView: ScrollView as any,
  VirtualizedList: VirtualizedList as any,
  FlatList: FlatList as any,
  SectionList: SectionList as any,
  SectionHeaderText: Text as any,
  Icon: View as any,
});
