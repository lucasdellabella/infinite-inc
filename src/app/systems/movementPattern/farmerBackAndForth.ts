import { GameObject } from "@/app/App";
import { Time } from "../utils";

interface State {
  startingPosition: { x: number; y: number } | undefined;
  direction: "right" | "left"; // 'right' or 'left'
  currentStep: number;
  isResetting: boolean;
}

const farmerBackAndForth = () => {
  const stepWidth = 200; // The width of the horizontal movement
  const stepHeight = 20; // The height the entity moves down after each step
  const speed = 20;

  let state: State = {
    startingPosition: undefined,
    direction: "right",
    currentStep: 0,
    isResetting: false,
  };

  return {
    name: "farmer__back_and_forth" as const,
    // type assertion to object so we don't have to figure out TS stuff
    getState: () => state as object,
    setState: (newState: object) => (state = { ...newState } as State),
    update: (_time: Time, entity: GameObject) => {
      if (entity.velocity && entity.position) {
        if (!state.startingPosition) {
          state.startingPosition = { ...entity.position };
        }

        const distanceFromOriginX =
          entity.position.x - state.startingPosition.x;
        const distanceFromOriginY =
          entity.position.y - state.startingPosition.y;

        if (state.currentStep === 5 && distanceFromOriginX < 0) {
          state.isResetting = true;
        }

        if (state.isResetting) {
          entity.velocity.vy = -1 * speed;
          entity.velocity.vx = 0;
          if (distanceFromOriginY < 0) {
            state.isResetting = false;
            state.currentStep = 0;
            state.direction = "right";
            entity.velocity.vx = 1 * speed;
          }
        } else if (state.direction === "right") {
          if (distanceFromOriginX < stepWidth) {
            entity.velocity.vx = 1 * speed; // Move right
            entity.velocity.vy = 0;
          } else if (
            distanceFromOriginY <
            (state.currentStep + 1) * stepHeight
          ) {
            entity.velocity.vx = 0; // Move down at the end of a step
            entity.velocity.vy = speed; // Move down at the end of a step
          } else if (
            distanceFromOriginY >=
            (state.currentStep + 1) * stepHeight
          ) {
            entity.velocity.vx = -1 * speed; // Move down at the end of a step
            entity.velocity.vy = 0; // Move down at the end of a step
            state.direction = "left"; // Change direction
            state.currentStep++; // Increment the step count
          }
        } else if (state.direction === "left") {
          if (distanceFromOriginX > 0) {
            entity.velocity.vx = -1 * speed; // Move left
            entity.velocity.vy = 0;
          } else if (
            distanceFromOriginY <
            (state.currentStep + 1) * stepHeight
          ) {
            entity.velocity.vx = 0; // Move down at the end of a step
            entity.velocity.vy = speed; // Move down at the end of a step
          } else if (
            distanceFromOriginY >=
            (state.currentStep + 1) * stepHeight
          ) {
            entity.velocity.vx = 1 * speed; // Move down at the end of a step
            entity.velocity.vy = 0; // Move down at the end of a step
            state.direction = "right"; // Change direction
            state.currentStep++; // Increment the step count
          }
        }
      }
    },
  };
};

export default farmerBackAndForth;
