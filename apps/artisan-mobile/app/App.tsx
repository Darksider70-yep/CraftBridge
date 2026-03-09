import { useEffect, useMemo, useState } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { ArtisanSession } from "./session";
import HomeScreen from "../screens/HomeScreen";
import UploadProductScreen from "../screens/UploadProductScreen";
import UploadReelScreen from "../screens/UploadReelScreen";
import StorefrontScreen from "../screens/StorefrontScreen";
import SalesScreen from "../screens/SalesScreen";
import {
  clearStoredAuthToken,
  readStoredAuthToken,
  saveAuthToken as persistAuthToken,
} from "../offline/storage/localDB";
import { setAuthToken } from "../services/api";
import { startUploadQueueSync } from "../offline/sync/syncManager";

type RootTabParamList = {
  Home: undefined;
  "Upload Product": undefined;
  "Upload Reel": undefined;
  Storefront: undefined;
  Sales: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#F4F0E8",
    card: "#FFFFFF",
    primary: "#9C4F2D",
    text: "#1E1E1E",
    border: "#E2D8C8",
  },
};

export default function App() {
  const [authToken, setAuthTokenState] = useState<string | null>(null);
  const [artisanId, setArtisanId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeToken = async () => {
      const token = await readStoredAuthToken();
      if (!mounted || !token) {
        return;
      }
      setAuthToken(token);
      setAuthTokenState(token);
    };

    initializeToken();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const stopSync = startUploadQueueSync(() => authToken);
    return stopSync;
  }, [authToken]);

  const session: ArtisanSession = useMemo(
    () => ({
      authToken,
      artisanId,
      setAuthToken: async (token: string) => {
        const cleaned = token.trim();
        await persistAuthToken(cleaned);
        setAuthToken(cleaned);
        setAuthTokenState(cleaned);
      },
      clearAuthToken: async () => {
        await clearStoredAuthToken();
        setAuthTokenState(null);
        setAuthToken(null);
        setArtisanId(null);
      },
      setArtisanId: (id: string | null) => {
        setArtisanId(id);
      },
    }),
    [authToken, artisanId],
  );

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={{
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: "700",
            },
            tabBarLabelStyle: {
              fontSize: 13,
              fontWeight: "700",
            },
            tabBarStyle: {
              height: 64,
              paddingTop: 8,
              paddingBottom: 8,
              borderTopWidth: 1,
              borderTopColor: "#E2D8C8",
            },
          }}
        >
          <Tab.Screen name="Home">{() => <HomeScreen session={session} />}</Tab.Screen>
          <Tab.Screen name="Upload Product">
            {() => <UploadProductScreen session={session} />}
          </Tab.Screen>
          <Tab.Screen name="Upload Reel">{() => <UploadReelScreen session={session} />}</Tab.Screen>
          <Tab.Screen name="Storefront">
            {() => <StorefrontScreen session={session} />}
          </Tab.Screen>
          <Tab.Screen name="Sales">{() => <SalesScreen session={session} />}</Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
