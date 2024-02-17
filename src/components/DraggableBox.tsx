// DraggableBox.tsx

import React from "react"
import { useDrag } from "react-dnd"

interface BoxProps {
  id: any
  left: number
  top: number
}

const DraggableBox: React.FC<BoxProps> = ({ id, left, top }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "box",
    item: { id, left, top },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  // Using TailwindCSS for styling
  return (
    <div
      ref={drag}
      className={`w-fit cursor-pointer border border-slate-300 px-3 py-2 ${isDragging ? "opacity-0" : "opacity-100"}`}
      style={{ position: "absolute", left, top }}
    >
      <span className="mr-2">🐉</span>Dragon
    </div>
  )
}

export default DraggableBox
