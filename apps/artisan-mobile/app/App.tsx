import { useEffect, useMemo, useState } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

import { ArtisanSession } from "./session";
import HomeScreen from "../screens/HomeScreen";
import UploadProductScreen from "../screens/UploadProductScreen";
import UploadReelScreen from "../screens/UploadReelScreen";
import StorefrontScreen from "../screens/StorefrontScreen";
import SalesScreen from "../screens/SalesScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
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

interface AppStackProps {
  session: ArtisanSession;
}

function AppStack({ session }: AppStackProps) {
  return (
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
  );
}

interface AuthViewProps {
  session: ArtisanSession;
}

function AuthView({ session }: AuthViewProps) {
  const [showRegister, setShowRegister] = useState(false);

  if (showRegister) {
    return (
      <RegisterScreen
        session={session}
        onSwitchToLogin={() => setShowRegister(false)}
      />
    );
  }

  return (
    <LoginScreen
      session={session}
      onSwitchToRegister={() => setShowRegister(true)}
    />
  );
}

export default function App() {
  const [authToken, setAuthTokenState] = useState<string | null>(null);
  const [artisanId, setArtisanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeToken = async () => {
      try {
        const token = await readStoredAuthToken();
        if (mounted) {
          if (token) {
            setAuthToken(token);
            setAuthTokenState(token);
          }
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
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

  if (isLoading) {
    return null; // Show splash screen or loading state
  }

  return (
    <SafeAreaProvider>
      {authToken ? (
        <NavigationContainer theme={navigationTheme}>
          <StatusBar style="dark" />
          <AppStack session={session} />
        </NavigationContainer>
      ) : (
        <>
          <StatusBar style="dark" />
          <AuthView session={session} />
        </>
      )}
    </SafeAreaProvider>
  );
}
