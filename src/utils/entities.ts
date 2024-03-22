import { EntitiesPayload } from "@/app/App";

export function dropEntityById(entities: EntitiesPayload, targetId: string){
    const index = entities.gameObjects?.nodes?.findIndex(({id})=> targetId === id)
    entities.gameObjects?.nodes?.splice(index, 1)
}