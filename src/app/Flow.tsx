"use client"

import React, {
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { GameEngine } from "react-game-engine"
import ReactFlow, { Node, Panel, useEdgesState, useNodesState } from "reactflow"
import { v4 as uuidv4 } from "uuid"

import {
  edges as initialEdges,
  nodes as initialNodes,
} from "./initial-elements"

import "reactflow/dist/style.css"
import "./style.css"

import dynamic from "next/dynamic"
import {
  ArchiveRestoreIcon,
  LoaderIcon,
  RefreshCcwDotIcon,
  SaveIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import { prompt, promptEmoji } from "./actions"
import MyNode from "./MyNode"

const MyGameEngine = dynamic(() => GameEngine, {
  ssr: false,
})
const panelStyle = {
  fontSize: 12,
  color: "#777",
}

const flowKey = "example-flow"
const getNodeId = () => uuidv4()

const nodeTypes = {
  "my-node": MyNode,
}

export type MyNodeType = Node<{ label: string; emoji: string }>

const CollisionDetectionFlow = () => {
  // this ref stores the current dragged node
  const dragRef = useRef(null)

  // target is the node that the node is dragged over
  const [target, setTarget] = useState(null)

  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialNodes.map((node) => ({ ...node, id: getNodeId() }))
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const [rfInstance, setRfInstance] = useState(null)

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject()
      localStorage.setItem(flowKey, JSON.stringify(flow))
    }
  }, [rfInstance])

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(flowKey))

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport
        setNodes(flow.nodes || [])
      }
    }

    restoreFlow()
  }, [setNodes])

  const onNodeDragStart = (evt: MouseEvent, node: MyNodeType) => {
    dragRef.current = node
  }

  useEffect(() => {
    onRestore()
  }, [onRestore])

  const onNodeDrag = (evt: MouseEvent, node: MyNodeType) => {
    // calculate the center point of the node from position and dimensions
    const centerX = node.position.x + node.width / 2
    const centerY = node.position.y + node.height / 2

    // find a node where the center point is inside
    const targetNode = nodes.find(
      (n) =>
        centerX > n.position.x &&
        centerX < n.position.x + n.width &&
        centerY > n.position.y &&
        centerY < n.position.y + n.height &&
        n.id !== node.id // this is needed, otherwise we would always find the dragged node
    )

    setTarget(targetNode)
  }

  const combine = async (
    targetData: MyNodeType["data"],
    draggedData: MyNodeType["data"]
  ) => {
    const label = (await prompt(targetData.label, draggedData.label)).split(
      "|"
    )[2]
    console.log(label)
    const emojis = await promptEmoji(label)
    console.log(emojis)

    return {
      label,
      emoji: emojis,
    }
  }

  const onNodeDragStop = async (evt: MouseEvent, node: MyNodeType) => {
    // on drag stop, we swap the colors of the nodes
    const retainedNodes = nodes.filter(
      (n) => ![dragRef?.current?.id, target?.id].includes(n.id)
    )
    const draggedNode = nodes.find((n) => dragRef?.current?.id === n.id)
    const targetNode = nodes.find((n) => target?.id === n.id)

    if (draggedNode && targetNode) {
      const newNode = {
        ...targetNode,
        id: getNodeId(),
        data: await combine(targetNode.data, draggedNode.data),
      }

      setNodes([...retainedNodes, newNode])
    }

    setTarget(null)
    dragRef.current = null
    onSave()
  }

  useEffect(() => {
    // whenever the target changes, we swap the colors temporarily
    // this is just a placeholder, implement your own logic here
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === target?.id) {
          console.log(`${target?.id} is target`)
        } else if (node.id === dragRef.current?.id && target) {
          console.log(`${node.id} is draggable`)
        }
        return node
      })
    )
  }, [target])

  return (
    <div className="container relative p-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        onInit={setRfInstance}
        className="bg-teal-50"
      />
      {typeof window !== "undefined" && (
        <MyGameEngine entities={nodes.map(({ position }) => position)} />
      )}
      <div className="absolute left-2 top-2 space-x-2">
        <Button onClick={onSave}>
          <SaveIcon className="mr-2 h-4 w-4" /> save
        </Button>
        <Button onClick={onRestore}>
          <LoaderIcon className="mr-2 h-4 w-4" /> restore
        </Button>
      </div>
    </div>
  )
}

export default CollisionDetectionFlow
