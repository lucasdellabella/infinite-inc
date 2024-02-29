import { GameObject } from "@/app/App";
import { Time } from "../utils";

const durdle = () => {
  const TRAVEL_DISTANCE = 60;
  let previousVelocity: { vx: number; vy: number };
  let distanceTraveled = 0;
  let unmovingDuration = 0;

  return {
    name: "durdle" as const,
    update: (time: Time, entity: GameObject) => {
      const percentOfASecond = time.delta / 1000;
      if (entity.velocity) {
        if (distanceTraveled < TRAVEL_DISTANCE) {
          previousVelocity = { ...entity.velocity };
          distanceTraveled += Math.abs(entity.velocity.vx * percentOfASecond);
        } else {
          unmovingDuration += time.delta;
          entity.velocity.vx = 0;
          if (unmovingDuration > 2500) {
            distanceTraveled = 0;
            unmovingDuration = 0;
            entity.velocity.vx = previousVelocity.vx * -1;
          }
        }
      }
    },
  };
};

export default durdle;
