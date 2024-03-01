import { EntitiesPayload } from "../App";
import { SystemArgs } from "./utils";

export const handleActive = (
    entities: EntitiesPayload,
    { }: SystemArgs<any>
  ) => {
    entities.gameObjects.nodes.forEach(node => {
        if(!node.isActive) return

        if(node.draggable?.isBeingDragged){
            node.isActive = false
        }
    });
   
    return entities;
  };
  