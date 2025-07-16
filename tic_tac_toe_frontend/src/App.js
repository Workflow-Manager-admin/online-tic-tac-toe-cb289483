import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Colors and style variables from requirements:
 *  - primary:   #1976d2 (board/grid, active player, primary button)
 *  - accent:    #ffd600 (accent status, highlights)
 *  - secondary: #ffffff (background)
 * 
 * Layout: centered, modern, minimal, responsive; 3x3 grid main focus.
 */

// Utility to determine if there is a winner
function calculateWinner(squares) {
  const lines = [
    [0,1,2], [3,4,5], [6,7,8], // rows
    [0,3,6], [1,4,7], [2,5,8], // cols
    [0,4,8], [2,4,6]           // diagonals
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return { winner: squares[a], line };
    }
  }
  return null;
}

// PUBLIC_INTERFACE
function App() {
  // 'X' always starts
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [step, setStep] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);
  const currentSquares = history[step];
  const result = calculateWinner(currentSquares);
  const isBoardFull = currentSquares.every(Boolean);

  // PUBLIC_INTERFACE
  function handleSquareClick(i) {
    if (currentSquares[i] || result) return; // Ignore click if filled or game over
    const squares = currentSquares.slice();
    squares[i] = xIsNext ? "X" : "O";
    const newHistory = [...history.slice(0, step + 1), squares];
    setHistory(newHistory);
    setStep(newHistory.length - 1);
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function handleReset() {
    setHistory([Array(9).fill(null)]);
    setStep(0);
    setXIsNext(true);
  }

  // PUBLIC_INTERFACE
  function handleReplay() {
    handleReset();
  }

  let status;
  if (result) {
    status = (
      <span style={{ color: `#ffd600`}}>
        Winner: <b>{result.winner}</b>
      </span>
    );
  } else if (isBoardFull) {
    status = (
      <span style={{ color: `#ffd600`}}>
        It's a <b>draw</b>!
      </span>
    );
  } else {
    status = (
      <span>
        Next Turn:{" "}
        <b
          style={{
            color: "#1976d2",
            letterSpacing: "1px",
          }}
        >
          {xIsNext ? "X" : "O"}
        </b>
      </span>
    );
  }

  return (
    <div
      className="tictactoe-app"
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily:
          'Inter, "Roboto", "Segoe UI", Arial, sans-serif',
      }}
    >
      <h2 style={{
        margin: "24px 0 8px 0",
        fontWeight: 600,
        letterSpacing: "1px",
        color: "#1976d2",
        fontSize: "2.5rem"
      }}>
        Tic Tac Toe
      </h2>
      <div style={{
        minHeight: "32px",
        fontSize: "1.2rem",
        paddingBottom: "6px",
        marginTop: "8px",
      }}>
        {status}
      </div>
      <Board
        squares={currentSquares}
        onSquareClick={handleSquareClick}
        winningLine={result ? result.line : []}
      />
      <div style={{marginTop: "32px"}}>
        <button
          className="ttt-btn"
          onClick={handleReset}
          aria-label="Reset game"
          style={{
            marginRight: "12px"
          }}
        >
          Reset
        </button>
        {(result || isBoardFull) && (
          <button
            className="ttt-btn accent"
            onClick={handleReplay}
            aria-label="Replay game"
          >
            Play Again
          </button>
        )}
      </div>
      <footer style={{
        marginTop: "48px",
        color: "#1976d2",
        fontSize: "0.96rem",
        letterSpacing: "0.5px",
        opacity: 0.7,
      }}>
        2-Player | Modern UI | React
      </footer>
    </div>
  );
}

// Game Board
function Board({ squares, onSquareClick, winningLine }) {
  // PUBLIC_INTERFACE
  return (
    <div
      className="ttt-board"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 72px)",
        gridTemplateRows: "repeat(3, 72px)",
        gap: "8px",
        background: "#1976d2",
        padding: "10px",
        borderRadius: "18px",
        boxShadow: "0 4px 24px rgba(25,118,210,0.06)",
      }}
    >
      {[...Array(9)].map((_, idx) => (
        <Square
          key={idx}
          value={squares[idx]}
          onClick={() => onSquareClick(idx)}
          highlight={
            winningLine && Array.isArray(winningLine)
              ? winningLine.includes(idx)
              : false
          }
        />
      ))}
    </div>
  );
}

// Individual Square
function Square({ value, onClick, highlight }) {
  // PUBLIC_INTERFACE
  return (
    <button
      className="ttt-square"
      onClick={onClick}
      style={{
        width: "72px",
        height: "72px",
        background: highlight ? "#ffd600" : "#fff",
        color: highlight ? "#1976d2" : value === "X" ? "#1976d2" : "#444",
        fontSize: "2.7rem",
        fontWeight: "700",
        border: "2.5px solid #1976d2",
        borderRadius: "12px",
        cursor: value || highlight !== undefined ? "default" : "pointer",
        transition: "background 0.2s, color 0.2s",
        boxShadow: highlight ? "0 2px 16px rgba(255,214,0,0.16)" : "none"
      }}
      aria-label={value ? `Filled with ${value}` : "Empty square"}
      tabIndex={0}
      disabled={Boolean(value) || highlight !== undefined}
    >
      {value}
    </button>
  );
}

export default App;
