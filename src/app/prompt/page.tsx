"use client"

import { ChangeEvent, useEffect, useState } from "react"
import { createClient } from "@/util/supabase/client"

import prompt from "../actions"

interface Combo {
  count1: number | null
  count2: number | null
  count3: number | null
  count4: number | null
  created_at: string
  id: number
  name1: string | null
  name2: string | null
  name3: string | null
  name4: string | null
  res_count1: number | null
  res_count2: number | null
  res_name1: string | null
  res_name2: string | null
}

export default function Prompt() {
  const supabase = createClient()

  const [combos, setCombos] = useState<Combo[]>([])

  useEffect(() => {
    async function something() {
      const queryRes = await supabase?.from("combos").select()
      if (queryRes && queryRes.data) {
        setCombos(queryRes.data)
      }
    }
    something()
  }, [supabase])

  const [message, setMesssage] = useState<string>(
    "{Krusty Krab} combines {burger}"
  )

  const [response, setReponse] = useState<string>("")

  const onClickPrompt = async (e: MouseEvent) => {
    e.preventDefault()
    console.log("Sending message to replicate")
    const res = message ? await prompt(message) : ""
    setReponse(res)
  }

  const onChangeMessage = (e: ChangeEvent<HTMLInputElement>) => {
    setMesssage(e.target.value)
  }
  return (
    <div className="p-8">
      <h1>Hello welcome to prompt page</h1>
      <div>
        <form>
          <input
            value={message}
            onChange={onChangeMessage}
            className="w-96 border-2 border-solid border-indigo-600"
            type="text"
          ></input>
          <br />
          <button onClick={onClickPrompt}>Send</button>
        </form>
      </div>
      <div>{response}</div>
      <div>
        <ul>
          {combos.map(({ name1, name2, res_name1 }, i) => {
            return (
              <li key={i}>
                {name1} + {name2} = {res_name1}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
