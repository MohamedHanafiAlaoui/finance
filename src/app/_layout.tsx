import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "auth";

    if (!isAuthenticated) {
      // Not logged in → go to login
      if (!inAuthGroup) {
        router.replace("/auth/login");
      }
    } else {
      // Logged in
      if (currentUser && !currentUser.onboardingCompleted) {
        // Onboarding not complete → go to onboarding
        if (segments.join("/") !== "auth/onboarding") {
          router.replace("/auth/onboarding");
        }
      } else if (inAuthGroup) {
        // Onboarding complete (or profile loaded) → go to home
        router.replace("/tabs/home");
      }
    }
  }, [isAuthenticated, isLoading, currentUser, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NavigationGuard>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="auth"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="tabs"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </NavigationGuard>
    </AuthProvider>
  );
}