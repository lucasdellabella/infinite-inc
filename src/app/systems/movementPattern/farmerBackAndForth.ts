import { GameObject } from "@/app/App";
import { Time } from "../utils";

const farmerBackAndForth = () => {
  const stepWidth = 200; // The width of the horizontal movement
  const stepHeight = 20; // The height the entity moves down after each step
  const speed = 20;
  let startingPosition: { x: number; y: number };
  let direction: "right" | "left" = "right"; // 'right' or 'left'
  let currentStep = 0; // Current step in the pattern
  let isResetting = false;

  return {
    name: "farmer__back_and_forth" as const,
    update: (_time: Time, entity: GameObject) => {
      if (entity.velocity && entity.position) {
        if (!startingPosition) {
          startingPosition = { ...entity.position };
        }

        const distanceFromOriginX = entity.position.x - startingPosition.x;
        const distanceFromOriginY = entity.position.y - startingPosition.y;

        if (currentStep === 5 && distanceFromOriginX < 0) {
          isResetting = true;
        }

        if (isResetting) {
          entity.velocity.vy = -1 * speed;
          entity.velocity.vx = 0;
          if (distanceFromOriginY < 0) {
            isResetting = false;
            currentStep = 0;
            direction = "right";
            entity.velocity.vx = 1 * speed;
          }
        } else if (direction === "right") {
          if (distanceFromOriginX < stepWidth) {
            entity.velocity.vx = 1 * speed; // Move right
            entity.velocity.vy = 0;
          } else if (distanceFromOriginY < (currentStep + 1) * stepHeight) {
            entity.velocity.vx = 0; // Move down at the end of a step
            entity.velocity.vy = speed; // Move down at the end of a step
          } else if (distanceFromOriginY >= (currentStep + 1) * stepHeight) {
            entity.velocity.vx = -1 * speed; // Move down at the end of a step
            entity.velocity.vy = 0; // Move down at the end of a step
            direction = "left"; // Change direction
            currentStep++; // Increment the step count
          }
        } else if (direction === "left") {
          if (distanceFromOriginX > 0) {
            entity.velocity.vx = -1 * speed; // Move left
            entity.velocity.vy = 0;
          } else if (distanceFromOriginY < (currentStep + 1) * stepHeight) {
            entity.velocity.vx = 0; // Move down at the end of a step
            entity.velocity.vy = speed; // Move down at the end of a step
          } else if (distanceFromOriginY >= (currentStep + 1) * stepHeight) {
            entity.velocity.vx = 1 * speed; // Move down at the end of a step
            entity.velocity.vy = 0; // Move down at the end of a step
            direction = "right"; // Change direction
            currentStep++; // Increment the step count
          }
        }
      }
    },
  };
};

export default farmerBackAndForth;
