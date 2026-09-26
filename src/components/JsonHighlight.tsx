type JsonToken = {
  type: "key" | "string" | "number" | "boolean" | "null" | "punctuation";
  value: string;
};

function tokenizeJson(json: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  let i = 0;

  while (i < json.length) {
    const char = json[i];

    if (char === '"') {
      let value = '"';
      i += 1;
      while (i < json.length) {
        value += json[i];
        if (json[i] === "\\") {
          i += 1;
          if (i < json.length) {
            value += json[i];
          }
        } else if (json[i] === '"') {
          break;
        }
        i += 1;
      }
      i += 1;
      let type: JsonToken["type"] = "string";
      let j = i;
      while (j < json.length && /\s/.test(json[j])) j += 1;
      if (json[j] === ":") {
        type = "key";
      }
      tokens.push({ type, value });
      continue;
    }

    if (/[-0-9]/.test(char)) {
      let value = char;
      i += 1;
      while (i < json.length && /[0-9.eE+-]/.test(json[i])) {
        value += json[i];
        i += 1;
      }
      tokens.push({ type: "number", value });
      continue;
    }

    if (json.startsWith("true", i) || json.startsWith("false", i)) {
      const word = json.startsWith("true", i) ? "true" : "false";
      tokens.push({ type: "boolean", value: word });
      i += word.length;
      continue;
    }

    if (json.startsWith("null", i)) {
      tokens.push({ type: "null", value: "null" });
      i += 4;
      continue;
    }

    if ("{}[],:".includes(char)) {
      tokens.push({ type: "punctuation", value: char });
      i += 1;
      continue;
    }

    tokens.push({ type: "punctuation", value: char });
    i += 1;
  }

  return tokens;
}

const tokenClassName: Record<JsonToken["type"], string> = {
  key: "text-accent",
  string: "text-foreground/90",
  number: "text-[#fbbf24]",
  boolean: "text-[#c084fc]",
  null: "text-muted",
  punctuation: "text-muted/80",
};

type JsonHighlightProps = {
  json: string;
};

export default function JsonHighlight({ json }: JsonHighlightProps) {
  const tokens = tokenizeJson(json);

  return (
    <code className="block whitespace-pre-wrap break-words font-mono text-xs leading-relaxed sm:text-sm sm:leading-6">
      {tokens.map((token, index) => (
        <span key={`${index}-${token.value.slice(0, 8)}`} className={tokenClassName[token.type]}>
          {token.value}
        </span>
      ))}
    </code>
  );
}
