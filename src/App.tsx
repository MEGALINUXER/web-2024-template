import { useState, useEffect, useCallback } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';

interface Position { x: number; y: number; }

interface Level {
  maze: number[][];
  player: Position;
  dogs: Position[];
  finish: Position;
}

const LEVELS: Level[] = [
  // 1. Простой уровень
  {
    maze: [
      [1,1,1,1,1,1,1],
      [1,0,0,0,1,0,1],
      [1,0,1,0,1,0,1],
      [1,0,1,0,0,0,1],
      [1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1],
    ],
    player: { x: 1, y: 1 },
    dogs: [{ x: 3, y: 3 }],
    finish: { x: 5, y: 5 },
  },
  // 2. Больше тупиков
  {
    maze: [
      [1,1,1,1,1,1,1],
      [1,0,0,0,1,0,1],
      [1,0,1,0,1,0,1],
      [1,0,1,0,1,0,1],
      [1,0,0,0,1,0,1],
      [1,1,1,0,0,0,1],
      [1,1,1,1,1,1,1],
    ],
    player: { x: 1, y: 1 },
    dogs: [{ x: 4, y: 4 }],
    finish: { x: 5, y: 5 },
  },
  // 3. Большая карта, длинный путь
  {
    maze: [
      [1,1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,0,1],
      [1,0,1,0,1,0,1,0,1],
      [1,0,1,0,0,0,1,0,1],
      [1,0,1,1,1,0,1,0,1],
      [1,0,0,0,1,0,1,0,1],
      [1,1,1,0,1,0,1,0,1],
      [1,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1],
    ],
    player: { x: 1, y: 1 },
    dogs: [{ x: 4, y: 4 }],
    finish: { x: 7, y: 7 },
  },
  // 4. Собака ближе к финишу
  {
    maze: [
      [1,1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,0,1],
      [1,0,1,0,1,0,1,0,1],
      [1,0,1,0,0,0,1,0,1],
      [1,0,1,1,1,1,1,0,1],
      [1,0,0,0,1,0,0,0,1],
      [1,1,1,0,1,0,1,1,1],
      [1,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1],
    ],
    player: { x: 1, y: 1 },
    dogs: [{ x: 7, y: 5 }],
    finish: { x: 7, y: 7 },
  },
  // 5. Два пса, карта 9x9 (упрощённая, проходимая)
  {
    maze: [
      [1,1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,0,1],
      [1,0,1,0,1,0,1,0,1],
      [1,0,1,0,0,0,1,0,1],
      [1,0,1,1,1,0,1,0,1],
      [1,0,0,0,1,0,1,0,1],
      [1,1,1,0,1,0,1,0,1],
      [1,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1],
    ],
    player: { x: 1, y: 1 },
    dogs: [{ x: 7, y: 1 }, { x: 7, y: 7 }],
    finish: { x: 7, y: 7 },
  },
  // 6. Два пса, карта 13x13 (большая, проходимая)
  {
    maze: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,0,1,0,0,0,1],
      [1,0,1,0,1,0,1,0,1,0,1,0,1],
      [1,0,1,0,0,0,1,0,1,0,1,0,1],
      [1,0,1,1,1,0,1,0,1,0,1,0,1],
      [1,0,0,0,1,0,1,0,1,0,1,0,1],
      [1,1,1,0,1,0,1,0,1,0,1,0,1],
      [1,0,0,0,0,0,0,0,1,0,1,0,1],
      [1,1,1,1,1,1,1,0,1,0,1,0,1],
      [1,0,0,0,0,0,1,0,0,0,1,0,1],
      [1,0,1,1,1,1,1,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    player: { x: 1, y: 1 },
    dogs: [{ x: 11, y: 1 }, { x: 11, y: 3 }],
    finish: { x: 11, y: 11 },
  },
  // 7. Два пса, сложная карта 11x11
  {
    maze: [
      [1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,0,1,0,1],
      [1,0,1,0,1,0,1,0,1,0,1],
      [1,0,1,0,0,0,1,0,1,0,1],
      [1,0,1,1,1,0,1,0,1,0,1],
      [1,0,0,0,1,0,1,0,1,0,1],
      [1,1,1,0,1,0,1,0,1,0,1],
      [1,0,0,0,0,0,0,0,1,0,1],
      [1,1,1,1,1,1,1,0,1,0,1],
      [1,0,0,0,0,0,1,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1],
    ],
    player: { x: 1, y: 1 },
    dogs: [{ x: 5, y: 5 }, { x: 9, y: 1 }],
    finish: { x: 9, y: 9 },
  },
  // 8. Новый сложный, но проходимый уровень (три собаки, 13x13)
  {
    maze: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,0,1,0,0,0,1],
      [1,0,1,0,1,0,1,0,1,0,1,0,1],
      [1,0,1,0,0,0,1,0,1,0,1,0,1],
      [1,0,1,1,1,0,1,0,1,0,1,0,1],
      [1,0,0,0,1,0,1,0,1,0,1,0,1],
      [1,1,1,0,1,0,1,0,1,0,1,0,1],
      [1,0,0,0,0,0,0,0,1,0,1,0,1],
      [1,1,1,1,1,1,1,0,1,0,1,0,1],
      [1,0,0,0,0,0,1,0,0,0,1,0,1],
      [1,0,1,1,1,1,1,1,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    player: { x: 1, y: 1 },
    dogs: [{ x: 11, y: 1 }, { x: 11, y: 11 }, { x: 1, y: 11 }],
    finish: { x: 11, y: 7 },
  },
  // 9. Новый уникальный уровень (три собаки, 13x13, петли и тупики)
  {
    maze: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,1,0,0,0,1,0,0,0,0,1],
      [1,1,0,1,0,1,0,1,0,1,1,0,1],
      [1,0,0,0,0,1,0,0,0,1,0,0,1],
      [1,0,1,1,0,1,1,1,0,1,0,1,1],
      [1,0,1,0,0,0,0,1,0,0,0,0,1],
      [1,0,1,0,1,1,0,1,1,1,1,0,1],
      [1,0,0,0,1,0,0,0,0,0,1,0,1],
      [1,1,1,0,1,0,1,1,1,0,1,0,1],
      [1,0,0,0,0,0,1,0,0,0,1,0,1],
      [1,0,1,1,1,1,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    player: { x: 1, y: 1 },
    dogs: [{ x: 11, y: 1 }, { x: 11, y: 11 }, { x: 1, y: 11 }],
    finish: { x: 11, y: 7 },
  },
  // 10. Очень большой и сложный уровень (17x17, 6 собак)
  {
    maze: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
      [1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,1],
      [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1],
      [1,0,1,0,0,0,0,0,1,0,0,0,1,0,1,0,1],
      [1,0,1,0,1,1,1,0,1,1,1,0,1,0,1,0,1],
      [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1],
      [1,1,1,0,1,0,1,1,1,0,1,1,1,0,1,0,1],
      [1,0,0,0,1,0,1,0,0,0,1,0,0,0,1,0,1],
      [1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1],
      [1,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
      [1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],
      [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
      [1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1],
      [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
    player: { x: 1, y: 1 },
    dogs: [
      { x: 15, y: 13 },
      { x: 15, y: 15 },
      { x: 14, y: 15 },
      { x: 13, y: 15 },
      { x: 3, y: 13 },
      { x: 13, y: 3 }
    ],
    finish: { x: 15, y: 8 },
  },
];

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
  const [level, setLevel] = useState(0);
  const [player, setPlayer] = useState<Position>(LEVELS[0].player);
  const [dogs, setDogs] = useState<Position[]>(LEVELS[0].dogs);
  const [win, setWin] = useState(false);
  const [lose, setLose] = useState(false);

  const maze = LEVELS[level].maze;
  const finish = LEVELS[level].finish;

  const canMove = (x: number, y: number) => maze[y]?.[x] === 0;

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
      const newDogs = dogs.map(dog => bfsNextStep(maze, dog, newPlayer));
      setPlayer(newPlayer);
      setDogs(newDogs);
      if (newDogs.some(dog => dog.x === x && dog.y === y)) setLose(true);
      else if (x === finish.x && y === finish.y) setWin(true);
    }
  }, [player, dogs, win, lose, maze, finish]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleReset = () => {
    setPlayer(LEVELS[level].player);
    setDogs(LEVELS[level].dogs);
    setWin(false);
    setLose(false);
  };

  const handleNextLevel = () => {
    if (level < LEVELS.length - 1) {
      setLevel(level + 1);
      setPlayer(LEVELS[level + 1].player);
      setDogs(LEVELS[level + 1].dogs);
      setWin(false);
      setLose(false);
    }
  };

  const gridSize = maze[0].length;

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <Typography variant="h5" gutterBottom>Лабиринт — уровень {level + 1}</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 36px)`,
          gridTemplateRows: `repeat(${gridSize}, 36px)`,
          gap: 0,
          border: '2px solid #333',
        }}
      >
        {maze.map((row, y) =>
          row.map((cell, x) => {
            let content = null;
            if (player.x === x && player.y === y) {
              content = <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: 'primary.main' }} />;
            } else if (dogs.some(dog => dog.x === x && dog.y === y)) {
              content = <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: 'error.main' }} />;
            } else if (finish.x === x && finish.y === y) {
              content = <FlagIcon color="success" fontSize="small" />;
            }
            return (
              <Paper
                key={`${x}-${y}`}
                sx={{
                  width: 36,
                  height: 36,
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
      {win && (level < LEVELS.length - 1) && (
        <>
          <Typography color="success.main" variant="h6">Победа! Следующий уровень?</Typography>
          <Button variant="contained" onClick={handleNextLevel}>Следующий уровень</Button>
        </>
      )}
      {win && level === LEVELS.length - 1 && (
        <Typography color="success.main" variant="h6">Поздравляем! Все уровни пройдены!</Typography>
      )}
      {lose && <Typography color="error.main" variant="h6">Поражение! Собака догнала.</Typography>}
      <Button variant="contained" onClick={handleReset}>Сбросить</Button>
    </Box>
  );
};

export default App;
