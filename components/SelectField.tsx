"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * A select whose open list is ours to style.
 *
 * A native <select> draws its popup in the operating system, not the page,
 * so the dark grey macOS menu ignored every rule we wrote. This is the
 * ARIA combobox pattern instead: a button that reads like .form-select, a
 * listbox panel in the page, and a hidden input so the form still submits
 * through FormData exactly as before.
 *
 * Keyboard behaviour matches a native select: Enter, Space or either arrow
 * opens the list on the current choice, the arrows and Home/End move
 * through it, Enter or Space picks, Escape and Tab close it.
 */
export type SelectOption = { value: string; label: string };

export default function SelectField({
  name,
  label,
  options,
  value,
  onChange,
  placeholder = "Select",
  required = false,
  invalid = false,
  groupClassName = "",
}: {
  name: string;
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  /** Draws the field's rim in the error colour. */
  invalid?: boolean;
  groupClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const uid = useId();
  const labelId = `${uid}-label`;
  const valueId = `${uid}-value`;
  const listId = `${uid}-list`;

  const selectedIndex = options.findIndex((o) => o.value === value);
  const current = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  /* Open on the current choice, so the arrows start where the eye is. */
  const openList = () => {
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  /* Keep the highlighted row in view when the list is longer than its
     scroll box and the arrows walk past the edge. */
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const choose = (i: number) => {
    onChange(options[i].value);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => Math.min(i + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(active);
        break;
    }
  };

  return (
    <div
      className={`form-group cl-select-group ${open ? "is-open" : ""} ${groupClassName}`
        .replace(/\s+/g, " ")
        .trim()}
    >
      <span className="form-label" id={labelId}>
        {label}
        {required && <span className="req">*</span>}
      </span>
      <div className="cl-select" ref={rootRef}>
        {/* The form is read with FormData, so the value travels here. */}
        <input type="hidden" name={name} value={value} />
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-haspopup="listbox"
          aria-labelledby={`${labelId} ${valueId}`}
          className={[
            "cl-select-btn",
            open ? "is-open" : "",
            invalid ? "is-invalid" : "",
            current ? "" : "is-empty",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => (open ? setOpen(false) : openList())}
          onKeyDown={onKeyDown}
        >
          <span id={valueId}>{current ? current.label : placeholder}</span>
          <svg
            className="cl-select-chev"
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="1 1.5 6 6.5 11 1.5" />
          </svg>
        </button>
        {open && (
          <ul
            className="cl-select-list"
            id={listId}
            role="listbox"
            aria-labelledby={labelId}
            ref={listRef}
          >
            {options.map((o, i) => (
              /* mousedown is prevented so the button keeps focus and the
                 outside-click handler never races the choice. */
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                data-active={i === active}
                className={[
                  "cl-select-opt",
                  i === active ? "is-active" : "",
                  o.value === value ? "is-selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(i)}
              >
                <span>{o.label}</span>
                <svg
                  className="cl-select-tick"
                  width="13"
                  height="13"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="3 7.5 5.8 10.2 11 4.6" />
                </svg>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
