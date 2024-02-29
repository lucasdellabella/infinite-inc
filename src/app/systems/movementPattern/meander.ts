import { GameObject } from "@/app/App";
import { Time } from "../utils";

const randomMoveDuration = () => Math.random() * 3000 + 2000;
const randomPauseDuration = () => Math.random() * 1000 + 1000;
const randomDirection = () => Math.random() * Math.PI * 2;
const randomSpeed = () => 10 + Math.random() * 40;

const meander = () => {
  let moveTime = randomMoveDuration(); // Random time between 2 and 5 seconds
  let pauseTime = randomPauseDuration(); // Random time between 1 and 2 seconds
  let directionAngle = randomDirection(); // Random angle in radians

  let moving = true;
  let moveTimer = 0;
  let pauseTimer = 0;

  return {
    name: "meander" as const,
    update: (time: Time, entity: GameObject) => {
      // If the entity is currently moving
      if (moving) {
        // Update the velocity based on the direction angle
        if (entity.velocity) {
          const newSpeed = randomSpeed();
          entity.velocity.vx = Math.cos(directionAngle) * newSpeed;
          entity.velocity.vy = Math.sin(directionAngle) * newSpeed;
        }

        // Update the move timer
        moveTimer += time.delta;

        // If the move timer exceeds the move time, switch to pausing
        if (moveTimer >= moveTime) {
          moving = false;
          moveTimer = 0;
          // Pause the entity's movement
          if (entity.velocity) {
            entity.velocity.vx = 0;
            entity.velocity.vy = 0;
          }
          // Reset pause time for next pause
          pauseTime = randomPauseDuration();
        }
      } else {
        // If the entity is currently paused, update the pause timer
        pauseTimer += time.delta;

        // If the pause timer exceeds the pause time, switch to moving
        if (pauseTimer >= pauseTime) {
          moving = true;
          pauseTimer = 0;
          // Set a new random direction for the next move
          directionAngle = randomDirection();
          // Reset move time for next movement
          moveTime = randomMoveDuration();
        }
      }
    },
  };
};

export default meander;
