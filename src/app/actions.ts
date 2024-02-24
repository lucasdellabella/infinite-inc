"use server"

import { cookies } from "next/headers"
import { run as openaiRun } from "@/util/openai"
import {
  run as replicateRun,
  superComplicatedNormalization,
} from "@/util/replicate"
import { createClient } from "@/util/supabase/server"

const supabase = createClient(cookies())

export async function prompt(name1: string, name2: string): Promise<string> {
  const prompt = [name1, name2, "?"].join("|")

  const output = await openaiRun(prompt)

  const s = output?.split("|")
  const [res_name1] = s?.slice(Math.max(s.length - 1, 0)) || []

  const r1 = res_name1.replaceAll(" ", "_").replace(/\W/g, "").toLowerCase()

  const [n1, n2] =
    [name1, name2]
      .map((n) => n.replaceAll(" ", "_").replace(/\W/g, "").toLowerCase())
      .sort() || []
  if (supabase) {
    const { error } = await supabase
      ?.from("combos")
      .insert({ name1: n1, name2: n2, res_name1: r1 })
    if (error) {
      console.log("insert failed", error)
    }
  }
  return output || "Not valid combo"
}

export async function prompt1(message: string): Promise<string> {
  const [subject, objects] = message?.split(" combines ") || []

  const ands = objects.split(" and ")

  const [name1, name2, name3, name4] =
    [subject, ...ands]
      ?.map((n) => n.replaceAll(" ", "_"))
      .map((n) => n.replace(/\W/g, ""))
      .sort() || []

  const output = await replicateRun(message)

  const res_name1 = superComplicatedNormalization(output)

  if (supabase) {
    const { error } = await supabase
      ?.from("combos")
      .insert({ name1, name2, name3, name4, res_name1 })
    if (error) {
      console.log("insert failed", error)
    }
  }

  return output
}
