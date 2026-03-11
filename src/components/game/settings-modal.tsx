import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { GameMode, GameSettings, HighScores, ThemePreference } from "@/lib/game/types";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: GameSettings;
  highScores: HighScores;
  onThemeChange: (theme: ThemePreference) => void;
  onSoundToggle: (enabled: boolean) => void;
  onDefaultModeChange: (mode: GameMode) => void;
  onResetHighScores: () => void;
}

const THEME_OPTIONS: ThemePreference[] = ["system", "light", "dark"];
const MODE_OPTIONS: GameMode[] = ["classic", "timed", "easy", "hard", "challenge"];

function modeLabel(mode: GameMode) {
  return mode[0].toUpperCase() + mode.slice(1);
}

export function SettingsModal({
  open,
  onClose,
  settings,
  highScores,
  onThemeChange,
  onSoundToggle,
  onDefaultModeChange,
  onResetHighScores,
}: SettingsModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Settings" widthClassName="max-w-xl">
      <div className="space-y-5 text-sm text-[var(--text-secondary)]">
        <section className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <p className="font-medium text-[var(--text-primary)]">Theme</p>
          <div className="flex gap-2">
            {THEME_OPTIONS.map((theme) => (
              <Button
                key={theme}
                variant={settings.theme === theme ? "primary" : "secondary"}
                size="sm"
                onClick={() => onThemeChange(theme)}
              >
                {theme[0].toUpperCase() + theme.slice(1)}
              </Button>
            ))}
          </div>
        </section>

        <section className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <p className="font-medium text-[var(--text-primary)]">Audio</p>
          <div className="flex items-center justify-between rounded-xl bg-[var(--surface-strong)] px-3 py-2">
            <span>Sound effects</span>
            <button
              type="button"
              onClick={() => onSoundToggle(!settings.soundEnabled)}
              aria-pressed={settings.soundEnabled}
              className={`h-7 w-12 rounded-full p-1 transition ${
                settings.soundEnabled ? "bg-[var(--accent)]" : "bg-[var(--border)]"
              }`}
            >
              <span
                className={`block size-5 rounded-full bg-white transition ${
                  settings.soundEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </section>

        <section className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <p className="font-medium text-[var(--text-primary)]">Default Mode</p>
          <div className="flex flex-wrap gap-2">
            {MODE_OPTIONS.map((mode) => (
              <Button
                key={mode}
                size="sm"
                variant={settings.defaultMode === mode ? "primary" : "secondary"}
                onClick={() => onDefaultModeChange(mode)}
              >
                {modeLabel(mode)}
              </Button>
            ))}
          </div>
        </section>

        <section className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <div className="flex items-center justify-between">
            <p className="font-medium text-[var(--text-primary)]">High Scores</p>
            <Button variant="ghost" size="sm" onClick={onResetHighScores}>
              Reset
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            {MODE_OPTIONS.map((mode) => (
              <div key={mode} className="rounded-xl bg-[var(--surface-strong)] px-3 py-2">
                <p className="text-[var(--text-muted)]">{modeLabel(mode)}</p>
                <p className="mt-1 text-base font-semibold text-[var(--text-primary)]">{highScores[mode]}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Modal>
  );
}
