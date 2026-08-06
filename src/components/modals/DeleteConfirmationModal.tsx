"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: string;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Transaction",
  description = "Are you sure you want to delete this transaction? This action cannot be undone.",
}: DeleteConfirmationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isDeleting) return;
    setErrorMessage(null);
    onClose();
  };

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      setErrorMessage(null);
      await onConfirm();
      setIsDeleting(false);
      onClose();
    } catch (err: any) {
      console.error("Deletion failed:", err);
      setIsDeleting(false);
      setErrorMessage(err?.message || "Failed to delete transaction. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs max-w-md mx-auto"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-sm bg-[#ffffff] dark:bg-[#071b3a] rounded-3xl p-6 shadow-2xl border border-[#d6dce5] dark:border-[#123c73] z-10 text-[#071b3a] dark:text-slate-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="p-2 rounded-full text-slate-400 active:bg-slate-100 dark:active:bg-[#0b2854] transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-lg font-extrabold text-[#071b3a] dark:text-white tracking-tight mb-2">
            {title}
          </h3>
          <p className="text-xs text-[#071b3a]/70 dark:text-slate-300 leading-relaxed mb-4">
            {description}
          </p>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
              className="py-3 px-4 rounded-xl border border-[#d6dce5] dark:border-[#123c73] text-[#071b3a] dark:text-slate-300 font-bold text-xs uppercase tracking-wider active:bg-slate-100 dark:active:bg-[#0b2854] transition-all disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="py-3 px-4 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-rose-600/30 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
