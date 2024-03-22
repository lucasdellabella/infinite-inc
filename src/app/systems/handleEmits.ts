import { EntitiesPayload, GameObject } from "../App";
import {
  createDefaultGameObject,
  createTractor,
} from "../gameObjectConstructors";
import { SystemArgs } from "./utils";

const getRandomPosition = (baseX = 200, baseY = 200) => ({
  x: baseX + Math.random() * 10,
  y: baseY + Math.random() * 20,
});

export const handleEmits =  (
  entities: EntitiesPayload,
  { time }: SystemArgs<any>
) => {
  entities.gameObjects?.nodes?.forEach((node) => {
    const { emits, isActive } = node;
    if (!emits || !isActive) return;

    emits.timeLeft -= time.delta;
    if (emits.timeLeft <= 0) {
      const { period, emittedObjectName } = emits;
      const { position } = node;
      const emitPosition = getRandomPosition(position?.x, position?.y);
      const pushGameObjectIfExists = (newObject: GameObject) => {
        if (newObject) {
          entities.gameObjects?.nodes?.push(newObject);
        }
      };
      if (emittedObjectName === "tractor") {
        createTractor(emitPosition).then(pushGameObjectIfExists);
      } else {
        createDefaultGameObject(emittedObjectName, emitPosition).then(
          pushGameObjectIfExists
        );
      }
      

      emits.timeLeft = period;
    }
  });

  return entities;
};
