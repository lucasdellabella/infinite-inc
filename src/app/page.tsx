"use client"

import React from "react"

import "regenerator-runtime/runtime.js"

import Flow from "./Flow"

const Home: React.FC = () => {
  return (
    <main className="flex h-screen items-center justify-center">
      <Flow />
    </main>
  )
}

export default Home
