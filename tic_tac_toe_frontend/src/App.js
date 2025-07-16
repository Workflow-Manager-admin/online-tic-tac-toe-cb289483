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
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diagonals
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

// Simple AI move: pick a random available square.
// For extra challenge, you could extend this to a Minimax algorithm.
function getAIMove(squares) {
  // Find all empty squares
  const emptyIndices = squares
    .map((val, idx) => (val ? null : idx))
    .filter((x) => x !== null);
  // Randomly select one
  if (emptyIndices.length === 0) return null;
  return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
}

/**
 * PUBLIC_INTERFACE
 * The main App component. Now supports 2-player or player vs AI modes.
 */
function App() {
  // 'X' always starts
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [step, setStep] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);
  const [gameMode, setGameMode] = useState("HUMAN"); // "HUMAN" or "AI"
  const [aiPlayer, setAIPlayer] = useState("O"); // The piece that is controlled by AI in vs-AI mode
  const [aiThinking, setAIThinking] = useState(false);

  const currentSquares = history[step];
  const result = calculateWinner(currentSquares);
  const isBoardFull = currentSquares.every(Boolean);

  // When it's the AI's turn, make the AI move with a delay
  useEffect(() => {
    if (
      gameMode === "AI" &&
      !result &&
      !isBoardFull &&
      ((aiPlayer === "X" && xIsNext) || (aiPlayer === "O" && !xIsNext))
    ) {
      // Simulate AI 'thinking' with a small delay
      setAIThinking(true);
      const aiTimeout = setTimeout(() => {
        const aiMove = getAIMove(currentSquares);
        if (aiMove !== null) {
          handleSquareClick(aiMove, true);
        }
        setAIThinking(false);
      }, 650);
      return () => clearTimeout(aiTimeout);
      // eslint-disable-next-line
    }
    // eslint-disable-next-line
  }, [xIsNext, gameMode, aiPlayer, result, isBoardFull, currentSquares]);

  // PUBLIC_INTERFACE
  function handleSquareClick(i, isAI = false) {
    // In AI mode: only allow click for the current user's turn 
    // Not AI turn, not allowed to click for AI's player.
    if (
      (gameMode === "AI") &&
      ((xIsNext && aiPlayer === "X" && !isAI) || (!xIsNext && aiPlayer === "O" && !isAI))
    ) {
      return;
    }
    if (currentSquares[i] || result || aiThinking) return; // Ignore click if filled or game over or AI is thinking
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
    setAIThinking(false);
  }

  // PUBLIC_INTERFACE
  function handleReplay() {
    handleReset();
  }

  // PUBLIC_INTERFACE
  // Start a new game mode (resets board)
  function handleChangeMode(mode) {
    handleReset();
    setGameMode(mode);
    // Default: if entering AI mode, AI is "O" (user goes first as "X")
    setAIPlayer("O");
  }

  // PUBLIC_INTERFACE
  // If in AI mode, allow swapping who is X (and goes first)
  function handleSwapAIPlayer() {
    setAIPlayer((p) => (p === "X" ? "O" : "X"));
    handleReset();
  }

  let status;
  if (result) {
    status = (
      <span style={{ color: `#ffd600` }}>
        Winner: <b>{result.winner === aiPlayer && gameMode === "AI" ? "AI" : result.winner}</b>
      </span>
    );
  } else if (isBoardFull) {
    status = (
      <span style={{ color: `#ffd600` }}>
        It's a <b>draw</b>!
      </span>
    );
  } else if (aiThinking) {
    status = (
      <span style={{ color: "#155bb2" }}>
        AI is thinking...
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
          {(gameMode === "AI" && ((xIsNext && aiPlayer === "X") || (!xIsNext && aiPlayer === "O"))) 
            ? "AI" 
            : (xIsNext ? "X" : "O")}
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
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
        gap: 6
      }}>
        <GameModeSelector
          gameMode={gameMode}
          onChange={handleChangeMode}
        />
        {gameMode === "AI" && (
          <span style={{marginLeft: 16, fontSize: "1rem"}}>
            <button 
              className="ttt-btn accent"
              style={{
                marginLeft: 0,
                padding: "8px 14px", 
                fontSize: "1.03rem"
              }}
              onClick={handleSwapAIPlayer}
              disabled={step !== 0}
              aria-label="Swap AI Player"
              title="Swap AI starting piece (X or O)"
            >
              AI: {aiPlayer}
            </button>
            {step !== 0 && (
              <span style={{fontSize: "0.95rem", color: "#888", marginLeft: 8}}>
                (swap only on new game)
              </span>
            )}
          </span>
        )}
      </div>
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
        aiThinking={aiThinking}
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
        {gameMode === "HUMAN"
          ? "2-Player | Modern UI | React"
          : "Player vs AI | Modern UI | React"}
      </footer>
    </div>
  );
}

// Mode selector component
function GameModeSelector({ gameMode, onChange }) {
  // PUBLIC_INTERFACE
  return (
    <div style={{marginBottom: 2}}>
      <button
        className={`ttt-btn${gameMode === "HUMAN" ? "" : " accent"}`}
        onClick={() => onChange("HUMAN")}
        disabled={gameMode === "HUMAN"}
        style={{
          marginRight: "6px",
          ...(gameMode === "HUMAN" ? { opacity: 1 } : {opacity: 0.64})
        }}
        aria-label="2 Player Mode"
      >
        2 Player
      </button>
      <button
        className={`ttt-btn accent${gameMode === "AI" ? "" : ""}`}
        style={{marginLeft: 0, opacity: (gameMode === "AI" ? 1 : 0.64)}}
        onClick={() => onChange("AI")}
        disabled={gameMode === "AI"}
        aria-label="Play vs AI"
      >
        vs AI
      </button>
    </div>
  );
}

// Game Board
function Board({ squares, onSquareClick, winningLine, aiThinking }) {
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
          disabled={aiThinking}
        />
      ))}
    </div>
  );
}

// Individual Square
function Square({ value, onClick, highlight, disabled }) {
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
        cursor: value || highlight !== undefined || disabled ? "default" : "pointer",
        transition: "background 0.2s, color 0.2s",
        boxShadow: highlight ? "0 2px 16px rgba(255,214,0,0.16)" : "none"
      }}
      aria-label={value ? `Filled with ${value}` : "Empty square"}
      tabIndex={0}
      disabled={Boolean(value) || highlight !== undefined || disabled}
    >
      {value}
    </button>
  );
}

export default App;
