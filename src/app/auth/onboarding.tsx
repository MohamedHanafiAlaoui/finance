import { router } from "expo-router";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../../components/ui/AppButton";
import { useTheme } from "../../hooks/use-theme";

const slides = [
  {
    icon: "💰",
    title: "Save Smart",
    description: "Track your spending and build better financial habits effortlessly.",
  },
  {
    icon: "🎯",
    title: "Set Goals",
    description: "Create custom savings goals and watch your progress grow day by day.",
  },
  {
    icon: "📈",
    title: "Invest Wisely",
    description: "Get real-time insights to make informed financial decisions.",
  },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useAuth();
  const colors = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);

  const isLastSlide = currentSlide === slides.length - 1;

  const handleFinish = async () => {
    setLoading(true);
    try {
      await completeOnboarding();
      router.replace("/tabs/home");
    } catch (err: any) {
      console.error("Failed to complete onboarding:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!isLastSlide) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const slide = slides[currentSlide];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          {!isLastSlide ? (
            <Pressable onPress={handleSkip}>
              <Text style={[styles.skipText, { color: '#0FA3B1' }]}>Skip</Text>
            </Pressable>
          ) : (
            <View style={{ width: 50 }} />
          )}
          <View style={styles.progressContainer}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  { backgroundColor: colors.backgroundSelected },
                  index === currentSlide && { backgroundColor: '#27D3C3', width: 24 },
                  index < currentSlide && { backgroundColor: '#0FA3B1' },
                ]}
              />
            ))}
          </View>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentCenter}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.slideContent}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.icon}>{slide.icon}</Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{slide.description}</Text>
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View style={styles.footer}>
          <AppButton
            title={isLastSlide ? "Get Started" : "Next"}
            onPress={handleNext}
            loading={loading}
            size="lg"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontWeight: "700",
  },
  progressContainer: {
    flexDirection: "row",
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  contentCenter: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 350,
    paddingVertical: 20,
  },
  slideContent: {
    alignItems: "center",
    width: "100%",
  },
  iconWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  icon: {
    fontSize: 72,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 20 : 30,
  },
});