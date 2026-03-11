"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { FeedbackMessage } from "@/lib/game/types";

interface FeedbackToastProps {
  feedback: FeedbackMessage | null;
}

const styleMap: Record<FeedbackMessage["type"], string> = {
  success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
  error: "border-amber-500/40 bg-amber-500/10 text-amber-100",
  info: "border-sky-500/40 bg-sky-500/10 text-sky-100",
};

function FeedbackIcon({ type }: { type: FeedbackMessage["type"] }) {
  switch (type) {
    case "success":
      return <CheckCircle2 className="size-4" aria-hidden="true" />;
    case "error":
      return <AlertTriangle className="size-4" aria-hidden="true" />;
    default:
      return <Info className="size-4" aria-hidden="true" />;
  }
}

export function FeedbackToast({ feedback }: FeedbackToastProps) {
  return (
    <AnimatePresence>
      {feedback ? (
        <motion.div
          key={feedback.id}
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className={`fixed inset-x-4 top-4 z-40 mx-auto max-w-xl rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur ${styleMap[feedback.type]}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <FeedbackIcon type={feedback.type} />
            <div>
              <p className="font-medium">{feedback.message}</p>
              {feedback.detail ? <p className="mt-0.5 text-xs opacity-90">{feedback.detail}</p> : null}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
