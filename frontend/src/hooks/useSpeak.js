export default function useSpeak() {
  const speak = (text) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang  = "en-IN";
    utterance.pitch = 1;
    utterance.rate  = 1;

    window.speechSynthesis.speak(utterance);
  };

  return { speak };
}