import { v4 as uuidv4 } from "uuid";
import { ComponentDictionary, GameObject, PositionComponent } from "./App";
import { createMovementPattern } from "./componentConstructors";
import farmerBackAndForth from "./systems/movementPattern/farmerBackAndForth";
import meander from "./systems/movementPattern/meander";
import snakeUpwards from "./systems/movementPattern/snakeUpwards";

type ComponentDictionaryKeys = {
  [K in keyof ComponentDictionary]: object | string | boolean | number;
};

export type SerializableGameObject = {
  entity: GameObject;
} & ComponentDictionaryKeys;

export const deserializeGameObject = (data: string) => {
  // everything other than entity is
  // the function's closure data.
  // movementPattern is really movementPatternClosureState
  const baseEntity = createDefaultGameObject();
  const { entity, movementPattern }: SerializableGameObject = JSON.parse(data);
  const newEntity = { ...baseEntity, ...entity };

  // Check each component that needs to be able to serialize and load itself
  // gameObject.
  if (newEntity.movementPattern && movementPattern) {
    newEntity.movementPattern = createMovementPattern(
      newEntity.movementPattern.name
    );
    newEntity.movementPattern.setState(movementPattern as object);
  }

  return newEntity;
};

const createDefaultGameObject = () => ({
  id: uuidv4(),
  draggable: { isBeingDragged: false },
  // NOTE: Must be old fn syntax for the this to work
  serialize: function (this: GameObject) {
    const serializable: SerializableGameObject = { entity: this };
    if (this.movementPattern) {
      serializable.movementPattern = this.movementPattern.getState();
    }
    if (this.emits) {
      serializable.emits = {};
    }
    return JSON.stringify(serializable);
  },
});

export const createMilk = (position: PositionComponent) => {
  return {
    ...createDefaultGameObject(),
    name: "Milk",
    emoji: "🥛",
    position,
    disappears: {
      timeLeft: 5000,
    },
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
      emittedObjectName: "Seed",
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
    emittedObjectName: "Milk",
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
