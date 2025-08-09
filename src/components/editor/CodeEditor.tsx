import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { markdown } from "@codemirror/lang-markdown";
import { json as jsonLang } from "@codemirror/lang-json";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { Extension } from "@codemirror/state";

export type SyntaxLanguage =
  | "plaintext"
  | "javascript"
  | "typescript"
  | "python"
  | "markdown"
  | "json"
  | "html"
  | "css";

export const languageOptions: { label: string; value: SyntaxLanguage }[] = [
  { label: "Plain Text", value: "plaintext" },
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "Markdown", value: "markdown" },
  { label: "JSON", value: "json" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
];

function getExtensions(lang: SyntaxLanguage): Extension[] {
  switch (lang) {
    case "javascript":
    case "typescript":
      return [javascript({ jsx: true, typescript: lang === "typescript" })];
    case "python":
      return [python()];
    case "markdown":
      return [markdown()];
    case "json":
      return [jsonLang()];
    case "html":
      return [html()];
    case "css":
      return [css()];
    default:
      return [];
  }
}

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  language: SyntaxLanguage;
}

export const CodeEditor = ({ value, onChange, language }: CodeEditorProps) => {
  return (
    <div className="rounded-md border overflow-hidden">
      <CodeMirror
        value={value}
        height="400px"
        basicSetup={{ lineNumbers: true }}
        extensions={getExtensions(language)}
        onChange={(val) => onChange(val)}
      />
    </div>
  );
};
