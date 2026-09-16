import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";

/**
 * Large text box with an optional talk-to-type button. When the phone browser
 * has no speech support the button is simply not shown and typing still works.
 */
const VoiceTextArea: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}> = ({ value, onChange, placeholder, rows = 5 }) => {
  const [listening, setListening] = useState(false);
  const recognition = useRef<any>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const Ctor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    setSupported(!!Ctor);
  }, []);

  const toggle = () => {
    const Ctor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!Ctor) return;
    if (listening) {
      recognition.current?.stop();
      setListening(false);
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-ZA";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (event: any) => {
      const said = Array.from(event.results as any[])
        .map((r: any) => r[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (said) onChange(`${value ? `${value} ` : ""}${said}`);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognition.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  };

  return (
    <div>
      <textarea
        rows={rows}
        placeholder={placeholder}
        className="w-full border-2 border-input bg-background p-3 text-lg"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {supported && (
        <button
          type="button"
          onClick={toggle}
          className={`mt-2 flex min-h-[52px] w-full items-center justify-center gap-2 border-2 text-base ${
            listening ? "border-foreground bg-foreground text-background" : "border-foreground"
          }`}
        >
          {listening ? <MicOff className="h-5 w-5" aria-hidden /> : <Mic className="h-5 w-5" aria-hidden />}
          {listening ? "Listening… tap to stop" : "Speak instead of typing"}
        </button>
      )}
    </div>
  );
};

export default VoiceTextArea;
