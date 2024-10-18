import {
  AreaOfEffectComponent,
  ComponentType,
  GameComponent,
  GameObject,
} from "@/app/App";

type TrackedEntity = {
  id: string;
  entity: GameObject;
  originalComponent: GameComponent;
};

const baseAreaOfEffect = (
  componentType: ComponentType,
  component: GameComponent,
  shape: "rectangle" | "ellipse" = "rectangle",
  dims: { x: number; y: number } = { x: 100, y: 200 },
  offset: { x: number; y: number } = { x: 0, y: 0 }
): AreaOfEffectComponent => {
  // store original values here for when its de-applied

  const effectedEntities: TrackedEntity[] = [];
  const trackNewEffectedEntity = (entity: GameObject) => {
    effectedEntities.push({
      id: entity.id,
      entity,
      originalComponent: entity[componentType]!,
    });
    // @ts-expect-error: Our typing is weird. componentType indexing is fkd
    entity[componentType] = component;
  };

  const untrackEffectedEntity = (entity: GameObject) => {
    const index = effectedEntities.findIndex(
      (trackedEntity: TrackedEntity) => trackedEntity.id === entity.id
    );
    if (index !== -1) {
      const { originalComponent, entity } = effectedEntities[index];
      // @ts-expect-error: Our typing is weird. componentType indexing is fkd
      entity[componentType] = originalComponent;
      effectedEntities.splice(index, 1);
    }
  };

  return {
    shape,
    dims,
    offset,
    componentType,
    component,
    applyEffect: (recipient: GameObject) => {
      if (effectedEntities.find((a) => a.id === recipient.id)) {
        return;
      }

      trackNewEffectedEntity(recipient);
    },
    removeEffect: (recipient: GameObject) => {
      if (!effectedEntities.find((a) => a.id === recipient.id)) {
        return;
      }

      if (componentType in recipient) {
        untrackEffectedEntity(recipient);
      }
    },
  };
};

export default baseAreaOfEffect;
