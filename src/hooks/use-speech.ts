"use client";

import { useState, useCallback, useEffect } from "react";

export type LanguageCode = "en-US" | "ms-MY" | "zh-CN";

const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  "en-US": "English",
  "ms-MY": "Bahasa Melayu",
  "zh-CN": "Mandarin",
};

const LANGUAGE_ANNOUNCEMENTS: Record<LanguageCode, string> = {
  "en-US": "Language: English",
  "ms-MY": "Bahasa: Melayu",
  "zh-CN": "语言: 中文",
};

export function useSpeech() {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("en-US");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported("speechSynthesis" in window);
  }, []);

  const speak = useCallback((text: string, lang?: LanguageCode) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang || currentLanguage;
    utterance.rate = 1.2; // Slightly faster for efficiency
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }, [currentLanguage]);

  const cycleLanguage = useCallback(() => {
    const langs: LanguageCode[] = ["en-US", "ms-MY", "zh-CN"];
    const nextIdx = (langs.indexOf(currentLanguage) + 1) % langs.length;
    const nextLang = langs[nextIdx];
    
    // Haptic patterns for ELEOS: 1, 2, or 3 buzzes
    if ("vibrate" in navigator) {
      const patterns: Record<LanguageCode, number[]> = {
        "en-US": [300],
        "ms-MY": [300, 200, 300],
        "zh-CN": [300, 150, 300, 150, 300],
      };
      navigator.vibrate(patterns[nextLang]);
    }

    setCurrentLanguage(nextLang);
    speak(LANGUAGE_ANNOUNCEMENTS[nextLang], nextLang);
  }, [currentLanguage, speak]);

  const vibrateWarning = useCallback((intensity: number) => {
    if (!("vibrate" in navigator)) return;
    // Rapid pulsing for danger
    const pattern = [200, 100, 200, 100, 200];
    navigator.vibrate(pattern);
  }, []);

  return {
    currentLanguage,
    languageLabel: LANGUAGE_LABELS[currentLanguage],
    speak,
    cycleLanguage,
    vibrateWarning,
    isSupported,
  };
}
