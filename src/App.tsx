import { useState, useEffect, useCallback } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';

const MAZE = [
  [1,1,1,1,1,1,1],
  [1,0,0,0,1,0,1],
  [1,0,1,0,1,0,1],
  [1,0,1,0,0,0,1],
  [1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1], // проход снизу
  [1,1,1,1,1,1,1],
];
const CELL_SIZE = 36;
const PLAYER_START = { x: 1, y: 1 };
const DOG_START = { x: 3, y: 3 }; // собака в центре
const FINISH = { x: 5, y: 5 };

interface Position { x: number; y: number; }

function bfsNextStep(maze: number[][], from: Position, to: Position): Position {
  if (from.x === to.x && from.y === to.y) return from;
  const queue: Position[] = [from];
  const visited = Array.from({ length: maze.length }, () => Array(maze[0].length).fill(false));
  const prev: (Position | null)[][] = Array.from({ length: maze.length }, () => Array(maze[0].length).fill(null));
  visited[from.y][from.x] = true;
  const dirs = [
    { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 },
  ];
  while (queue.length) {
    const curr = queue.shift()!;
    for (const dir of dirs) {
      const nx = curr.x + dir.x, ny = curr.y + dir.y;
      if (
        nx >= 0 && ny >= 0 && ny < maze.length && nx < maze[0].length &&
        maze[ny][nx] === 0 && !visited[ny][nx]
      ) {
        visited[ny][nx] = true;
        prev[ny][nx] = curr;
        if (nx === to.x && ny === to.y) {
          let path: Position[] = [];
          let p: Position | null = { x: nx, y: ny };
          while (p && !(p.x === from.x && p.y === from.y)) {
            path.push(p);
            p = prev[p.y][p.x];
          }
          path.reverse();
          return path[0] || from;
        }
        queue.push({ x: nx, y: ny });
      }
    }
  }
  return from;
}

const App = () => {
  const [player, setPlayer] = useState<Position>(PLAYER_START);
  const [dog, setDog] = useState<Position>(DOG_START);
  const [win, setWin] = useState(false);
  const [lose, setLose] = useState(false);

  const canMove = (x: number, y: number) => MAZE[y]?.[x] === 0;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (win || lose) return;
    let { x, y } = player;
    if (e.key === 'ArrowUp') y -= 1;
    else if (e.key === 'ArrowDown') y += 1;
    else if (e.key === 'ArrowLeft') x -= 1;
    else if (e.key === 'ArrowRight') x += 1;
    else return;
    if (canMove(x, y)) {
      const newPlayer = { x, y };
      const newDog = bfsNextStep(MAZE, dog, newPlayer);
      setPlayer(newPlayer);
      setDog(newDog);
      if (newDog.x === x && newDog.y === y) setLose(true);
      else if (x === FINISH.x && y === FINISH.y) setWin(true);
    }
  }, [player, dog, win, lose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleReset = () => {
    setPlayer(PLAYER_START);
    setDog(DOG_START);
    setWin(false);
    setLose(false);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Typography variant="h5" gutterBottom>Мини-лабиринт с собакой</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(7, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
          gap: 0,
          border: '2px solid #333',
        }}
      >
        {MAZE.map((row, y) =>
          row.map((cell, x) => {
            let content = null;
            if (player.x === x && player.y === y) {
              content = <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: 'primary.main' }} />;
            } else if (dog.x === x && dog.y === y) {
              content = <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: 'error.main' }} />;
            } else if (FINISH.x === x && FINISH.y === y) {
              content = <FlagIcon color="success" fontSize="small" />;
            }
            return (
              <Paper
                key={`${x}-${y}`}
                sx={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  bgcolor: cell === 1 ? 'grey.800' : 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                  border: '1px solid #888',
                }}
                elevation={cell === 1 ? 3 : 1}
              >
                {content}
              </Paper>
            );
          })
        )}
      </Box>
      {win && <Typography color="success.main" variant="h6">Победа!</Typography>}
      {lose && <Typography color="error.main" variant="h6">Поражение! Собака догнала.</Typography>}
      <Button variant="contained" onClick={handleReset}>Сбросить</Button>
    </Box>
  );
};

export default App;
