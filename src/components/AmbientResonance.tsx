"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface ResonanceContextType {
  shiftResonance: (frequencyOffset: number) => void;
  playThud: () => void;
}

const ResonanceContext = createContext<ResonanceContextType | null>(null);

export function useResonance() {
  return useContext(ResonanceContext);
}

export function AmbientResonanceProvider({ children }: { children: React.ReactNode }) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);

  const initAudio = () => {
    if (isInitialized) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const baseFreq = 55; // Deep cosmic hum

      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(0.1, ctx.currentTime); // Slow sweep

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(5, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0.015, ctx.currentTime); // Very subtle

      osc.connect(mainGain);
      mainGain.connect(ctx.destination);

      osc.start();
      lfo.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = mainGain;
      lfoRef.current = lfo;
      
      setIsInitialized(true);
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  };

  useEffect(() => {
    const handleInteraction = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      } else if (!isInitialized) {
        initAudio();
      }
    };

    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [isInitialized]);

  const shiftResonance = (frequencyOffset: number) => {
    if (!audioCtxRef.current || !oscillatorRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = oscillatorRef.current;
    const currentFreq = osc.frequency.value;
    const newFreq = Math.max(40, Math.min(200, currentFreq + frequencyOffset));
    
    osc.frequency.setTargetAtTime(newFreq, ctx.currentTime, 0.5); // Smooth glide
  };

  const playThud = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  };

  return (
    <ResonanceContext.Provider value={{ shiftResonance, playThud }}>
      {children}
    </ResonanceContext.Provider>
  );
}
