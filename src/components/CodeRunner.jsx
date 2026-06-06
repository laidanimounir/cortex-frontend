import React, { useState } from 'react';

function CodeRunner({ code, language }) {
  const iframeRef = React.useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const runCode = () => {
    setIsOpen(true);
    const iframe = iframeRef.current;
    if (!iframe) return;
    const fullHtml = language === 'html' || language === 'jsx'
      ? code
      : `<html><body><script>${code}<\/script></body></html>`;
    iframe.srcdoc = fullHtml;
  };

  return (
    <div className="code-runner">
      <button className="code-run-btn" onClick={runCode}>
        ▶ Run
      </button>
      {isOpen && (
        <div className="code-runner-output">
          <div className="code-runner-toolbar">
            <span className="code-runner-label">Output</span>
            <button className="code-runner-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <iframe
            ref={iframeRef}
            className="code-runner-iframe"
            sandbox="allow-scripts"
            title="Code Runner"
          />
        </div>
      )}
    </div>
  );
}

export default CodeRunner;
