import type { ReactNode } from "react";
import { slugify } from "@/lib/blog";

function getTextContent(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(getTextContent).join("");
  if (children && typeof children === "object" && "props" in children) {
    return getTextContent(
      (children as { props: { children?: ReactNode } }).props.children,
    );
  }
  return "";
}

function H2({ children }: { children?: ReactNode }) {
  const text = getTextContent(children);
  const id = slugify(text);
  return <h2 id={id}>{children}</h2>;
}

function H3({ children }: { children?: ReactNode }) {
  const text = getTextContent(children);
  const id = slugify(text);
  return <h3 id={id}>{children}</h3>;
}

function Blockquote({ children }: { children?: ReactNode }) {
  const text = getTextContent(children);

  let label: string | null = null;
  let borderColor = "border-violet-500";
  let bgColor = "bg-violet-500/10";
  let labelColor = "text-violet-400";

  if (text.includes("\u{1F4A1}")) {
    label = "Bon à savoir";
    borderColor = "border-emerald-500";
    bgColor = "bg-emerald-500/10";
    labelColor = "text-emerald-400";
  } else if (text.includes("\u{26A0}")) {
    label = "Attention";
    borderColor = "border-amber-500";
    bgColor = "bg-amber-500/10";
    labelColor = "text-amber-400";
  } else if (text.includes("\u{1F4CC}")) {
    label = "À retenir";
    borderColor = "border-violet-500";
    bgColor = "bg-violet-500/10";
    labelColor = "text-violet-400";
  }

  return (
    <div
      className={`not-prose my-6 border-l-4 ${borderColor} ${bgColor} rounded-r-lg px-4 py-3`}
    >
      {label && (
        <p className={`mb-1 text-xs font-semibold ${labelColor}`}>{label}</p>
      )}
      <div className="text-sm leading-7 text-slate-300 [&_p]:m-0 [&_strong]:font-semibold [&_strong]:text-white">
        {children}
      </div>
    </div>
  );
}

export const mdxComponents = {
  h2: H2,
  h3: H3,
  blockquote: Blockquote,
};
