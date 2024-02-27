"use client"

import React, { useState } from "react"
import { useDrop } from "react-dnd"

import DraggableBox from "./DraggableBox"

const Canvas: React.FC = () => {
  // Initial position for the draggable box
  const [boxPosition, setBoxPosition] = useState({
    id: "box",
    left: 100,
    top: 100,
  })

  const [, drop] = useDrop(
    () => ({
      accept: "box",
      drop(item: { id: string; left: number; top: number }, monitor) {
        const delta = monitor.getDifferenceFromInitialOffset()
        if (delta) {
          console.log("item", item)
          console.log("delta", delta)
          const left = Math.round(item.left + delta.x)
          const top = Math.round(item.top + delta.y)
          setBoxPosition({ ...boxPosition, left, top })
          return undefined
        }
      },
    }),
    [boxPosition, setBoxPosition]
  )

  return (
    <div id="dropzone" ref={drop} className="h-screen w-screen">
      <DraggableBox
        id={boxPosition.id}
        left={boxPosition.left}
        top={boxPosition.top}
      />
    </div>
  )
}

export default Canvas