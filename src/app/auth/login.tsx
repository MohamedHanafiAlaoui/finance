import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const { login, resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    // Validation
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

      // Navigate based on onboarding status
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TextInput
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError("");
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError("");
            }}
            secureTextEntry
            style={styles.input}
          />

          <Pressable onPress={handleForgotPassword}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </Pressable>

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </Pressable>

          <View style={styles.registerContainer}>
            <Text style={styles.registerLabel}>Don't have an account? </Text>
            <Pressable onPress={() => router.push("/auth/register")}>
              <Text style={styles.registerLink}>Create Account</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    backgroundColor: "#F9FAFB",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFF",
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  forgotText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#2563EB",
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  registerLabel: {
    color: "#6B7280",
    fontSize: 14,
  },
  registerLink: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
});