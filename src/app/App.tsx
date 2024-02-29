import { useState, useEffect } from "react";
import { GameEngine } from "../gameEngine";
import { v4 as uuidv4 } from "uuid";
import "../index.css";
import { Button } from "@/components/ui/button";

import Nodes from "./renderers/Nodes";
import { handleDrag } from "./systems/handleDrag";

// interface Node {
//   x: number;
//   y: number;
//   id: string;
//   isBeingDragged?: boolean;
// }
import { handleEmits } from "./systems/handleEmits";
import initialData from "./initialData";
import { combine } from "../lib/httpClient";
import { Time } from "./systems/utils";
import handleMovementPattern from "./systems/handleMovementPattern";
import handleVelocity from "./systems/handleVelocity";
import snakeUpwards from "./systems/movementPattern/snakeUpwards";
import farmerBackAndForth from "./systems/movementPattern/farmerBackAndForth";
import meander from "./systems/movementPattern/meander";

interface ComponentDictionary {
  position?: { x: number; y: number };
  draggable?: { isBeingDragged: boolean };
  movementPattern?: {
    name: "durdle" | "snake_upwards" | "farmer__back_and_forth" | "meander";
    update: (time: Time, entity: GameObject) => void;
  };
  velocity?: {
    vx: number;
    vy: number;
  };
  emits?: {
    period: number;
    timeLeft: number;
    createGameObject: (position: { x: number; y: number }) => GameObject;
  };
}

export interface GameObject extends ComponentDictionary {
  id: string;
  name: string;
  emoji: string;
}

export interface EntitiesPayload {
  gameObjects: {
    nodes: GameObject[];
    renderer: ({ nodes }: { nodes: GameObject[] }) => JSX.Element;
  };
}

function App() {
  const [screen] = useState<{ width: number; height: number }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [nodes] = useState<GameObject[]>(initialData);
  useEffect(() => {
    async function test() {
      await combine("bat", "rat");
    }
    test();
  });
  return (
    <GameEngine
      style={{
        width: "100vw",
        height: "100vh",
      }}
      systems={[handleDrag, handleEmits, handleVelocity, handleMovementPattern]}
      entities={{
        gameObjects: { nodes: nodes, renderer: Nodes },
      }}
      className="relative bg-blue-50"
    >
      <div className="absolute items-center bottom-2 left-2 flex space-x-2">
        <Button
          size="lg"
          onClick={() => {
            nodes.push({
              name: "Fire",
              id: uuidv4(),
              emoji: "🔥",
              position: {
                x: 200 + Math.random() * screen.width - 300,
                y: screen.height * (4 / 5),
              },
              velocity: {
                vx: 10,
                vy: 0,
              },
              draggable: {
                isBeingDragged: false,
              },
              movementPattern: snakeUpwards(),
            });
          }}
        >
          Add <span className="text-xl ml-2">🔥</span>
        </Button>
        <Button
          className="border"
          size="lg"
          onClick={() => {
            nodes.push({
              name: "Cow",
              id: uuidv4(),
              emoji: "🐮",
              position: {
                x: 50 + Math.random() * screen.width - 200,
                y: 50 + Math.random() * screen.height - 200,
              },
              velocity: {
                vx: 10,
                vy: 0,
              },
              draggable: {
                isBeingDragged: false,
              },
              movementPattern: meander(),
              emits: {
                timeLeft: 2000,
                period: 15000,
                createGameObject: (position) => {
                  return {
                    id: uuidv4(),
                    name: "Milk",
                    emoji: "🥛",
                    position,
                    draggable: { isBeingDragged: false },
                  };
                },
              },
            });
          }}
        >
          Add <span className="text-xl ml-2">🐮</span>
        </Button>
        <Button
          className="border"
          size="lg"
          onClick={() => {
            nodes.push({
              name: "Farmer",
              id: uuidv4(),
              emoji: "👩‍🌾",
              position: {
                x: 50 + Math.random() * screen.width - 200,
                y: 50 + Math.random() * screen.height - 400,
              },
              velocity: {
                vx: 10,
                vy: 0,
              },
              draggable: {
                isBeingDragged: false,
              },
              movementPattern: farmerBackAndForth(),
              emits: {
                timeLeft: 0,
                period: 5000,
                createGameObject: (position) => {
                  return {
                    id: uuidv4(),
                    name: "Seed",
                    emoji: "🌱",
                    position,
                    draggable: { isBeingDragged: false },
                  };
                },
              },
            });
          }}
        >
          Add <span className="text-xl ml-2">👩‍🌾</span>
        </Button>
      </div>
    </GameEngine>
  );
}

export default App;
