'use client';

import { useState, useRef, useEffect } from 'react';

export default function TestPage() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [output, setOutput] = useState<string[]>([
    'Welcome to Web Terminal Simulator',
    'Type "help" for available commands',
    'Type "clear" to clear the terminal',
    '',
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  // Focus input when terminal opens
  useEffect(() => {
    if (isTerminalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTerminalOpen]);

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();

    let result: string[] = [];

    if (trimmedCmd === '') {
      result = [''];
    } else if (trimmedCmd === 'help') {
      result = [
        'Available commands:',
        '  help           - Show this help message',
        '  clear          - Clear the terminal',
        '  echo <text>    - Print text',
        '  date           - Show current date and time',
        '  whoami         - Show current user',
        '  pwd            - Print working directory',
        '  ls             - List files (simulated)',
        '  calculator <expr> - Simple calculator (e.g: calculator 2+2)',
        '',
      ];
    } else if (trimmedCmd === 'clear') {
      setOutput(['']);
      setInput('');
      return;
    } else if (trimmedCmd === 'date') {
      result = [new Date().toString(), ''];
    } else if (trimmedCmd === 'whoami') {
      result = ['admin@oracle-terminal', ''];
    } else if (trimmedCmd === 'pwd') {
      result = ['C:\\Users\\admin>', ''];
    } else if (trimmedCmd === 'ls') {
      result = [
        'app.exe',
        'documents/',
        'downloads/',
        'desktop/',
        'pictures/',
        '',
      ];
    } else if (trimmedCmd.startsWith('echo ')) {
      const text = trimmedCmd.substring(5);
      result = [text, ''];
    } else if (trimmedCmd.startsWith('calculator ')) {
      const expr = trimmedCmd.substring(11).replace(/\s/g, '');
      try {
        // Simple calculator with basic operations
        const calculatorResult = Function('"use strict"; return (' + expr + ')')();
        result = [calculatorResult.toString(), ''];
      } catch (e) {
        result = ['Error: Invalid expression', ''];
      }
    } else {
      result = [`'${cmd}' is not recognized as an internal or external command.`, ''];
    }

    setOutput((prev) => [...prev, `> ${cmd}`, ...result]);
    setHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Web Terminal Demo</h1>

        {!isTerminalOpen ? (
          <button
            onClick={() => setIsTerminalOpen(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105"
          >
            🖥️ Open Terminal
          </button>
        ) : (
          <div className="bg-black rounded-lg shadow-2xl overflow-hidden border-2 border-green-500">
            {/* Terminal Header */}
            <div className="bg-gray-800 px-4 py-2 border-b border-green-500 flex justify-between items-center">
              <span className="text-green-500 font-mono font-bold">Terminal</span>
              <button
                onClick={() => setIsTerminalOpen(false)}
                className="text-red-500 hover:text-red-700 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            {/* Terminal Display */}
            <div
              ref={terminalRef}
              className="w-full h-96 overflow-y-auto p-4 font-mono text-sm bg-black text-green-500 font-bold"
            >
              {output.map((line, idx) => (
                <div key={idx} className="whitespace-pre-wrap break-words">
                  {line}
                </div>
              ))}

              {/* Input Line */}
              <div className="flex items-center gap-1 mt-1">
                <span>{'>'}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-black text-green-500 outline-none font-bold"
                  autoFocus
                  spellCheck="false"
                />
                <span className="animate-pulse">|</span>
              </div>
            </div>

            {/* Terminal Footer */}
            <div className="bg-gray-800 px-4 py-2 border-t border-green-500 text-xs text-gray-400">
              <p>↑↓ Navigate history | Type "help" for commands</p>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Available Commands</h2>
            <ul className="text-gray-300 space-y-2 font-mono text-sm">
              <li>• <span className="text-green-400">help</span> - Show all commands</li>
              <li>• <span className="text-green-400">clear</span> - Clear terminal</li>
              <li>• <span className="text-green-400">echo &lt;text&gt;</span> - Print text</li>
              <li>• <span className="text-green-400">date</span> - Current date/time</li>
              <li>• <span className="text-green-400">whoami</span> - Current user</li>
              <li>• <span className="text-green-400">pwd</span> - Current directory</li>
              <li>• <span className="text-green-400">ls</span> - List files</li>
              <li>• <span className="text-green-400">calculator 2+2</span> - Calculate</li>
            </ul>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Features</h2>
            <ul className="text-gray-300 space-y-2">
              <li>✓ Command execution simulation</li>
              <li>✓ Command history navigation (↑↓)</li>
              <li>✓ Auto-scroll to bottom</li>
              <li>✓ Classic terminal styling</li>
              <li>✓ Multiple built-in commands</li>
              <li>✓ Simple calculator support</li>
              <li>✓ Error handling</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
