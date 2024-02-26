import { EntitiesPayload, MyNodeType } from "./Flow"
import EVENTS, { EventName } from "./tmp_events"

interface InternalEvent {
  type: string
}

type Input =
  | React.MouseEvent<HTMLDivElement>
  | React.TouchEvent<HTMLDivElement>
  | React.KeyboardEvent<HTMLDivElement>

export interface SystemArgs<U> {
  input: { name: EventName; payload: Input }[]
  window: Window
  events: (U | InternalEvent)[]
  dispatch: (e: U | InternalEvent) => void
  defer: (e: U) => void
  time: {
    current: number
    previous: number | null
    delta: number
    previousDelta: number | null
  }
}

export const MoveBox = (
  entities: EntitiesPayload,
  { input }: SystemArgs<any>
) => {
  //-- I'm choosing to update the game state (entities) directly for the sake of brevity and simplicity.
  //-- There's nothing stopping you from treating the game state as immutable and returning a copy..
  //-- Example: return { ...entities, t.id: { UPDATED COMPONENTS }};
  //-- That said, it's probably worth considering performance implications in either case.

  const { payload } = input.find((x) => x.name === "onMouseDown") || {}

  if (payload) {
    console.log(payload)
    const box1 = entities["box1"]

    box1.x = payload.pageX
    box1.y = payload.pageY
  }

  return entities
}

export const MoveNode =
  (setNodes: (nodes: MyNodeType[]) => void) =>
  (entities: EntitiesPayload, { input, time }: SystemArgs<any>) => {
    //-- I'm choosing to update the game state (entities) directly for the sake of brevity and simplicity.
    //-- There's nothing stopping you from treating the game state as immutable and returning a copy..
    //-- Example: return { ...entities, t.id: { UPDATED COMPONENTS }};
    //-- That said, it's probably worth considering performance implications in either case.

    const nodes = entities.nodes

    const isPos = time.current % 10 < 2

    if (isPos) {
      setNodes(
        nodes.map((element) => {
          console.log("pos", element.position)
          element.position.x += 0.5
          return element
        })
      )
    }

    return entities
  }
