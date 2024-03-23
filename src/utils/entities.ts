import {  EntitiesPayload, GameObject } from "@/app/App";

export function dropEntityById(entities: EntitiesPayload, targetId: string) {
  const index = entities.gameObjects?.nodes?.findIndex(
    ({ id }) => targetId === id
  );
  entities.gameObjects?.nodes?.splice(index, 1);
}
export type Counts = { [key: string]: number };
export function countGameObjects(gameObjects: GameObject[]): {
  [key: string]: number;
} {
  return gameObjects.reduce(
    (acc: { [key: string]: number }, cur: GameObject) => {
      acc[cur.name] = (acc[cur.name] || 0) + 1;
      return acc;
    },
    {} as { [key: string]: number }
  );
}

const MAX_COUNT = 10;

export function safePush(
  gameObjects: GameObject[],
  counts: Counts,
  newGameObject: GameObject
) {
  const { identifier } = newGameObject;
  console.log(gameObjects, counts, newGameObject)
  if (counts[identifier] && counts[identifier] >= MAX_COUNT) return;
  else {
    counts[identifier] = (counts[identifier] || 0) + 1;
    gameObjects.push(newGameObject);
  }
}
