import React from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

import DraggableBox from "@/components/DraggableBox"
import ReactDndCanvas from "@/components/ReactDndCanvas"

const Home: React.FC = () => {
  // Initial position for the draggable box
  const boxPosition = { id: "box1", left: 100, top: 100 }

  return (
    <main className="flex h-screen items-center justify-center">
      <ReactDndCanvas />
    </main>
  )
}

export default Home
