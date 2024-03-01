import { GameObject } from "@/app/App";
import { Time } from "../utils";

const randomMoveDuration = () => Math.random() * 3000 + 2000;
const randomPauseDuration = () => Math.random() * 1000 + 1000;
const randomDirection = () => Math.random() * Math.PI * 2;
const randomSpeed = () => 10 + Math.random() * 40;

interface State {
  moveTime: number;
  pauseTime: number;
  directionAngle: number;
  moving: boolean;
  moveTimer: number;
  pauseTimer: number;
}

const meander = () => {
  let state: State = {
    moveTime: randomMoveDuration(), // Random time between 2 and 5 seconds
    pauseTime: randomPauseDuration(), // Random time between 1 and 2 seconds
    directionAngle: randomDirection(), // Random angle in radians

    moving: true,
    moveTimer: 0,
    pauseTimer: 0,
  };

  return {
    name: "meander" as const,
    // type assertion to object so we don't have to figure out TS stuff
    getState: () => state as object,
    setState: (newState: object) => (state = { ...newState } as State),
    update: (time: Time, entity: GameObject) => {
      // If the entity is currently moving
      if (state.moving) {
        // Update the velocity based on the direction angle
        if (entity.velocity) {
          const newSpeed = randomSpeed();
          entity.velocity.vx = Math.cos(state.directionAngle) * newSpeed;
          entity.velocity.vy = Math.sin(state.directionAngle) * newSpeed;
        }

        // Update the move timer
        state.moveTimer += time.delta;

        // If the move timer exceeds the move time, switch to pausing
        if (state.moveTimer >= state.moveTime) {
          state.moving = false;
          state.moveTimer = 0;
          // Pause the entity's movement
          if (entity.velocity) {
            entity.velocity.vx = 0;
            entity.velocity.vy = 0;
          }
          // Reset pause time for next pause
          state.pauseTime = randomPauseDuration();
        }
      } else {
        // If the entity is currently paused, update the pause timer
        state.pauseTimer += time.delta;

        // If the pause timer exceeds the pause time, switch to moving
        if (state.pauseTimer >= state.pauseTime) {
          state.moving = true;
          state.pauseTimer = 0;
          // Set a new random direction for the next move
          state.directionAngle = randomDirection();
          // Reset move time for next movement
          state.moveTime = randomMoveDuration();
        }
      }
    },
  };
};

export default meander;
