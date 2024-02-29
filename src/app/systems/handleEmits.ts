import { EntitiesPayload } from "../App";
import { v4 as uuidv4 } from "uuid";
import { SystemArgs } from "./utils";



const getRandomPosition = (baseX = 200, baseY = 200) => ({
  x: baseX + Math.random() * 10,
  y: baseY + Math.random() * 20,
});

export const handleEmits = (
  entities: EntitiesPayload,
  { time }: SystemArgs<any>
) => {
  entities.gameObjects.nodes.forEach((node) => {
    const { emits } = node;
    if (!emits) return;

    emits.timeLeft -= time.delta;
    if (emits.timeLeft <= 0) {
      const {period, createGameObject } = emits;
      const { position } = node;
      const emitPosition = getRandomPosition(position?.x, position?.y);
      entities.gameObjects.nodes.push(
        createGameObject(emitPosition)
      );
      emits.timeLeft = period;
    }
  });

  return entities;
};
