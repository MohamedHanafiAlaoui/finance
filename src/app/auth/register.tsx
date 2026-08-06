import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function RegisterScreen() {
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    // Validation
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter a password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, password);
      // Navigate to onboarding after successful registration
      router.replace("/auth/onboarding");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your savings journey</Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#9CA3AF"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              setError("");
            }}
            style={styles.input}
          />

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

          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setError("");
            }}
            secureTextEntry
            style={styles.input}
          />

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </Pressable>

          <View style={styles.loginContainer}>
            <Text style={styles.loginLabel}>Already have an account? </Text>
            <Pressable onPress={() => router.push("/auth/login")}>
              <Text style={styles.loginLink}>Sign In</Text>
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
  button: {
    backgroundColor: "#2563EB",
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginLabel: {
    color: "#6B7280",
    fontSize: 14,
  },
  loginLink: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },
});