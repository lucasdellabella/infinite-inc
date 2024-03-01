import { GameObject } from "@/app/App";
import { Time } from "../utils";

interface State {
  previousVelocity: { vx: number; vy: number } | undefined;
  distanceTraveled: number;
  unmovingDuration: number;
}

const durdle = () => {
  const TRAVEL_DISTANCE = 60;
  let state: State = {
    previousVelocity: undefined,
    distanceTraveled: 0,
    unmovingDuration: 0,
  };

  return {
    name: "durdle" as const,
    // type assertion to object so we don't have to figure out TS stuff
    getState: () => state as object,
    setState: (newState: object) => (state = { ...newState } as State),
    update: (time: Time, entity: GameObject) => {
      const percentOfASecond = time.delta / 1000;
      if (entity.velocity) {
        if (state.distanceTraveled < TRAVEL_DISTANCE) {
          state.previousVelocity = { ...entity.velocity };
          state.distanceTraveled += Math.abs(
            entity.velocity.vx * percentOfASecond
          );
        } else {
          state.unmovingDuration += time.delta;
          entity.velocity.vx = 0;
          if (state.unmovingDuration > 2500) {
            state.distanceTraveled = 0;
            state.unmovingDuration = 0;
            entity.velocity.vx = state.previousVelocity!.vx * -1;
          }
        }
      }
    },
  };
};

export default durdle;
