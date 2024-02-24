"use client"

import { useEffect, useState } from "react"
import { Combo } from "@/types"
import { createClient } from "@/util/supabase/client"

import PromptV1 from "@/components/PromptV1"
import PromptV2 from "@/components/PromptV2"

export default function Prompt() {
  const supabase = createClient()

  const [combos, setCombos] = useState<Combo[]>([])

  useEffect(() => {
    async function something() {
      const queryRes = await supabase?.from("combos").select().order("name1")
      if (queryRes && queryRes.data) {
        setCombos(queryRes.data)
      }
    }
    something()
  }, [supabase])

  return (
    <div className="p-8">
      <PromptV2 supabase={supabase} setCombos={setCombos}></PromptV2>
      <br />
      <PromptV1 supabase={supabase} setCombos={setCombos} />

      <div className="border-2 border-solid">
        <ul>
          {combos.map(({ name1, name2, name3, name4, res_name1 }, i) => {
            return (
              <li key={i}>
                {`${[name1, name2, name3, name4]
                  .filter((x) => x)
                  .join(" + ")} = ${res_name1}`}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
