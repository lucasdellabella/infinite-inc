import { useState } from "react";

import { Button } from "@/components/ui/button";
import { randInt } from "@/utils/rand";
import { GameEngine } from "../gameEngine";
import "../index.css";

import Nodes from "./renderers/Nodes";
import { handleDrag } from "./systems/handleDrag";

import { handleDisappears } from "./systems/handleDisappear";
import { createCow, createFarmer, createFire } from "./gameObjectConstructors";
import initialData from "./initialData";
import { handleEmits } from "./systems/handleEmits";
import handleMovementPattern from "./systems/handleMovementPattern";
import handleVelocity from "./systems/handleVelocity";
import handleOutOfBounds from "./systems/handleOutOfBounds";
import { Time } from "./systems/utils";

export type MovementPatternComponent = {
  name: "durdle" | "snake_upwards" | "farmer__back_and_forth" | "meander";
  update: (time: Time, entity: GameObject) => void;
};

export type VelocityComponent = {
  vx: number;
  vy: number;
};

export type EmitsComponent = {
  period: number;
  timeLeft: number;
  createGameObject: (position: { x: number; y: number }) => GameObject;
};

export type DisappearsComponent = {
  timeLeft: number;
}

export type DraggableComponent = { isBeingDragged: boolean };

export type PositionComponent = { x: number; y: number };

interface ComponentDictionary {
  position?: PositionComponent;
  draggable?: DraggableComponent;
  movementPattern?: MovementPatternComponent;
  velocity?: VelocityComponent;
  emits?: EmitsComponent;
  disappears?: DisappearsComponent
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
  return (
    <GameEngine
      style={{
        width: "100vw",
        height: "100vh",
        position: "absolute",
        overflow: 'hidden',
        left: 0,
        top: 0,
      }}
      systems={[handleDrag, handleEmits, handleVelocity, handleMovementPattern, handleDisappears, handleOutOfBounds]}
      entities={{
        gameObjects: { nodes: nodes, renderer: Nodes },
      }}
      className="relative bg-blue-50"
    >
      <div className="absolute items-center bottom-2 left-2 flex space-x-2">
        <Button
          size="lg"
          onClick={() => {
            nodes.push(
              createFire({
                x: randInt(50, screen.width - 50),
                y: screen.height * (4 / 5),
              })
            );
          }}
        >
          Add <span className="text-xl ml-2">🔥</span>
        </Button>
        <Button
          className="border"
          size="lg"
          onClick={() => {
            nodes.push(
              createCow({
                x: randInt(50, screen.width - 200),
                y: randInt(50, screen.height - 200),
              })
            );
          }}
        >
          Add <span className="text-xl ml-2">🐮</span>
        </Button>
        <Button
          className="border"
          size="lg"
          onClick={() => {
            nodes.push(
              createFarmer({
                x: randInt(50, screen.width - 200),
                y: randInt(50, screen.height - 400),
              })
            );
          }}
        >
          Add <span className="text-xl ml-2">👩‍🌾</span>
        </Button>
      </div>
    </GameEngine>
  );
}

export default App;
