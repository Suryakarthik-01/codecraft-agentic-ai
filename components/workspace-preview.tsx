"use client";

import { useState } from "react";
import { CodeXml, Monitor, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { KANBAN_PREVIEW } from "@/lib/data";

const TABS = [
  { id: "preview", label: "Preview", icon: Monitor },
  { id: "code", label: "Code", icon: CodeXml },
] as const;

type TabId = (typeof TABS)[number]["id"];

const CODE_LINES: { indent: number; tokens: [string, string][] }[] = [
  { indent: 0, tokens: [["text-violet-300/80", "import"], ["text-white/60", " { DndContext } "], ["text-violet-300/80", "from"], ["text-emerald-300/80", " \"@dnd-kit/core\""], ["text-white/40", ";"]] },
  { indent: 0, tokens: [["text-violet-300/80", "import"], ["text-white/60", " { Column } "], ["text-violet-300/80", "from"], ["text-emerald-300/80", " \"./column\""], ["text-white/40", ";"]] },
  { indent: 0, tokens: [] },
  { indent: 0, tokens: [["text-violet-300/80", "export default function"], ["text-blue-300", " KanbanBoard"], ["text-white/60", "() {"]] },
  { indent: 1, tokens: [["text-violet-300/80", "const"], ["text-white/60", " { columns, moveCard } = "], ["text-blue-300", "useBoard"], ["text-white/60", "();"]] },
  { indent: 0, tokens: [] },
  { indent: 1, tokens: [["text-violet-300/80", "return"], ["text-white/60", " ("]] },
  { indent: 2, tokens: [["text-white/40", "<"], ["text-blue-300", "DndContext"], ["text-sky-200/70", " onDragEnd"], ["text-white/40", "="], ["text-white/60", "{moveCard}"], ["text-white/40", ">"]] },
  { indent: 3, tokens: [["text-white/40", "<"], ["text-white/70", "div"], ["text-sky-200/70", " className"], ["text-white/40", "="], ["text-emerald-300/80", "\"grid grid-cols-3 gap-4\""], ["text-white/40", ">"]] },
  { indent: 4, tokens: [["text-white/60", "{columns.map((col) => ("]] },
  { indent: 5, tokens: [["text-white/40", "<"], ["text-blue-300", "Column"], ["text-sky-200/70", " key"], ["text-white/40", "="], ["text-white/60", "{col.id} "], ["text-sky-200/70", "column"], ["text-white/40", "="], ["text-white/60", "{col} "], ["text-white/40", "/>"]] },
  { indent: 4, tokens: [["text-white/60", "))}"]] },
  { indent: 3, tokens: [["text-white/40", "</"], ["text-white/70", "div"], ["text-white/40", ">"]] },
  { indent: 2, tokens: [["text-white/40", "</"], ["text-blue-300", "DndContext"], ["text-white/40", ">"]] },
  { indent: 1, tokens: [["text-white/60", ");"]] },
  { indent: 0, tokens: [["text-white/60", "}"]] },
];

/**
 * Right-hand panel of the landing-page workspace mockup: a Preview / Code
 * tab bar over a rendered kanban board.
 */
export function WorkspacePreview({ className }: { className?: string }) {
  const [tab, setTab] = useState<TabId>("preview");

  return (
    <div className={cn("flex min-w-0 flex-1 flex-col", className)}>
      <div
        role="tablist"
        aria-label="Workspace view"
        className="flex items-center gap-2 border-b border-white/6 px-4"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              className={cn(
                "relative flex h-10 items-center gap-2 px-2 text-xs font-medium outline-none transition-colors",
                "focus-visible:text-white",
                active ? "text-white" : "text-white/40 hover:text-white/70"
              )}
            >
              <Icon className="size-3.5" aria-hidden />
              {label}
              {active && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-hidden">
        {tab === "preview" ? <KanbanBoard /> : <CodeView />}
      </div>
    </div>
  );
}

function KanbanBoard() {
  return (
    <div className="grid h-full grid-cols-3 items-start gap-2.5 p-3 sm:gap-3 sm:p-4">
      {KANBAN_PREVIEW.map((column) => (
        <div
          key={column.title}
          className="flex min-w-0 flex-col gap-2 rounded-xl border border-white/6 bg-white/2 p-2 sm:p-2.5"
        >
          <div className="flex items-center gap-2 px-1 pb-1 pt-0.5">
            <span className="truncate text-xs font-medium text-white/85 sm:text-[13px]">
              {column.title}
            </span>
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/8 text-[10px] font-medium tabular-nums text-white/50">
              {column.cards.length}
            </span>
            <Plus className="ml-auto size-3.5 shrink-0 text-white/30" aria-hidden />
          </div>

          {column.cards.map((card, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/6 bg-[#1a1a1a] p-2.5 sm:p-3"
            >
              <div
                className="h-1.5 rounded-full bg-white/20"
                style={{ width: card.titleWidth }}
              />
              <div
                className="mt-2 h-1.5 rounded-full bg-white/8"
                style={{ width: card.bodyWidth }}
              />
              <div className="mt-3 h-1.5 w-8 rounded-full bg-white/8" />
            </div>
          ))}

          <div className="flex h-9 items-center justify-center rounded-lg border border-dashed border-white/8 text-white/25">
            <Plus className="size-3.5" aria-hidden />
          </div>
        </div>
      ))}
    </div>
  );
}

function CodeView() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-white/6 px-4 py-2.5">
        <span className="font-mono text-[11px] text-white/50">
          src/components/kanban-board.tsx
        </span>
      </div>
      <pre className="flex-1 overflow-hidden px-4 py-3 font-mono text-[11px] leading-5 sm:text-xs sm:leading-6">
        {CODE_LINES.map((line, i) => (
          <div key={i} className="flex">
            <span className="w-7 shrink-0 select-none text-right text-white/15">
              {i + 1}
            </span>
            <code className="pl-4 whitespace-pre">
              {"  ".repeat(line.indent)}
              {line.tokens.map(([color, text], j) => (
                <span key={j} className={color}>
                  {text}
                </span>
              ))}
            </code>
          </div>
        ))}
      </pre>
    </div>
  );
}
