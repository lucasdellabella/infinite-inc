"use client"

import { ChangeEvent, useEffect, useState } from "react"

import { prompt } from "@/app/actions"

export default function PromptV2({ supabase, setCombos }) {
  const [name1, setName1] = useState<string>("Man")
  const [name2, setName2] = useState<string>("Tree")

  const [response, setReponse] = useState<string>("")

  const onClickPrompt = async (e: MouseEvent) => {
    e.preventDefault()
    console.log("Sending message to replicate")
    const res = name1 && name2 ? await prompt(name1, name2) : ""
    setReponse(res)
    const queryRes = await supabase?.from("combos").select()
    if (queryRes && queryRes.data) {
      setCombos(queryRes.data)
    }
  }

  return (
    <div className="p-8">
      <h1>This is prompt v2</h1>
      <div>
        <form>
          <span>
            <input
              value={name1}
              onChange={(e) => setName1(e.target.value)}
              className="border-2 border-solid border-indigo-600"
              type="text"
            ></input>
            {" + "}
            <input
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              className="border-2 border-solid border-indigo-600"
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
