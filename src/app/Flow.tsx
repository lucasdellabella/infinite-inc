"use client"

import React, { MouseEvent, useEffect, useRef, useState } from "react"
import ReactFlow, { Node, Panel, useEdgesState, useNodesState } from "reactflow"

import {
  edges as initialEdges,
  nodes as initialNodes,
} from "./initial-elements"

import "reactflow/dist/style.css"
import "./style.css"

import MyNode from "./MyNode"

const panelStyle = {
  fontSize: 12,
  color: "#777",
}

const nodeTypes = {
  "my-node": MyNode,
}

const CollisionDetectionFlow = () => {
  // this ref stores the current dragged node
  const dragRef = useRef(null)

  // target is the node that the node is dragged over
  const [target, setTarget] = useState(null)

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onNodeDragStart = (evt: MouseEvent, node: Node) => {
    dragRef.current = node
  }

  const onNodeDrag = (evt: MouseEvent, node: Node) => {
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

  const onNodeDragStop = (evt: MouseEvent, node: Node) => {
    // on drag stop, we swap the colors of the nodes
    const nodeColor = node.data.label
    const targetColor = target?.data.label
    const newNodes = nodes.filter(
      (n) => ![dragRef?.current?.id, target?.id].includes(n.id)
    )

    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === target?.id) {
          n.data = { ...n.data, color: nodeColor, label: nodeColor }
        }
        if (n.id === node.id && target) {
          n.data = { ...n.data, color: targetColor, label: targetColor }
        }
        return n
      })
    )

    setTarget(null)
    dragRef.current = null
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
    <div className="container">
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
        className="bg-teal-50"
      >
        <Panel position="top-left" style={panelStyle}>
          Drop any node on top of another node to swap their colors
        </Panel>
      </ReactFlow>
    </div>
  )
}

export default CollisionDetectionFlow
