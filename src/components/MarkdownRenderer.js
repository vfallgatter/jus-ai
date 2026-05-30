'use client';

export default function MarkdownRenderer({ content }) {
  const lines = content.split('\n');

  const renderInline = (text) => {
    // bold
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-[#0B2545]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // italic
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<div key={i} className="h-2" />);
      i++;
      continue;
    }

    // h2
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-base font-bold text-[#0B2545] mt-3 mb-1 border-b border-slate-200 pb-1">
          {renderInline(trimmed.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    // h3
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-sm font-bold text-[#0B2545] mt-2 mb-1">
          {renderInline(trimmed.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // hr
    if (trimmed === '---') {
      elements.push(<hr key={i} className="my-3 border-slate-200" />);
      i++;
      continue;
    }

    // list items - collect consecutive ones
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const listItems = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))
      ) {
        listItems.push(
          <li key={i} className="leading-relaxed">
            {renderInline(lines[i].trim().slice(2))}
          </li>
        );
        i++;
      }
      elements.push(
        <ul key={`list-${i}`} className="list-disc pl-5 space-y-0.5 my-1">
          {listItems}
        </ul>
      );
      continue;
    }

    // numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      const listItems = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        listItems.push(
          <li key={i} className="leading-relaxed">
            {renderInline(lines[i].trim().replace(/^\d+\.\s/, ''))}
          </li>
        );
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="list-decimal pl-5 space-y-0.5 my-1">
          {listItems}
        </ol>
      );
      continue;
    }

    // paragraph
    elements.push(
      <p key={i} className="leading-relaxed text-justify">
        {renderInline(trimmed)}
      </p>
    );
    i++;
  }

  return <div className="space-y-1.5 text-slate-800">{elements}</div>;
}