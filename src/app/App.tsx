import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { randInt } from "@/utils/rand";
import { GameEngine } from "../gameEngine";
import "../index.css";

import Nodes from "./renderers/Nodes";
import { handleDrag } from "./systems/handleDrag";

import {
  createCow,
  createFarmer,
  createFire,
  createTractor,
  deserializeGameObject,
} from "./gameObjectConstructors";
import initialData from "./initialData";
import { handleDisappears } from "./systems/handleDisappear";
import { handleEmits } from "./systems/handleEmits";
import handleMovementPattern from "./systems/handleMovementPattern";
import handleOutOfBounds from "./systems/handleOutOfBounds";
import handleVelocity from "./systems/handleVelocity";
import localStorageIntervalSaveSystem from "./systems/localStorageIntervalSaveSystem";
import { Time } from "./systems/utils";
import { TrashIcon } from "lucide-react";
import { handleActive } from "./systems/handleActive";
import { WrenchIcon } from "lucide-react";
import { handleAoePattern } from "./systems/handleAoePattern";

export type MovementPatternComponent = {
  name: "durdle" | "snake_upwards" | "farmer__back_and_forth" | "meander";
  update: (time: Time, entity: GameObject) => void;
  getState: () => object;
  setState: (data: object) => void;
};

export type VelocityComponent = {
  vx: number;
  vy: number;
};

export type EmitsComponent = {
  frequencyMs: number;
  timeLeftMs?: number;
  object: string;
};

export type DisappearsComponent = {
  timeLeftMs: number;
};

export type DraggableComponent = { isBeingDragged: boolean };

export type PositionComponent = { x: number; y: number };

export type IsActiveComponent = boolean;

export type IsCombiningComponent = boolean;

export type AoePatternComponent = {
  name: "conveyor";
  applyEffect: (node: GameObject) => void;
  removeEffect?: (node: GameObject) => void;
};

export interface ComponentDictionary {
  position?: PositionComponent;
  draggable?: DraggableComponent;
  movementPattern?: MovementPatternComponent;
  velocity?: VelocityComponent;
  emits?: EmitsComponent[];
  disappears?: DisappearsComponent;
  isActive?: IsActiveComponent;
  isCombining?: IsCombiningComponent;
  aoePattern?: AoePatternComponent;
}

export interface GameObject extends ComponentDictionary {
  id: string;
  name: string;
  emoji: string;
  serialize: () => string;
  identifier: string;
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
    async function c() {
      const rawState = localStorage.getItem("gameState");
      if (rawState) {
        const gameState = rawState ? JSON.parse(rawState) : null;
        const entities: GameObject[] = await Promise.all(
          gameState.map(deserializeGameObject)
        );
        nodes.length = 0;
        entities.forEach((e) => nodes.push(e));
      }
    }
    c();
  }, [nodes]);

  return (
    <GameEngine
      style={{
        width: "100vw",
        height: "100vh",
        position: "absolute",
        overflow: "hidden",
        left: 0,
        top: 0,
      }}
      systems={[
        handleActive,
        handleDrag,
        handleEmits,
        handleVelocity,
        handleMovementPattern,
        handleDisappears,
        handleOutOfBounds,
        handleAoePattern,
        localStorageIntervalSaveSystem,
      ]}
      entities={{
        gameObjects: { nodes: nodes, renderer: Nodes },
      }}
      className="relative bg-blue-50"
    >
      <div className="absolute items-center bottom-2 left-2 flex space-x-2">
        <Button
          size="lg"
          onClick={async () => {
            nodes.push(
              await createFire({
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
          onClick={async () => {
            nodes.push(
              await createCow({
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
          onClick={async () => {
            nodes.push(
              await createFarmer({
                x: randInt(50, screen.width - 200),
                y: randInt(50, screen.height - 400),
              })
            );
          }}
        >
          Add <span className="text-xl ml-2">👩‍🌾</span>
        </Button>
        <Button
          className="border"
          size="lg"
          onClick={async () => {
            nodes.push(
              await createTractor({
                x: randInt(50, screen.width - 200),
                y: randInt(50, screen.height - 400),
              })
            );
          }}
        >
          Add <span className="text-xl ml-2">🚜</span>
        </Button>
        <Button
          className="border"
          size="lg"
          onClick={() => {
            nodes.length = 0;
          }}
        >
          Wipe board
          <TrashIcon className="ml-2 w-5 h-5" />
        </Button>
        {process.env.NODE_ENV === "development" && (
          <Button disabled className="border bg-red-500" size="lg">
            Development mode
            <WrenchIcon className="ml-2 w-5 h-5" />
          </Button>
        )}
      </div>
    </GameEngine>
  );
}

export default App;
