import { GameObject } from "@/app/App";
import { Time } from "../utils";

const snakeUpwards = () => {
  const radius = 80;
  let angle = 0;

  return {
    name: "snake_upwards" as const,
    update: (time: Time, entity: GameObject) => {
      const percentOfASecond = time.delta / 1000;
      if (entity.velocity) {
        angle += 3 * percentOfASecond;
        entity.velocity.vx = Math.sin(angle) * radius;
        entity.velocity.vy = -100;
      }
    },
  };
};

export default snakeUpwards;
