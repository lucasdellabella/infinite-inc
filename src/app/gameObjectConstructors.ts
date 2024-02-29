import { v4 as uuidv4 } from "uuid";
import farmerBackAndForth from "./systems/movementPattern/farmerBackAndForth";
import meander from "./systems/movementPattern/meander";
import snakeUpwards from "./systems/movementPattern/snakeUpwards";
import { PositionComponent } from "./App";

const createDefaultGameObject = () => ({
  id: uuidv4(),
  draggable: { isBeingDragged: false },
});

export const createMilk = (position: PositionComponent) => {
  return {
    ...createDefaultGameObject(),
    name: "Milk",
    emoji: "🥛",
    position,
  };
};

export const createSeed = (position: PositionComponent) => ({
  ...createDefaultGameObject(),
  name: "Seed",
  emoji: "🌱",
  position,
});

export const createFarmer = (position: PositionComponent) => {
  return {
    ...createDefaultGameObject(),
    name: "Farmer",
    emoji: "👩‍🌾",
    position,
    velocity: {
      vx: 10,
      vy: 0,
    },
    movementPattern: farmerBackAndForth(),
    emits: {
      timeLeft: 0,
      period: 5000,
      createGameObject: createSeed,
    },
  };
};

export const createCow = (position: PositionComponent) => ({
  ...createDefaultGameObject(),
  name: "Cow",
  emoji: "🐮",
  position,
  velocity: {
    vx: 10,
    vy: 0,
  },
  movementPattern: meander(),
  emits: {
    timeLeft: 2000,
    period: 15000,
    createGameObject: createMilk,
  },
});

export const createFire = (position: PositionComponent) => ({
  ...createDefaultGameObject(),
  name: "Fire",
  emoji: "🔥",
  position,
  velocity: {
    vx: 10,
    vy: 0,
  },
  movementPattern: snakeUpwards(),
});
