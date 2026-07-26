/** Pop detail screens and land on the Dashboard tab. */
export function navigateToDashboard(navigation: {
  navigate: (screen: "MainTabs", params: { screen: "dashboard" }) => void;
}) {
  navigation.navigate("MainTabs", { screen: "dashboard" });
}
