"use client"

import { ChangeEvent, useState } from "react"

import prompt from "../actions"

export default function Prompt() {
  const [message, setMesssage] = useState<string>(
    "{Krusty Crab} combines {burger}"
  )

  const [response, setReponse] = useState<string>("")

  const onClickPrompt = async () => {
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
      <div>{JSON.stringify(response)}</div>
    </div>
  )
}
