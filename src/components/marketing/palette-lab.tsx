"use client";

import { useEffect, useMemo, useState } from "react";

type RoleKey = "ink" | "paper" | "gold" | "teal" | "crimson";

type Role = {
  key: RoleKey;
  label: string;
  description: string;
  cssVars: string[];
};

const ROLES: Role[] = [
  {
    key: "ink",
    label: "Ink",
    description: "Headings, body text, footer, dark buttons",
    cssVars: ["--ink", "--foreground"],
  },
  {
    key: "paper",
    label: "Paper",
    description: "Page background and soft panels",
    cssVars: ["--paper", "--background"],
  },
  {
    key: "gold",
    label: "Gold",
    description: "Eyebrows, accent lines, brand highlights",
    cssVars: ["--gold", "--brass"],
  },
  {
    key: "teal",
    label: "Teal",
    description: "Secondary buttons, link hovers, numbers",
    cssVars: ["--teal"],
  },
  {
    key: "crimson",
    label: "Crimson",
    description: "Primary enroll / purchase CTAs",
    cssVars: ["--crimson"],
  },
];

const DEFAULTS: Record<RoleKey, string> = {
  ink: "#000022",
  paper: "#dbe9ee",
  gold: "#c4a35a",
  teal: "#588b8b",
  crimson: "#931f1d",
};

function randomHex() {
  const n = Math.floor(Math.random() * 0xffffff);
  return `#${n.toString(16).padStart(6, "0")}`;
}

function normalizeHex(value: string) {
  const raw = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toLowerCase();
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toLowerCase()}`;
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
    const [, a, b, c] = raw;
    return `#${a}${a}${b}${b}${c}${c}`.toLowerCase();
  }
  return null;
}

function mixHex(hex: string, withColor: string, weight: number) {
  const parse = (h: string) => {
    const v = h.replace("#", "");
    return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16));
  };
  const a = parse(hex);
  const b = parse(withColor);
  const mixed = a.map((channel, i) => Math.round(channel * (1 - weight) + b[i] * weight));
  return `#${mixed.map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

export function PaletteLab() {
  const [colors, setColors] = useState<Record<RoleKey, string>>(DEFAULTS);
  const [drafts, setDrafts] = useState<Record<RoleKey, string>>(DEFAULTS);

  const exportBlock = useMemo(
    () =>
      ROLES.map((role) => `${role.key}: ${colors[role.key]}`).join("\n"),
    [colors],
  );

  useEffect(() => {
    const root = document.documentElement;
    for (const role of ROLES) {
      const value = colors[role.key];
      for (const cssVar of role.cssVars) {
        root.style.setProperty(cssVar, value);
      }
    }

    root.style.setProperty("--brass-2", mixHex(colors.gold, "#000000", 0.18));
    root.style.setProperty("--teal-2", mixHex(colors.teal, "#000000", 0.18));
    root.style.setProperty("--crimson-2", mixHex(colors.crimson, "#000000", 0.14));
    root.style.setProperty("--ink-2", mixHex(colors.ink, "#ffffff", 0.12));
    root.style.setProperty("--ink-3", mixHex(colors.ink, "#ffffff", 0.22));
    root.style.setProperty("--stone", mixHex(colors.ink, colors.paper, 0.45));
    root.style.setProperty("--mist", mixHex(colors.ink, colors.paper, 0.58));
    root.style.setProperty("--line", `${colors.ink}1a`);
    root.style.setProperty("--line-dark", `${colors.ink}1f`);
  }, [colors]);

  function setRole(key: RoleKey, value: string) {
    const normalized = normalizeHex(value);
    if (!normalized) return;
    setColors((prev) => ({ ...prev, [key]: normalized }));
    setDrafts((prev) => ({ ...prev, [key]: normalized }));
  }

  function randomizeRole(key: RoleKey) {
    const next = randomHex();
    setRole(key, next);
  }

  function randomizeAll() {
    const next = Object.fromEntries(ROLES.map((role) => [role.key, randomHex()])) as Record<
      RoleKey,
      string
    >;
    setColors(next);
    setDrafts(next);
  }

  function resetDefaults() {
    setColors(DEFAULTS);
    setDrafts(DEFAULTS);
  }

  async function copyExport() {
    try {
      await navigator.clipboard.writeText(exportBlock);
    } catch {
      // ignore clipboard failures in restricted previews
    }
  }

  return (
    <section className="border-y border-[var(--line-dark)] bg-white">
      <div className="container-wide py-14 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.22em] text-gold">Palette lab</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Tune the brand colors live.</h2>
            <p className="mt-3 text-sm text-stone">
              Randomize any role or paste a hex code. Changes apply instantly across the page.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn btn-secondary" onClick={randomizeAll}>
              Randomize all
            </button>
            <button type="button" className="btn btn-ghost" onClick={resetDefaults}>
              Reset
            </button>
            <button type="button" className="btn btn-outline" onClick={copyExport}>
              Copy hexes
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ROLES.map((role) => (
            <article key={role.key} className="rounded-2xl border border-[var(--line-dark)] bg-paper p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-2xl">{role.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-stone">{role.description}</p>
                </div>
                <span
                  className="h-12 w-12 shrink-0 rounded-full border border-[var(--line-dark)] shadow-inner"
                  style={{ background: colors[role.key] }}
                  aria-hidden
                />
              </div>

              <div className="mt-4 grid gap-3">
                <label className="field">
                  <span>Hex</span>
                  <input
                    value={drafts[role.key]}
                    onChange={(e) => {
                      const value = e.target.value;
                      setDrafts((prev) => ({ ...prev, [role.key]: value }));
                      const normalized = normalizeHex(value);
                      if (normalized) {
                        setColors((prev) => ({ ...prev, [role.key]: normalized }));
                      }
                    }}
                    onBlur={() => {
                      const normalized = normalizeHex(drafts[role.key]);
                      if (normalized) {
                        setRole(role.key, normalized);
                      } else {
                        setDrafts((prev) => ({ ...prev, [role.key]: colors[role.key] }));
                      }
                    }}
                    spellCheck={false}
                    placeholder="#000000"
                  />
                </label>

                <div className="flex items-center gap-3">
                  <label className="field flex-1">
                    <span>Picker</span>
                    <input
                      type="color"
                      value={colors[role.key]}
                      onChange={(e) => setRole(role.key, e.target.value)}
                      className="h-11 cursor-pointer p-1"
                      aria-label={`${role.label} color picker`}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn btn-outline mt-5 py-2"
                    onClick={() => randomizeRole(role.key)}
                  >
                    Random
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <pre className="mt-8 overflow-x-auto rounded-2xl border border-[var(--line-dark)] bg-ink p-5 text-sm text-white/85">
          {exportBlock}
        </pre>
      </div>
    </section>
  );
}
