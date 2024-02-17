"use client"

import React, { useState } from "react"
import { DndProvider, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

import DraggableBox from "./DraggableBox"

const Canvas: React.FC = () => {
  // Initial position for the draggable box
  const [boxPosition, setBoxPosition] = useState({
    id: "box1",
    left: 100,
    top: 100,
  })

  const [, drop] = useDrop(() => ({
    accept: "box",
    drop(item: { id: string; left: number; top: number }, monitor) {
      const delta = monitor.getDifferenceFromInitialOffset()
      if (delta) {
        const left = Math.round(item.left + delta.x)
        const top = Math.round(item.top + delta.y)
        setBoxPosition({ ...boxPosition, left, top })
      }
    },
  }))

  return (
    <div ref={drop} className="h-screen w-screen">
      <DraggableBox
        id={boxPosition.id}
        left={boxPosition.left}
        top={boxPosition.top}
      />
    </div>
  )
}

export default Canvas
