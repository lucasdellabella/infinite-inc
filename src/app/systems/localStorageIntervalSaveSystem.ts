import { EntitiesPayload } from "../App";
import { SystemArgs } from "./utils";

const localStorageIntervalSaveSystem = () => {
  const TEN_SECONDS = 10000;
  let timeSinceLastSave: number = 0;

  return (entities: EntitiesPayload, { time }: SystemArgs<any>) => {
    timeSinceLastSave += time.delta;
    if (timeSinceLastSave > TEN_SECONDS) {
      console.log("saving")
      const gameState = entities.gameObjects?.nodes?.filter(e => e.serialize).map((e) => {
        return e.serialize();
      });
      localStorage.setItem("gameState", JSON.stringify(gameState || []));
      timeSinceLastSave = 0;
    }

    return entities;
  };
};

export default localStorageIntervalSaveSystem();
