import {
  AoePatternComponent,
  GameObject,
  MovementPatternComponent,
} from "@/app/App";
import { createMovementPattern } from "@/app/componentConstructors";

const conveyor = (): AoePatternComponent => {
  const savedMovementPatterns = new Map<
    string,
    [MovementPatternComponent | undefined, object | undefined]
  >();
  return {
    name: "conveyor" as const,
    applyEffect: (node: GameObject) => {
      if (savedMovementPatterns.has(node.id)) return;
      const { movementPattern: mp } = node;

      if (mp?.getState)
        savedMovementPatterns.set(node.id, [mp, mp?.getState()]);
      node.movementPattern = undefined;
      node.velocity = { vx: 5, vy: 0 };
    },
    removeEffect: (node: GameObject) => {
      if (savedMovementPatterns.has(node.id)) {
        node.velocity = { vx: 0, vy: 0 };
        const [mp, state] = savedMovementPatterns.get(node.id) || [];
        savedMovementPatterns.delete(node.id)
        const { name } = mp || {};
        
        if (name){
          const newMp = createMovementPattern(name);
          if(newMp)
            node.movementPattern = newMp as MovementPatternComponent
        }
        if (state) node.movementPattern?.setState(state);
      }
    },
  };
};

export default conveyor;
