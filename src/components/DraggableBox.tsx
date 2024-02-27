// DraggableBox.tsx

import React from "react"
import { useDrag } from "react-dnd"

interface BoxProps {
  id: any
  left: number
  top: number
}

const DraggableBox: React.FC<BoxProps> = ({ id, left, top }) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "box",
      item: { id, left, top },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    [id, left, top]
  )

  // Using TailwindCSS for styling
  return (
    <div
      ref={drag}
      className={`w-fit cursor-pointer rounded-md border border-slate-300 px-3 py-2 ${isDragging ? "opacity-0" : "opacity-100"} hover:bg-gradient-to-t hover:from-slate-700 hover:to-transparent`}
      style={{ transform: `translate(${left}px, ${top}px)` }}
    >
      <span className="mr-2">🐉</span>Dragon
    </div>
  )
}

export default DraggableBox