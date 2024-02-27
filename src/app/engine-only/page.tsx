"use client"

import { useState } from "react"
import { GameEngine } from "react-game-engine"
import { v4 as uuidv4 } from "uuid"

import { Button } from "@/components/ui/button"

import Nodes from "./renderers/Nodes"
import { MoveBox } from "./systems/moveNodes"

interface Node {
  x: number
  y: number
  id: string
}

export interface EntitiesPayload {
  gameObjects: { nodes: Node[]; renderer: JSX.Element }
}

const CollisionDetectionFlow = () => {
  const [nodes] = useState<Node[]>([])
  return (
    <GameEngine
      style={{
        width: "100vw",
        height: "100vh",
      }}
      systems={[MoveBox]}
      entities={{
        gameObjects: { nodes: nodes, renderer: Nodes },
      }}
      className="relative bg-blue-50"
    >
      <Button
        className="absolute bottom-2 left-2"
        onClick={() => {
          nodes.push({
            x: 0,
            y: Math.random() * 500,
            id: uuidv4(),
          })
        }}
      >
        Add Node
      </Button>
    </GameEngine>
  )
}

export default CollisionDetectionFlow
