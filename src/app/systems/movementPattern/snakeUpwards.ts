import { GameObject } from "@/app/App";
import { Time } from "../utils";

interface State {
  angle: number;
}

const snakeUpwards = (vy = -100) => {
  const radius = 80;
  let state: State = {
    angle: 0,
  };

  return {
    name: "snake_upwards" as const,
    // type assertion to object so we don't have to figure out TS stuff
    getState: () => state as object,
    setState: (newState: object) => (state = { ...newState } as State),
    update: (time: Time, entity: GameObject) => {
      const percentOfASecond = time.delta / 1000;
      if (entity.velocity) {
        state.angle += 3 * percentOfASecond;
        entity.velocity.vx = Math.sin(state.angle) * radius;
        entity.velocity.vy = vy;
      }
    },
  };
};

export default snakeUpwards;
