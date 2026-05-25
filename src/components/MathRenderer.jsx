/* eslint-disable react-refresh/only-export-components */
import katex from 'katex';
import 'katex/dist/katex.min.css';

export function preprocessMath(text) {
  if (!text) return text;
  let result = '';
  let i = 0;

  while (i < text.length) {
    const dollarStart = text.indexOf('$', i);
    if (dollarStart === -1) {
      result += text.slice(i);
      break;
    }

    result += text.slice(i, dollarStart);

    if (dollarStart + 1 < text.length && text[dollarStart + 1] === '$') {
      const end = text.indexOf('$$', dollarStart + 2);
      if (end !== -1) {
        const tex = text.slice(dollarStart + 2, end);
        try {
          result += katex.renderToString(tex, { displayMode: true, throwOnError: false });
        } catch {
          result += `$$${tex}$$`;
        }
        i = end + 2;
      } else {
        result += '$';
        i = dollarStart + 1;
      }
    } else {
      const end = text.indexOf('$', dollarStart + 1);
      if (end !== -1 && text[end - 1] !== '\\') {
        const tex = text.slice(dollarStart + 1, end);
        try {
          result += katex.renderToString(tex, { displayMode: false, throwOnError: false });
        } catch {
          result += `$${tex}$`;
        }
        i = end + 1;
      } else {
        result += '$';
        i = dollarStart + 1;
      }
    }
  }

  return result;
}

function MathRenderer({ content }) {
  if (!content) return null;
  return <span className="math-container" dangerouslySetInnerHTML={{ __html: preprocessMath(content) }} />;
}

export default MathRenderer;
