"use client";

import { useEffect, useRef, useState } from "react";
import {
  Pause,
  Play,
  RotateCcw,
  Settings as SettingsIcon,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useLanguage } from "./language";
import { DevBoxShell } from "./shell";
import { Breadcrumbs, PageTitle, cx } from "./primitives";
import { getLabels } from "./translations";

type Mode = "pomodoro" | "custom";
type Phase = "focus" | "short" | "long";

type Settings = { focus: number; short: number; long: number; rounds: number };
type Today = { date: string; sessions: number; focusSec: number };

type TimerState = {
  mode: Mode;
  running: boolean;
  phase: Phase;
  session: number;
  pomoRemaining: number;
  pomoTotal: number;
  cdRemaining: number;
  cdTotal: number;
  cdField: string;
  settings: Settings;
  settingsOpen: boolean;
  muted: boolean;
  soundPreset: SoundPreset;
  today: Today;
};

const SETTINGS_KEY = "devbox-pomodoro-settings";
const MUTED_KEY = "devbox-pomodoro-muted";
const SOUND_KEY = "devbox-pomodoro-sound";
const TODAY_KEY = "devbox-pomodoro-today";
const DEFAULT_SETTINGS: Settings = { focus: 25, short: 5, long: 15, rounds: 4 };
const SETTING_LIMITS: Record<keyof Settings, [number, number]> = {
  focus: [1, 120],
  short: [1, 60],
  long: [1, 60],
  rounds: [2, 12],
};

function todayKey() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function clamp(v: unknown, lo: number, hi: number, dflt: number) {
  const n = Number(v);
  if (!isFinite(n)) return dflt;
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

function phaseDuration(phase: Phase, s: Settings) {
  return (phase === "focus" ? s.focus : phase === "short" ? s.short : s.long) * 60;
}

function parseCd(text: string): number | null {
  const t = text.trim();
  if (!t) return null;
  let m = 0;
  let s = 0;
  if (t.indexOf(":") >= 0) {
    const parts = t.split(":");
    m = parseInt(parts[0], 10) || 0;
    s = parseInt(parts[1], 10) || 0;
  } else {
    m = parseInt(t, 10) || 0;
  }
  if (s > 59) {
    m += Math.floor(s / 60);
    s = s % 60;
  }
  m = Math.max(0, Math.min(999, m));
  const total = m * 60 + s;
  return total >= 1 ? total : null;
}

function fmtField(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function fmt(totalSec: number) {
  const t = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
}

function fmtDur(totalSec: number) {
  const m = Math.round(totalSec / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

type SoundPreset = "chime" | "ping" | "bell" | "coin" | "chiptune" | "fanfare";
const SOUND_PRESETS: SoundPreset[] = ["chime", "ping", "bell", "coin", "chiptune", "fanfare"];

type Note = {
  freq: number;
  at: number;
  dur: number;
  type?: OscillatorType;
  endFreq?: number;
  gain?: number;
};

const SOUND_NOTES: Record<SoundPreset, Note[]> = {
  chime: [
    { freq: 880, at: 0, dur: 0.28 },
    { freq: 1174, at: 0.22, dur: 0.34 },
  ],
  ping: [{ freq: 1046, at: 0, dur: 0.32 }],
  bell: [
    { freq: 1046, at: 0, dur: 0.22 },
    { freq: 880, at: 0.16, dur: 0.22 },
    { freq: 659, at: 0.32, dur: 0.4 },
  ],
  coin: [
    { freq: 988, at: 0, dur: 0.12, type: "square", gain: 0.26 },
    { freq: 1319, at: 0.11, dur: 0.26, type: "square", gain: 0.26 },
  ],
  // Original 8-bit-style arpeggio — not a reproduction of any existing melody.
  chiptune: [
    { freq: 523.25, at: 0, dur: 0.12, type: "square", gain: 0.24 },
    { freq: 659.25, at: 0.11, dur: 0.12, type: "square", gain: 0.24 },
    { freq: 783.99, at: 0.22, dur: 0.12, type: "square", gain: 0.24 },
    { freq: 1046.5, at: 0.33, dur: 0.18, type: "square", gain: 0.26 },
    { freq: 1318.51, at: 0.5, dur: 0.3, type: "square", gain: 0.26 },
  ],
  // Original "level up" style jingle — a generic 8-bit fanfare shape, not any specific game's tune.
  fanfare: [
    { freq: 523.25, at: 0, dur: 0.11, type: "square", gain: 0.24 },
    { freq: 587.33, at: 0.1, dur: 0.11, type: "square", gain: 0.24 },
    { freq: 659.25, at: 0.2, dur: 0.11, type: "square", gain: 0.24 },
    { freq: 783.99, at: 0.3, dur: 0.11, type: "square", gain: 0.24 },
    { freq: 1046.5, at: 0.4, dur: 0.5, type: "square", gain: 0.3 },
  ],
};

function beep(preset: SoundPreset) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const tone = (note: Note) => {
      const { freq, at, dur, type = "sine", endFreq, gain = 0.22 } = note;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = type;
      o.frequency.setValueAtTime(freq, ctx.currentTime + at);
      if (endFreq != null) {
        o.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + at + dur);
      }
      g.gain.setValueAtTime(0.0001, ctx.currentTime + at);
      g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + dur);
      o.start(ctx.currentTime + at);
      o.stop(ctx.currentTime + at + dur + 0.02);
    };
    const notes = SOUND_NOTES[preset];
    let maxEnd = 0;
    for (const note of notes) {
      tone(note);
      maxEnd = Math.max(maxEnd, note.at + note.dur);
    }
    setTimeout(() => {
      try {
        ctx.close();
      } catch {}
    }, maxEnd * 1000 + 250);
  } catch {}
}

const RING_SIZE = 260;
const RING_STROKE = 12;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_C = 2 * Math.PI * RING_R;

export function PomodoroTimerPage() {
  const { locale } = useLanguage();
  const t = getLabels(locale).pomodoroTimer;

  const [state, setState] = useState<TimerState>({
    mode: "pomodoro",
    running: false,
    phase: "focus",
    session: 1,
    pomoRemaining: DEFAULT_SETTINGS.focus * 60,
    pomoTotal: DEFAULT_SETTINGS.focus * 60,
    cdRemaining: 600,
    cdTotal: 600,
    cdField: "10:00",
    settings: DEFAULT_SETTINGS,
    settingsOpen: false,
    muted: false,
    soundPreset: "chime",
    today: { date: todayKey(), sessions: 0, focusSec: 0 },
  });

  const stateRef = useRef(state);
  const lastTickRef = useRef(Date.now());

  function patchState(
    patch: Partial<TimerState> | ((s: TimerState) => Partial<TimerState>),
  ) {
    setState((prev) => {
      const p = typeof patch === "function" ? patch(prev) : patch;
      const next = { ...prev, ...p };
      stateRef.current = next;
      return next;
    });
  }

  function saveToday(v: Today) {
    try {
      localStorage.setItem(TODAY_KEY, JSON.stringify(v));
    } catch {}
  }

  function saveSettings(v: Settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(v));
    } catch {}
  }

  function onPhaseEnd(record: boolean) {
    const st = stateRef.current;
    if (!st.muted) beep(st.soundPreset);
    if (st.phase === "focus") {
      if (record) {
        const nextToday: Today = {
          date: todayKey(),
          sessions: st.today.sessions + 1,
          focusSec: st.today.focusSec + st.pomoTotal,
        };
        saveToday(nextToday);
        patchState({ today: nextToday });
      }
      const next: Phase = st.session >= st.settings.rounds ? "long" : "short";
      const dur = phaseDuration(next, st.settings);
      patchState({ phase: next, pomoTotal: dur, pomoRemaining: dur, running: false });
    } else {
      const wasLong = st.phase === "long";
      const nextSession = wasLong ? 1 : Math.min(st.session + 1, st.settings.rounds);
      const dur = phaseDuration("focus", st.settings);
      patchState({
        phase: "focus",
        session: nextSession,
        pomoTotal: dur,
        pomoRemaining: dur,
        running: false,
      });
    }
  }

  function tick() {
    const now = Date.now();
    const dt = (now - lastTickRef.current) / 1000;
    lastTickRef.current = now;
    const st = stateRef.current;
    if (!st.running || dt <= 0) return;
    if (st.mode === "custom") {
      const r = st.cdRemaining - dt;
      if (r <= 0) {
        if (!st.muted) beep(st.soundPreset);
        patchState({ cdRemaining: 0, running: false });
      } else {
        patchState({ cdRemaining: r });
      }
      return;
    }
    const r = st.pomoRemaining - dt;
    if (r <= 0) {
      patchState({ pomoRemaining: 0 });
      setTimeout(() => onPhaseEnd(true), 0);
    } else {
      patchState({ pomoRemaining: r });
    }
  }

  useEffect(() => {
    let loadedSettings: unknown = null;
    let loadedMuted: unknown = null;
    let loadedSound: unknown = null;
    let loadedToday: unknown = null;
    try {
      loadedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "null");
    } catch {}
    try {
      loadedMuted = JSON.parse(localStorage.getItem(MUTED_KEY) ?? "null");
    } catch {}
    try {
      loadedSound = JSON.parse(localStorage.getItem(SOUND_KEY) ?? "null");
    } catch {}
    try {
      loadedToday = JSON.parse(localStorage.getItem(TODAY_KEY) ?? "null");
    } catch {}

    const patch: Partial<TimerState> = {};
    if (loadedSettings && typeof loadedSettings === "object") {
      const raw = loadedSettings as Partial<Settings>;
      const s: Settings = {
        focus: clamp(raw.focus, 1, 120, 25),
        short: clamp(raw.short, 1, 60, 5),
        long: clamp(raw.long, 1, 60, 15),
        rounds: clamp(raw.rounds, 2, 12, 4),
      };
      patch.settings = s;
      patch.pomoTotal = s.focus * 60;
      patch.pomoRemaining = s.focus * 60;
    }
    if (typeof loadedMuted === "boolean") patch.muted = loadedMuted;
    if (typeof loadedSound === "string" && SOUND_PRESETS.includes(loadedSound as SoundPreset)) {
      patch.soundPreset = loadedSound as SoundPreset;
    }
    const key = todayKey();
    if (loadedToday && typeof loadedToday === "object" && (loadedToday as Today).date === key) {
      const raw = loadedToday as Partial<Today>;
      patch.today = { date: key, sessions: raw.sessions || 0, focusSec: raw.focusSec || 0 };
    } else {
      const t: Today = { date: key, sessions: 0, focusSec: 0 };
      patch.today = t;
      saveToday(t);
    }
    if (Object.keys(patch).length) patchState(patch);

    lastTickRef.current = Date.now();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startPause = () => {
    lastTickRef.current = Date.now();
    const st = stateRef.current;
    const patch: Partial<TimerState> = {};
    if (!st.running) {
      if (st.mode === "pomodoro" && st.pomoRemaining <= 0) {
        const d = phaseDuration(st.phase, st.settings);
        patch.pomoRemaining = d;
        patch.pomoTotal = d;
      }
      if (st.mode === "custom" && st.cdRemaining <= 0) {
        patch.cdRemaining = st.cdTotal;
      }
    }
    patch.running = !st.running;
    patchState(patch);
  };

  const reset = () => {
    const st = stateRef.current;
    if (st.mode === "pomodoro") {
      const d = phaseDuration(st.phase, st.settings);
      patchState({ running: false, pomoRemaining: d, pomoTotal: d });
    } else {
      patchState({ running: false, cdRemaining: st.cdTotal });
    }
  };

  const skip = () => onPhaseEnd(false);

  const setMode = (mode: Mode) => patchState({ mode, running: false, settingsOpen: false });

  const toggleMute = () => {
    const m = !stateRef.current.muted;
    try {
      localStorage.setItem(MUTED_KEY, JSON.stringify(m));
    } catch {}
    patchState({ muted: m });
  };

  const toggleSettings = () => patchState((s) => ({ settingsOpen: !s.settingsOpen }));

  const setSoundPreset = (preset: SoundPreset) => {
    try {
      localStorage.setItem(SOUND_KEY, JSON.stringify(preset));
    } catch {}
    patchState({ soundPreset: preset });
    beep(preset);
  };

  const previewSound = () => beep(stateRef.current.soundPreset);

  function changeSetting(key: keyof Settings, delta: number) {
    const st = stateRef.current;
    const [lo, hi] = SETTING_LIMITS[key];
    const s: Settings = { ...st.settings, [key]: Math.max(lo, Math.min(hi, st.settings[key] + delta)) };
    saveSettings(s);
    const patch: Partial<TimerState> = { settings: s };
    if (!st.running && st.mode === "pomodoro") {
      const d = phaseDuration(st.phase, s);
      patch.pomoTotal = d;
      patch.pomoRemaining = d;
    } else if (st.mode === "pomodoro") {
      patch.pomoTotal = phaseDuration(st.phase, s);
    }
    patchState(patch);
  }

  function commitCd(text: string) {
    const st = stateRef.current;
    const total = parseCd(text);
    if (total == null) {
      patchState({ cdField: fmtField(st.cdTotal) });
      return;
    }
    const patch: Partial<TimerState> = { cdTotal: total, cdField: fmtField(total) };
    if (!st.running) patch.cdRemaining = total;
    patchState(patch);
  }

  function setCdPreset(mins: number) {
    const st = stateRef.current;
    const total = mins * 60;
    const patch: Partial<TimerState> = { cdTotal: total, cdField: fmtField(total) };
    if (!st.running) patch.cdRemaining = total;
    patchState(patch);
  }

  const { mode, running, phase, session, settings, settingsOpen, muted, soundPreset, today, cdField } =
    state;
  const isPomodoro = mode === "pomodoro";
  const isCustom = mode === "custom";

  let fraction: number;
  let timeText: string;
  let subText: string;
  let accent: string;
  if (isPomodoro) {
    fraction = state.pomoTotal > 0 ? state.pomoRemaining / state.pomoTotal : 0;
    timeText = fmt(Math.ceil(state.pomoRemaining));
    subText = t.sessionOf.replace("{n}", String(session)).replace("{total}", String(settings.rounds));
    accent = phase === "focus" ? "var(--primary)" : "var(--success)";
  } else {
    fraction = state.cdTotal > 0 ? state.cdRemaining / state.cdTotal : 0;
    timeText = fmt(Math.ceil(state.cdRemaining));
    subText = t.countdown;
    accent = "var(--primary)";
  }
  fraction = Math.max(0, Math.min(1, fraction));
  const ringOffset = RING_C * (1 - fraction);

  const phaseLabel =
    phase === "focus" ? t.phaseFocus : phase === "short" ? t.phaseShortBreak : t.phaseLongBreak;
  const phaseColor = phase === "focus" ? "text-[var(--primary)]" : "text-[var(--success)]";
  const phaseBg = phase === "focus" ? "bg-[var(--bg-active)]" : "bg-[var(--success-bg)]";
  const phaseDot = phase === "focus" ? "bg-[var(--primary)]" : "bg-[var(--success)]";

  const startLabel =
    (isPomodoro ? state.pomoRemaining < state.pomoTotal : state.cdRemaining < state.cdTotal)
      ? t.resume
      : t.start;

  const settingDefs: { key: keyof Settings; label: string; unit: string }[] = [
    { key: "focus", label: t.settingFocus, unit: t.unitMin },
    { key: "short", label: t.settingShort, unit: t.unitMin },
    { key: "long", label: t.settingLong, unit: t.unitMin },
    { key: "rounds", label: t.settingRounds, unit: "" },
  ];

  const cdPresets = [5, 10, 25];

  return (
    <DevBoxShell active="pomodoro-timer">
      <Breadcrumbs
        items={[
          { label: "DevBox", href: "/" },
          { label: t.breadcrumbProductivity },
          { label: "Pomodoro Timer" },
        ]}
      />

      <PageTitle
        title="Pomodoro Timer"
        subtitle={t.subtitle}
        action={
          <div className="flex items-center gap-2">
            <button
              className="flex size-[34px] items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
              onClick={toggleMute}
              title={muted ? t.unmuteTitle : t.muteTitle}
              type="button"
            >
              {muted ? (
                <VolumeX aria-hidden className="size-4" />
              ) : (
                <Volume2 aria-hidden className="size-4" />
              )}
            </button>
            <button
              className={cx(
                "flex size-[34px] items-center justify-center rounded-md border",
                settingsOpen
                  ? "border-[var(--primary)] bg-[var(--bg-active)] text-[var(--primary)]"
                  : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)]",
              )}
              onClick={toggleSettings}
              title={t.settingsTooltip}
              type="button"
            >
              <SettingsIcon aria-hidden className="size-4" />
            </button>
          </div>
        }
      />

      {/* Mode toggle */}
      <div className="flex justify-center">
        <div className="inline-flex h-[38px] items-center gap-[3px] rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-[3px]">
          <button
            className={cx(
              "inline-flex h-full items-center justify-center gap-1.5 rounded-md px-5 text-[13px] font-semibold",
              isPomodoro ? "bg-[var(--bg-active)] text-[var(--primary)]" : "text-[var(--text-secondary)]",
            )}
            onClick={() => setMode("pomodoro")}
            type="button"
          >
            {t.modePomodoro}
          </button>
          <button
            className={cx(
              "inline-flex h-full items-center justify-center gap-1.5 rounded-md px-5 text-[13px] font-semibold",
              isCustom ? "bg-[var(--bg-active)] text-[var(--primary)]" : "text-[var(--text-secondary)]",
            )}
            onClick={() => setMode("custom")}
            type="button"
          >
            {t.modeCustom}
          </button>
        </div>
      </div>

      {/* Timer card */}
      <div className="flex flex-col items-center gap-5 rounded-[14px] border border-[var(--border)] bg-[var(--bg-surface)] px-6 pb-7 pt-9 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        {isPomodoro && (
          <span
            className={cx(
              "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.8px]",
              phaseColor,
              phaseBg,
            )}
          >
            <span className={cx("size-2 rounded-full", phaseDot)} />
            {phaseLabel}
          </span>
        )}

        <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
          <svg
            height={RING_SIZE}
            style={{ transform: "rotate(-90deg)", display: "block" }}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            width={RING_SIZE}
          >
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              fill="none"
              r={RING_R}
              stroke="var(--border-light)"
              strokeWidth={RING_STROKE}
            />
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              fill="none"
              r={RING_R}
              stroke={accent}
              strokeDasharray={RING_C.toFixed(2)}
              strokeDashoffset={ringOffset.toFixed(2)}
              strokeLinecap="round"
              strokeWidth={RING_STROKE}
              style={{ transition: "stroke-dashoffset 0.3s linear, stroke 0.25s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
            <span className="font-mono text-[60px] font-semibold leading-none tracking-[-1px] text-[var(--text-primary)] [font-variant-numeric:tabular-nums]">
              {timeText}
            </span>
            <span className="text-xs font-medium tracking-[0.2px] text-[var(--text-secondary)]">
              {subText}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            className="inline-flex h-[42px] min-w-[132px] items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--text-on-primary)] hover:bg-[var(--primary-hover)]"
            onClick={startPause}
            type="button"
          >
            {running ? (
              <>
                <Pause aria-hidden className="size-[15px]" fill="currentColor" strokeWidth={0} />
                {t.pause}
              </>
            ) : (
              <>
                <Play aria-hidden className="size-[15px]" fill="currentColor" strokeWidth={0} />
                {startLabel}
              </>
            )}
          </button>
          <button
            className="inline-flex h-[42px] items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-4.5 text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
            onClick={reset}
            type="button"
          >
            <RotateCcw aria-hidden className="size-3.5" />
            {t.reset}
          </button>
          {isPomodoro && (
            <button
              className="inline-flex h-[42px] items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-4.5 text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              onClick={skip}
              type="button"
            >
              <SkipForward aria-hidden className="size-3.5" />
              {t.skip}
            </button>
          )}
        </div>
      </div>

      {/* Custom countdown input */}
      {isCustom && (
        <div className="flex flex-col gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4.5 py-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[var(--text-muted)]">
            {t.setDuration}
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                className="h-[52px] w-[150px] rounded-lg border border-[var(--border)] bg-[var(--bg-page)] text-center font-mono text-2xl font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                inputMode="numeric"
                onBlur={(e) => commitCd(e.target.value)}
                onChange={(e) => patchState({ cdField: e.target.value })}
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    commitCd(e.currentTarget.value);
                    e.currentTarget.blur();
                  }
                }}
                placeholder={t.durationPlaceholder}
                value={cdField}
              />
              <span className="max-w-[120px] text-[11px] text-[var(--text-muted)]">
                {t.durationHint}
              </span>
            </div>
            <div className="flex-1" />
            <div className="flex gap-1.5">
              {cdPresets.map((m) => (
                <button
                  className="inline-flex h-[30px] items-center rounded-md border border-[var(--border)] bg-[var(--bg-page)] px-3 font-mono text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                  key={m}
                  onClick={() => setCdPreset(m)}
                  type="button"
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Today summary */}
      <div className="flex flex-wrap items-center gap-4.5 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4.5 py-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[var(--text-muted)]">
          {t.today}
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-xl font-semibold text-[var(--text-primary)]">
            {today.sessions}
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            {today.sessions === 1 ? t.session : t.sessions}
          </span>
        </div>
        <span className="text-[var(--text-muted)]">·</span>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-xl font-semibold text-[var(--text-primary)]">
            {fmtDur(today.focusSec)}
          </span>
          <span className="text-xs text-[var(--text-secondary)]">{t.focused}</span>
        </div>
        <div className="flex-1" />
        <span className="text-[11px] text-[var(--text-muted)]">{t.resetsDaily}</span>
      </div>

      {/* Settings modal */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
          onClick={toggleSettings}
        >
          <div
            className="flex w-full max-w-[460px] flex-col gap-4 rounded-[14px] border border-[var(--border)] bg-[var(--bg-surface)] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold text-[var(--text-primary)]">
                  {t.settingsTitle}
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">{t.settingsSubtitle}</span>
              </div>
              <button
                className="flex size-[30px] shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                onClick={toggleSettings}
                title={t.done}
                type="button"
              >
                <X aria-hidden className="size-[15px]" strokeWidth={2.2} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.6px] text-[var(--text-muted)]">
                {t.soundLabel}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {SOUND_PRESETS.map((preset) => (
                  <button
                    className={cx(
                      "inline-flex h-8 items-center rounded-md border px-3 text-xs font-semibold",
                      soundPreset === preset
                        ? "border-[var(--primary)] bg-[var(--bg-active)] text-[var(--primary)]"
                        : "border-[var(--border)] bg-[var(--bg-page)] text-[var(--text-secondary)]",
                    )}
                    key={preset}
                    onClick={() => setSoundPreset(preset)}
                    type="button"
                  >
                    {t.soundPresetNames[preset]}
                  </button>
                ))}
                <button
                  className="inline-flex size-8 items-center justify-center rounded-md border border-dashed border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                  onClick={previewSound}
                  title={t.preview}
                  type="button"
                >
                  <Play aria-hidden className="size-3.5" fill="currentColor" strokeWidth={0} />
                </button>
              </div>
            </div>
            {isPomodoro && (
              <div className="grid grid-cols-2 gap-3">
                {settingDefs.map((d) => (
                  <div
                    className="flex flex-col gap-2 rounded-lg border border-[var(--border-light)] bg-[var(--bg-page)] p-3"
                    key={d.key}
                  >
                    <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                      {d.label}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <button
                        className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-surface)] text-lg font-semibold leading-none text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                        onClick={() => changeSetting(d.key, -1)}
                        type="button"
                      >
                        −
                      </button>
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono text-xl font-semibold text-[var(--text-primary)]">
                          {settings[d.key]}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)]">{d.unit}</span>
                      </div>
                      <button
                        className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-surface)] text-lg font-semibold leading-none text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                        onClick={() => changeSetting(d.key, 1)}
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <button
                className="inline-flex h-9 items-center justify-center rounded-md border-none bg-[var(--primary)] px-4.5 text-[13px] font-semibold text-[var(--text-on-primary)] hover:bg-[var(--primary-hover)]"
                onClick={toggleSettings}
                type="button"
              >
                {t.done}
              </button>
            </div>
          </div>
        </div>
      )}
    </DevBoxShell>
  );
}
