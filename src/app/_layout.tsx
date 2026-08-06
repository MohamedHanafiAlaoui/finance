import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { GoalsProvider } from "../context/GoalsContext";
import { TransactionsProvider } from "../context/TransactionsContext";
import { SplashView } from "../components/ui/SplashView";

function NavigationGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, currentUser } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [splashActive, setSplashActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashActive(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading || splashActive) return;

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
  }, [isAuthenticated, isLoading, currentUser, segments, splashActive]);

  if (isLoading || splashActive) {
    return <SplashView />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <GoalsProvider>
        <TransactionsProvider>
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
        </TransactionsProvider>
      </GoalsProvider>
    </AuthProvider>
  );
}