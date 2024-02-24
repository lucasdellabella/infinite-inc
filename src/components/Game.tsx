"use client"

import { useState } from "react"
import { createClient } from "@/util/supabase/client"

import { prompt } from "@/app/actions"

export default function GameV1() {
  const supabase = createClient()
  const [board, setBoard] = useState<[string, string, string | null][]>([])
  const [inventory, setInventory] = useState<string[]>([])

  const [input1, setInput1] = useState<string>("")
  const [input2, setInput2] = useState<string>("")

  const onClickPrompt = async (e: MouseEvent) => {
    const hashFn = (n1: string, n2: string) => {
      const [name1, name2] = [n1, n2].sort()
      return `and(name1.eq.${name1},name2.eq.${name2})`
    }

    const filter = board
      .map(([n1, n2]) => hashFn(n1, n2))
      .filter((x) => x)
      .join(",")

    const { data: existingCombos } =
      (await supabase
        ?.from("combos")
        .select("name1,name2,res_name1")
        .or(filter)) || {}

    const comboMap = new Map(
      existingCombos?.map(({ name1, name2, res_name1 }) => {
        return name1 && name2 ? [hashFn(name1, name2), res_name1] : ["", null]
      }) || []
    )

    const newBoard = await Promise.all(
      board.map(async (b): Promise<[string, string, string | null]> => {
        const [n1, n2, r1] = b
        if (r1) return b
        const h = hashFn(n1, n2)
        const existingRes = comboMap.get(h) || null

        if (existingRes) return [n1, n2, existingRes]
        else {
          const newRes = await prompt(n1, n2)
          console.log(newRes)
          const [, , match] = newRes.split("|")
          return [n1, n2, match?.toString() || null]
        }
      })
    )
    setBoard(newBoard)
  }
  const onClickAdd = async (e: MouseEvent) => {
    if (input1 && input2) {
      setBoard([...board, [input1, input2, null]])
      setInput1("")
      setInput2("")
    }
  }
  const onClickRemove = async (e: MouseEvent) => {
    const [s1, s2] = [input1, input2].sort()
    const newBoard = board.filter(
      ([name1, name2]) => name1 !== s1 || name2 !== s2
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
        <h1>Board</h1>
        {JSON.stringify(board)}
        <br />
        {" -----"}
        <br />
        <h1>Inventory</h1>
        {JSON.stringify(inventory)}
      </div>
      <button
        className="rounded-md bg-purple-500 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-600"
        onClick={onClickPrompt}
      >
        Tick
      </button>
    </div>
  )
}
