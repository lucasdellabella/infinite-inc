import { ComponentType, GameComponent, MovementPatternComponent } from "./App";
import durdle from "./systems/movementPattern/durdle";
import farmerBackAndForth from "./systems/movementPattern/farmerBackAndForth";
import meander from "./systems/movementPattern/meander";
import snakeUpwards from "./systems/movementPattern/snakeUpwards";

export const createMovementPattern = (
  name: MovementPatternComponent["name"],
  ...args: any[]
) => {
  switch (name) {
    case "durdle":
      return durdle(...args);
    case "meander":
      return meander(...args);
    case "farmer__back_and_forth":
    case "farmer_back_and_forth":
      return farmerBackAndForth(...args);
    case "snake_upwards":
      return snakeUpwards(...args);
    default:
      throw new Error(`movement pattern not found: ${name}`);
  }
};

export const createComponent = (
  componentType: ComponentType,
  data: GameComponent
) => {
  return data;
};
