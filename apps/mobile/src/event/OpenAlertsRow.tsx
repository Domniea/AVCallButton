import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

import { ListRow } from "../../components/ListRow";
import { severityAccent } from "./alertBoardUi";
import type { MainTabParamList } from "../navigation/types";

/** Compact Event-home link into the Alerts tab (avoids duplicating the board). */
export function OpenAlertsRow({ subtitle }: { subtitle?: string }) {
  const navigation = useNavigation();

  return (
    <ListRow
      title="Alerts"
      subtitle={subtitle ?? "Active requests — resolve or open a room"}
      meta="Open Alerts tab"
      accentColor={severityAccent("urgent")}
      onPress={() => {
        const tabNav =
          navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();
        tabNav?.navigate("alerts", { screen: "alertsHome" });
      }}
    />
  );
}
