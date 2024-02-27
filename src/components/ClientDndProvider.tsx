"use client"

import { ReactNode } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

const ClientDndProvider = ({ children }: { children: ReactNode }) => {
  return <DndProvider backend={HTML5Backend}>{children}</DndProvider>
}

export default ClientDndProvider