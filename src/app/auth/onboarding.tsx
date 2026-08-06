import { router } from "expo-router";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const slides = [
  {
    icon: "💰",
    title: "Save Smart",
    description: "Track your spending and build better financial habits",
  },
  {
    icon: "🎯",
    title: "Set Goals",
    description: "Create savings goals and watch your progress grow",
  },
  {
    icon: "📈",
    title: "Invest Wisely",
    description: "Get insights to make informed financial decisions",
  },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Financial form state (shown on the last step)
  const [savingsGoal, setSavingsGoal] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Total steps = intro slides + 1 form step
  const totalSteps = slides.length + 1;
  const isFormStep = currentSlide === slides.length;

  const handleFinish = async () => {
    setError("");

    // Validate form
    if (!savingsGoal.trim()) {
      setError("Please enter a savings goal name.");
      return;
    }
    const parsedGoal = parseFloat(goalAmount);
    if (isNaN(parsedGoal) || parsedGoal <= 0) {
      setError("Please enter a valid target amount.");
      return;
    }
    const parsedSavings = parseFloat(currentSavings) || 0;

    setLoading(true);
    try {
      await completeOnboarding(savingsGoal.trim(), parsedGoal, parsedSavings);
      router.replace("/tabs/home");
    } catch (err: any) {
      console.error("Failed to complete onboarding:", err);
      setError(err.message || "Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentSlide < totalSteps - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    // Skip to the form step
    setCurrentSlide(slides.length);
  };

  const slide = !isFormStep ? slides[currentSlide] : null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          {!isFormStep ? (
            <Pressable onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          ) : (
            <View style={{ width: 50 }} />
          )}
          <View style={styles.progressContainer}>
            {Array.from({ length: totalSteps }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  index === currentSlide && styles.progressDotActive,
                  index < currentSlide && styles.progressDotCompleted,
                ]}
              />
            ))}
          </View>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentCenter}
          keyboardShouldPersistTaps="handled"
        >
          {!isFormStep && slide ? (
            /* Intro Slides */
            <View style={styles.slideContent}>
              <Text style={styles.icon}>{slide.icon}</Text>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          ) : (
            /* Financial Info Form */
            <View style={styles.formContent}>
              <Text style={styles.formIcon}>🏦</Text>
              <Text style={styles.formTitle}>Set Your Goal</Text>
              <Text style={styles.formSubtitle}>
                Tell us about your savings target
              </Text>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TextInput
                placeholder="Goal name (e.g. Vacation Fund)"
                placeholderTextColor="#9CA3AF"
                value={savingsGoal}
                onChangeText={(text) => {
                  setSavingsGoal(text);
                  setError("");
                }}
                style={styles.input}
              />

              <TextInput
                placeholder="Target amount ($)"
                placeholderTextColor="#9CA3AF"
                value={goalAmount}
                onChangeText={(text) => {
                  setGoalAmount(text);
                  setError("");
                }}
                keyboardType="numeric"
                style={styles.input}
              />

              <TextInput
                placeholder="Current savings (optional, $0)"
                placeholderTextColor="#9CA3AF"
                value={currentSavings}
                onChangeText={(text) => {
                  setCurrentSavings(text);
                  setError("");
                }}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          )}
        </ScrollView>

        {/* Bottom Action */}
        <View style={styles.footer}>
          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>
                {isFormStep ? "Get Started" : "Next"}
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },

  skipText: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "600",
  },

  progressContainer: {
    flexDirection: "row",
    gap: 8,
  },

  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },

  progressDotActive: {
    backgroundColor: "#2563EB",
    width: 24,
  },

  progressDotCompleted: {
    backgroundColor: "#2563EB",
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  contentCenter: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },

  slideContent: {
    alignItems: "center",
    width: "100%",
  },

  icon: {
    fontSize: 80,
    marginBottom: 32,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 16,
  },

  description: {
    fontSize: 18,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 28,
  },

  /* Form Step Styles */
  formContent: {
    width: "100%",
    alignItems: "center",
  },

  formIcon: {
    fontSize: 64,
    marginBottom: 16,
  },

  formTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },

  formSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
    textAlign: "center",
  },

  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    width: "100%",
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
    width: "100%",
  },

  footer: {
    padding: 24,
    paddingBottom: 32,
  },

  button: {
    height: 56,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
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
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});