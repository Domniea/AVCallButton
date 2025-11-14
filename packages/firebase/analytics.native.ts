import analytics from "@react-native-firebase/analytics";

export const logEvent = async (name: string, params?: object) => {
  return analytics().logEvent(name, params);
};
