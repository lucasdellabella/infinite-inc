"use client"


import { prompt } from "@/app/actions"

import { capitalizeWords } from "./str"
import { createClient, dbNormalizeStr } from "./supabase/client"

export type Board = [string, string, string | null][]
const supabase = createClient()

export async function tick(
  board: Board,
  setBoard: (b: Board) => void,
  inventory: Map<string, number>,
  setInventory: (i: Map<string, number>) => void
) {
  if (!board || board.length === 0) return
  const hashFn = (n1: string, n2: string) => {
    const [name1, name2] = [n1, n2].map(dbNormalizeStr).sort()
    return `and(name1.eq.${name1},name2.eq.${name2})`
  }

  const filterRaw = board.map(([n1, n2]) => hashFn(n1, n2)).filter((x) => x)

  const filter = Array.from(new Set(filterRaw)).sort().join(",")

  const getExistingCombos = async (f: string) =>
    await supabase?.from("combos").select("name1,name2,res_name1").or(f)

  const { data: existingCombos } = (await getExistingCombos(filter)) || {}

  const comboMap = new Map(
    existingCombos?.map(({ name1, name2, res_name1 }) => {
      return name1 && name2
        ? [
            hashFn(name1, name2),
            res_name1 ? capitalizeWords(res_name1).replaceAll("_", " ") : null,
          ]
        : ["", null]
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

  const newInventory = new Map(inventory)
  const indexes: number[] = []

  newBoard.forEach(([n1, n2, r1], i) => {
    const updateValue = (n: string, q: number) =>
      newInventory.set(n, (newInventory.get(n) || 0) + q)

    const check = [n1, n2]
      .filter((x) => x !== "Punch")
      .map((n) => {
        if (newInventory.has(n) && (newInventory.get(n) || 0) > 0) {
          updateValue(n, -1)
          return true
        } else {
          indexes.push(i)
          return false
        }
      })
      .every((x) => x === true)
    if (r1 && check) updateValue(r1, 1)
  })
  setInventory(newInventory)
  setBoard(newBoard.filter((_, i) => indexes.indexOf(i) === -1))
}
