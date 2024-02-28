import { GameObject } from "./App";
import { v4 as uuidv4 } from "uuid";

export default [
  {
    name: "Farmer",
    id: uuidv4(),
    emoji: "👩‍🌾",
    position: {
      x: 100,
      y: 100,
    },
    draggable: {
      isBeingDragged: false,
    },
  },
  {
    name: "Earth",
    id: uuidv4(),
    emoji: "🌎",
    position: {
      x: 100,
      y: 300,
    },
    draggable: {
      isBeingDragged: false,
    },
  },
  {
    name: "Fire",
    id: uuidv4(),
    emoji: "🔥",
    position: {
      x: 300,
      y: 100,
    },
    draggable: {
      isBeingDragged: false,
    },
  },
  {
    name: "Cow",
    id: uuidv4(),
    emoji: "🐮",
    position: {
      x: 500,
      y: 100,
    },
    draggable: {
      isBeingDragged: false,
    },
  },
] as GameObject[];
