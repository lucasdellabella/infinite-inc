import { useState } from "react";
import { GameEngine } from "../gameEngine";
import { v4 as uuidv4 } from "uuid";
import "../index.css";

import { Button } from "@/components/ui/button";

import Nodes from "./renderers/Nodes";
import { handleDrag } from "./systems/handleDrag";
import { moveNodes } from "./systems/moveNodes";

interface Node {
  x: number;
  y: number;
  id: string;
  isBeingDragged?: boolean;
}

interface ComponentDictionary {
  position?: { x: number; y: number };
  draggable?: { isBeingDragged: boolean };
}

export interface GameObject extends ComponentDictionary {
  id: string;
  name: string;
}

export interface EntitiesPayload {
  gameObjects: { nodes: GameObject[]; renderer: JSX.Element };
}

function App() {
  const [nodes] = useState<GameObject[]>([]);
  return (
    <GameEngine
      style={{
        width: "100vw",
        height: "100vh",
      }}
      systems={[moveNodes, handleDrag]}
      entities={{
        gameObjects: { nodes: nodes, renderer: Nodes },
      }}
      className="relative bg-blue-50"
    >
      <Button
        className="border absolute bottom-2 left-2"
        onClick={() => {
          nodes.push({
            name: "TEST",
            id: uuidv4(),
            position: {
              x: 0,
              y: Math.random() * 500,
            },
            draggable: {
              isBeingDragged: false,
            },
          });
        }}
      >
        Add Node
      </Button>
    </GameEngine>
  );
}

export default App;
