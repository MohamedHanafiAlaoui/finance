import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { AppButton } from "../../components/ui/AppButton";
import { AppInput } from "../../components/ui/AppInput";
import { useTheme } from "../../hooks/use-theme";

export default function LoginScreen() {
  const { login, resetPassword } = useAuth();
  const colors = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const profile = await login(email, password);
      if (profile.onboardingCompleted) {
        router.replace("/tabs/home");
      } else {
        router.replace("/auth/onboarding");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert(
        "Email Required",
        "Please enter your email address first, then tap Forgot Password."
      );
      return;
    }

    try {
      await resetPassword(email);
      Alert.alert(
        "Reset Email Sent",
        "Check your inbox for a password reset link."
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to send reset email.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={[styles.logoWrap, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.logoText}>💎</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to your account</Text>

            {error ? (
              <View style={[styles.errorContainer, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
              </View>
            ) : null}

            <AppInput
              placeholder="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError("");
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <AppInput
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError("");
              }}
              secureTextEntry
            />

            <Pressable onPress={handleForgotPassword} style={styles.forgotPressable}>
              <Text style={[styles.forgotText, { color: '#0FA3B1' }]}>Forgot Password?</Text>
            </Pressable>

            <AppButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              size="lg"
            />

            <View style={styles.registerContainer}>
              <Text style={[styles.registerLabel, { color: colors.textSecondary }]}>Don't have an account? </Text>
              <Pressable onPress={() => router.push("/auth/register")}>
                <Text style={[styles.registerLink, { color: '#0FA3B1' }]}>Create Account</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: { fontSize: 30 },
  title: {
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  errorContainer: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "600",
  },
  forgotPressable: {
    alignSelf: "flex-end",
    marginBottom: 24,
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "700",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  registerLabel: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "700",
  },
});