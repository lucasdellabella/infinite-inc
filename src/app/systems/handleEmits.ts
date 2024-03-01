import { EntitiesPayload, GameObject } from "../App";
import {
  createCow,
  createFarmer,
  createFire,
  createMilk,
  createSeed,
} from "../gameObjectConstructors";
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
      const { period, emittedObjectName } = emits;
      const { position } = node;
      const emitPosition = getRandomPosition(position?.x, position?.y);
      let newObject: GameObject | null = null;
      switch (emittedObjectName) {
        case "Seed":
          newObject = createSeed(emitPosition);
          break;
        case "Cow":
          newObject = createCow(emitPosition);
          break;
        case "Farmer":
          newObject = createFarmer(emitPosition);
          break;
        case "Fire":
          newObject = createFire(emitPosition);
          break;
        case "Milk":
          newObject = createMilk(emitPosition);
          break;
        default:
          break;
      }
      if (newObject) {
        entities.gameObjects.nodes.push(newObject);
      }
      emits.timeLeft = period;
    }
  });

  return entities;
};
