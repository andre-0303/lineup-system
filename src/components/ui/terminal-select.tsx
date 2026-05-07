"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  color?: string;
}

interface TerminalSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

export function TerminalSelect({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  disabled,
  id,
}: TerminalSelectProps) {
  const [open, setOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const close = useCallback(() => {
    setOpen(false);
    setFocusedIdx(-1);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) close();
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, close]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (!open) {
          setOpen(true);
        } else if (focusedIdx >= 0) {
          onChange(options[focusedIdx].value);
          close();
        }
        break;
      case "Escape":
        close();
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!open) setOpen(true);
        setFocusedIdx((i) => Math.min(i + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIdx((i) => Math.max(i - 1, 0));
        break;
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center justify-between w-full px-3 py-2 text-sm transition-all"
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          background: "#0d0d0d",
          border: `1px solid ${open ? "rgba(0,255,0,0.5)" : "rgba(255,255,255,0.12)"}`,
          color: selected ? "#fff" : "rgba(255,255,255,0.3)",
          cursor: disabled ? "not-allowed" : "pointer",
          outline: "none",
          boxShadow: open ? "0 0 0 1px rgba(0,255,0,0.1)" : "none",
        }}
      >
        <span className="flex items-center gap-2 min-w-0">
          {selected?.color && (
            <span
              className="shrink-0 w-2 h-2 rounded-full"
              style={{ background: selected.color }}
            />
          )}
          <span className="truncate">{selected?.label ?? placeholder}</span>
        </span>
        <ChevronDown
          className="shrink-0 h-3.5 w-3.5 transition-transform"
          style={{
            color: "rgba(0,255,0,0.4)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute z-50 w-full mt-1 overflow-auto"
          style={{
            background: "#0d0d0d",
            border: "1px solid rgba(0,255,0,0.25)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,255,0,0.05)",
            maxHeight: "220px",
          }}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isFocused = idx === focusedIdx;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setFocusedIdx(idx)}
                onClick={() => {
                  onChange(opt.value);
                  close();
                }}
                className="flex items-center justify-between w-full px-3 py-2 text-sm text-left transition-colors"
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  background: isFocused ? "rgba(0,255,0,0.06)" : "transparent",
                  color: isSelected ? "#00ff00" : isFocused ? "#fff" : "rgba(255,255,255,0.7)",
                  cursor: "pointer",
                  outline: "none",
                  borderLeft: isSelected ? "2px solid #00ff00" : "2px solid transparent",
                }}
              >
                <span className="flex items-center gap-2">
                  {opt.color && (
                    <span
                      className="shrink-0 w-2 h-2 rounded-full"
                      style={{ background: opt.color }}
                    />
                  )}
                  {opt.label}
                </span>
                {isSelected && (
                  <Check className="h-3 w-3 shrink-0" style={{ color: "#00ff00" }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
