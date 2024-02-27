import { EntitiesPayload } from "../page"
import { SystemArgs } from "./utils"

export const MoveBox = (
  entities: EntitiesPayload,
  { input, time }: SystemArgs<any>
) => {
  entities.gameObjects.nodes.forEach((node) => {
    node.x += time.delta / 2 / 10
  })

  return entities
}
