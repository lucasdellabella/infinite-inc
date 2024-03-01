import { MovementPatternComponent } from "./App";
import durdle from "./systems/movementPattern/durdle";
import farmerBackAndForth from "./systems/movementPattern/farmerBackAndForth";
import meander from "./systems/movementPattern/meander";
import snakeUpwards from "./systems/movementPattern/snakeUpwards";

export const createMovementPattern = (
  name: MovementPatternComponent["name"]
) => {
  switch (name) {
    case "durdle":
      return durdle();
    case "meander":
      return meander();
    case "farmer__back_and_forth":
      return farmerBackAndForth();
    case "snake_upwards":
      return snakeUpwards();
  }
};
