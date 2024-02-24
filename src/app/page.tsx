import React from "react"

import Flow from "./Flow"

const Home: React.FC = () => {
  // Initial position for the draggable box
  const boxPosition = { id: "box1", left: 100, top: 100 }

  return (
    <main className="flex h-screen items-center justify-center">
      <Flow />
      {/* <ReactDndCanvas /> */}
    </main>
  )
}

export default Home
