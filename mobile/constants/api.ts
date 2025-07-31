import Constants from "expo-constants";
const { apiUrlDev, apiUrlProd } = (Constants as any).expoConfig.extra;
export const API_BASE_URL = __DEV__ ? apiUrlDev : apiUrlProd;
