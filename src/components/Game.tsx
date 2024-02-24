"use client"

import { setInterval } from "timers"
import { useEffect, useState } from "react"
import { Board, tick } from "@/util/game"

export default function GameV1() {
  const [board, setBoard] = useState<Board>([])
  const [ticks, setTicks] = useState<number>(0)

  const [inventory, setInventory] = useState(
    new Map<string, number>([
      ["Punch", 1],
      ["Tree", 1],
    ])
  )

  const [input1, setInput1] = useState<string>("")
  const [input2, setInput2] = useState<string>("")

  const tickle = async () => {
    await tick(board, setBoard, inventory, setInventory)
    setTicks(ticks + 1)
  }

  const onClickAdd = async (e: MouseEvent) => {
    if (input1 && input2 && board.length < 10) {
      setBoard([...board, [input1, input2, null]])
      setInput1("")
      setInput2("")
    }
  }
  const onClickRemove = async (e: MouseEvent) => {
    const newBoard = board.filter(
      ([name1, name2]) => name1 !== input1 || name2 !== input2
    )
    setBoard(newBoard)
    setInput1("")
    setInput2("")
  }

  return (
    <div className="p-8">
      <h1>Quest 1: Try and craft some Antimatter</h1>
      <div>
        <span>
          <input
            value={input1}
            onChange={(e) => setInput1(e.target.value)}
            className="border-2 border-solid border-indigo-600"
            type="text"
          ></input>
          {" + "}
          <input
            value={input2}
            onChange={(e) => setInput2(e.target.value)}
            className="border-2 border-solid border-indigo-600"
            type="text"
          ></input>{" "}
          <button
            className="rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-600"
            onClick={onClickAdd}
          >
            Add
          </button>{" "}
          <button
            className="rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"
            onClick={onClickRemove}
          >
            Remove
          </button>{" "}
        </span>
        <br />
        <h1>Board {board.length}/10</h1>
        {JSON.stringify(board)}
        <br />
        {" -----"}
        <br />
        <h1>Inventory</h1>
        {Array.from(inventory.entries())
          .sort(([, x], [, y]) => y - x)
          .map((x, i) => (
            <li
              onClick={() => (!input1 ? setInput1(x[0]) : setInput2(x[0]))}
              key={i}
            >
              {JSON.stringify(x)}
            </li>
          ))}
      </div>
      <button
        onClick={tickle}
        className="rounded-md bg-purple-500 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-600"
      >
        {ticks} Tick
      </button>
    </div>
  )
}
