import { HELP_SHORTCUTS } from "@/lib/game/constants";
import { Modal } from "@/components/ui/modal";

interface HowToPlayModalProps {
  open: boolean;
  onClose: () => void;
}

export function HowToPlayModal({ open, onClose }: HowToPlayModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="How To Play">
      <div className="space-y-4 text-sm text-[var(--text-secondary)]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <p className="font-medium text-[var(--text-primary)]">Objective</p>
          <p className="mt-2">Create an expression equal to 24 using all four dealt numbers exactly once.</p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <p className="font-medium text-[var(--text-primary)]">Allowed Symbols</p>
          <p className="mt-2">Numbers from the hand, operators +, -, *, /, and parentheses.</p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <p className="font-medium text-[var(--text-primary)]">Modes</p>
          <ul className="mt-2 space-y-1">
            <li>Classic: steady solvable rounds.</li>
            <li>Easy: smaller numbers, always solvable.</li>
            <li>Hard: fully random hands, solvable or not.</li>
            <li>Timed: 90-second score sprint.</li>
            <li>Challenge: faster rounds with limited mistakes.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
          <p className="font-medium text-[var(--text-primary)]">Keyboard Shortcuts</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {HELP_SHORTCUTS.map((shortcut) => (
              <div key={shortcut.key} className="flex items-center justify-between rounded-xl bg-[var(--surface-strong)] px-3 py-2">
                <kbd className="rounded-md border border-[var(--border)] bg-[var(--bg-panel)] px-2 py-1 text-xs text-[var(--text-primary)]">
                  {shortcut.key}
                </kbd>
                <span className="text-xs">{shortcut.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
