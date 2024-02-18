"use client"

import { ChangeEvent, useEffect, useState } from "react"
import { createClient } from "@/util/supabase/client"

import { prompt1 } from "@/app/actions"

export default function PromptV1({ supabase, setCombos }) {
  const [message, setMesssage] = useState<string>(
    "{Krusty Krab} combines {burger}"
  )

  const [response, setReponse] = useState<string>("")

  const onClickPrompt = async (e: MouseEvent) => {
    e.preventDefault()
    console.log("Sending message to replicate")
    const res = message ? await prompt1(message) : ""
    setReponse(res)
    const queryRes = await supabase?.from("combos").select()
    if (queryRes && queryRes.data) {
      setCombos(queryRes.data)
    }
  }

  const onChangeMessage = (e: ChangeEvent<HTMLInputElement>) => {
    setMesssage(e.target.value)
  }
  return (
    <div className="p-8">
      <h1>This is prompt v1</h1>
      <div>
        <form>
          <span>
            <input
              value={message}
              onChange={onChangeMessage}
              className="w-96 border-2 border-solid border-indigo-600"
              type="text"
            ></input>{" "}
            <button
              className="rounded-md bg-cyan-500 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-600"
              onClick={onClickPrompt}
            >
              Send
            </button>{" "}
            <div>{response}</div>
          </span>
          <br />
        </form>
      </div>
    </div>
  )
}
