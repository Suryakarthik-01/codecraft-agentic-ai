"use client";

import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import {
  ArrowRight,
  CodeXml,
  FileText,
  ImageIcon,
  Paperclip,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MAX_TEXTAREA_HEIGHT = 200;

/* ── Action pill ─────────────────────────────────────────────────────────── */

type PromptBarActionProps = ComponentProps<"button"> & {
  icon: ReactNode;
  label: string;
};

/**
 * Outlined pill used in the prompt bar toolbar. The label collapses to an
 * icon-only button on small screens but stays available to screen readers.
 */
export function PromptBarAction({
  icon,
  label,
  className,
  type = "button",
  ...props
}: PromptBarActionProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        "inline-flex h-10 shrink-0 items-center justify-center gap-2.5 rounded-full border border-white/8 px-3 text-sm font-medium text-white/70 outline-none transition-colors sm:px-4",
        "hover:border-white/12 hover:bg-white/4 hover:text-white/90",
        "focus-visible:border-white/20 focus-visible:ring-2 focus-visible:ring-white/10",
        "aria-expanded:border-white/12 aria-expanded:bg-white/4 aria-expanded:text-white/90",
        "disabled:pointer-events-none disabled:opacity-40",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/* ── Prompt bar ──────────────────────────────────────────────────────────── */

export type PromptBarProps = {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  /** Accessible label for the prompt field. */
  label?: string;
  /** Disables the submit button (e.g. while a request is in flight). */
  submitDisabled?: boolean;
  /** Lets an empty prompt be submitted, e.g. when submit opens a sign-in flow. */
  allowEmptySubmit?: boolean;
  /** Wrap the submit button, e.g. in an auth gate. Receives the rendered button. */
  renderSubmit?: (button: ReactElement) => ReactNode;

  /** Attachments — omit `onAttachmentsChange` to hide the Attach action. */
  attachments?: File[];
  onAttachmentsChange?: (files: File[]) => void;
  accept?: string;
  maxAttachments?: number;

  /** Templates — omit or pass an empty list to hide the Use template action. */
  templates?: readonly string[];
  onTemplateSelect?: (template: string) => void;

  /** Dropdown content for the Advanced action. Omit to hide it. */
  advanced?: ReactNode;

  /** Imperative access to the prompt field, e.g. to focus it from outside. */
  inputRef?: Ref<HTMLTextAreaElement | null>;
  className?: string;
};

export function PromptBar({
  value,
  onValueChange,
  onSubmit,
  placeholder = "Describe what you want to build...",
  label = "Describe what you want to build",
  submitDisabled = false,
  allowEmptySubmit = false,
  renderSubmit,
  attachments = [],
  onAttachmentsChange,
  accept = "image/*",
  maxAttachments = 4,
  templates = [],
  onTemplateSelect,
  advanced,
  inputRef,
  className,
}: PromptBarProps) {
  const textareaId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useImperativeHandle<HTMLTextAreaElement | null, HTMLTextAreaElement | null>(
    inputRef,
    () => textareaRef.current,
    []
  );

  const hasPrompt = value.trim().length > 0;
  const canSubmit = !submitDisabled && (hasPrompt || allowEmptySubmit);
  const canAttach = attachments.length < maxAttachments;

  // Grow the textarea with its content, up to a cap.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [value]);

  const submit = () => {
    if (canSubmit && hasPrompt) onSubmit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const handleFiles = (list: FileList | null) => {
    if (!list || !onAttachmentsChange) return;
    const next = [...attachments];
    for (const file of Array.from(list)) {
      if (next.length >= maxAttachments) break;
      const isDuplicate = next.some(
        (f) => f.name === file.name && f.size === file.size
      );
      if (!isDuplicate) next.push(file);
    }
    onAttachmentsChange(next);
    // Reset so selecting the same file again still fires `change`.
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    onAttachmentsChange?.(attachments.filter((_, i) => i !== index));
    textareaRef.current?.focus();
  };

  const submitButton = (
    <button
      type="button"
      onClick={submit}
      disabled={!canSubmit}
      className={cn(
        "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-white pl-4 pr-3.5 text-sm font-semibold text-black outline-none transition-[background-color,opacity] sm:pl-5 sm:pr-4",
        "hover:bg-white/90",
        "focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        "disabled:cursor-not-allowed disabled:opacity-40"
      )}
    >
      Generate
      <ArrowRight className="size-4 shrink-0" aria-hidden />
    </button>
  );

  return (
    <div
      className={cn(
        "relative w-full rounded-3xl border p-3 text-left transition-colors duration-200 sm:p-4",
        "bg-black/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-xl",
        isFocused ? "border-white/15" : "border-white/8 hover:border-white/12",
        className
      )}
      onClick={(e) => {
        // Clicking the bar's empty space focuses the prompt.
        if (e.target === e.currentTarget) textareaRef.current?.focus();
      }}
    >
      {/* Prompt row */}
      <div className="px-2 sm:px-3">
        <label htmlFor={textareaId} className="sr-only">
          {label}
        </label>
        <textarea
          id={textareaId}
          ref={textareaRef}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          aria-keyshortcuts="Enter"
          rows={1}
          className="min-h-11 w-full resize-none bg-transparent py-2 text-base leading-7 text-white/90 caret-white outline-none placeholder:text-white/30 sm:text-[17px]"
          style={{ maxHeight: MAX_TEXTAREA_HEIGHT }}
        />
      </div>

      {/* Attachments */}
      {attachments.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2 px-1 sm:px-2" aria-label="Attachments">
          {attachments.map((file, i) => {
            const Icon = file.type.startsWith("image/") ? ImageIcon : FileText;
            return (
              <li
                key={`${file.name}-${file.size}`}
                className="flex h-8 max-w-56 items-center gap-2 rounded-full border border-white/10 bg-white/4 pl-3 pr-1 text-xs text-white/70"
              >
                <Icon className="size-3.5 shrink-0 text-white/50" aria-hidden />
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(i)}
                  aria-label={`Remove ${file.name}`}
                  className="flex size-6 shrink-0 items-center justify-center rounded-full text-white/40 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/20"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Toolbar */}
      <div className="mt-4 flex items-center justify-between gap-3 sm:mt-5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {onAttachmentsChange && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple={maxAttachments > 1}
                className="hidden"
                tabIndex={-1}
                onChange={(e) => handleFiles(e.target.files)}
              />
              <PromptBarAction
                icon={<Paperclip aria-hidden />}
                label="Attach"
                disabled={!canAttach}
                title={canAttach ? undefined : `Up to ${maxAttachments} files`}
                onClick={() => fileInputRef.current?.click()}
              />
            </>
          )}

          {templates.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <PromptBarAction
                    icon={<CodeXml aria-hidden />}
                    label="Use template"
                  />
                }
              />
              <DropdownMenuContent
                align="start"
                sideOffset={8}
                className="w-72 rounded-xl border border-white/10 bg-[#111318] p-1.5 shadow-2xl shadow-black/60 ring-0"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-white/40">
                    Start from a template
                  </DropdownMenuLabel>
                  {templates.map((t) => (
                    <DropdownMenuItem
                      key={t}
                      onClick={() => {
                        onTemplateSelect?.(t);
                        textareaRef.current?.focus();
                      }}
                      className="rounded-lg px-2.5 py-2 text-sm text-white/75 focus:bg-white/6 focus:text-white"
                    >
                      {t}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {advanced && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <PromptBarAction
                    icon={<Settings aria-hidden />}
                    label="Advanced"
                  />
                }
              />
              <DropdownMenuContent
                align="start"
                sideOffset={8}
                className="w-60 rounded-xl border border-white/10 bg-[#111318] p-1.5 shadow-2xl shadow-black/60 ring-0"
              >
                {advanced}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {renderSubmit ? renderSubmit(submitButton) : submitButton}
      </div>
    </div>
  );
}
