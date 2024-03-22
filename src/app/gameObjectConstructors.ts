import { v4 as uuidv4 } from "uuid";
import { ComponentDictionary, GameObject, MovementPatternComponent, PositionComponent } from "./App";
import {
  createAoePattern,
  createMovementPattern,
} from "./componentConstructors";
import conveyor from "./systems/aoePattern/conveyor";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { Database, supaSelectMany, supaSelectOne } from "../lib/supabase";
import { capitalizeFirstLetter } from "@/utils/string";

const supabase: SupabaseClient<Database> = createClient(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || ""
);

type ComponentDictionaryKeys = {
  [K in keyof ComponentDictionary]: object | string | boolean | number;
};

export type SerializableGameObject = {
  entity: GameObject;
} & ComponentDictionaryKeys;

const defaultPosition: PositionComponent = {
  x: 0,
  y: 0,
};

export const deserializeGameObject = async (data: string) => {
  // everything other than entity is
  // the function's closure data.
  // movementPattern is really movementPatternClosureState

  const { entity: baseEntity, movementPattern }: SerializableGameObject =
    JSON.parse(data);
  const position = baseEntity.position || defaultPosition;

  const entity =
    baseEntity.identifier !== "tractor"
      ? await createDefaultGameObject(
          baseEntity.identifier,
          position,
          movementPattern
        )
      : await createTractor(position);

  const newEntity = { ...baseEntity, ...entity };

  return newEntity;
};

export const createDefaultGameObject = async (
  name: string,
  position: PositionComponent,
  movementPatternClosureState?: string | number | boolean | object | undefined,
  genProps?: Database["public"]["Tables"]["entity_properties"]["Row"][]
) => {
  const entity = {
    velocity: {
      vx: 0,
      vy: 0,
    },
    id: uuidv4(),
    draggable: { isBeingDragged: false },
    isActive: true,
    // NOTE: Must be old fn syntax for the this to work
    isCombining: false,
    position,
    name: name
      .replaceAll("_", " ")
      .split(" ")
      .map(capitalizeFirstLetter)
      .join(" "),
    identifier: name,
  };
  const combo = await supaSelectOne(supabase, "combos", [["res_name1", name]]);

  const { emojis: emoji } =
    (combo as Database["public"]["Tables"]["combos"]["Row"]) || {};

  const propRows = (await supaSelectMany(supabase, "entity_properties", [
    ["entity_name", name],
  ])) as { data: unknown };

  const allProps: Database["public"]["Tables"]["entity_properties"]["Row"][] = [
    ...(genProps || []),
    ...(propRows?.data as Database["public"]["Tables"]["entity_properties"]["Row"][]),
  ];
  const props = allProps.reduce(
    (
      accumulator: { [x: string]: any },
      current: { config?: any; name?: any }
    ) => {
      const { name } = current;
      if (!name) return accumulator;
      if (name === "emits") {
        if (accumulator[name]) {
          (accumulator[name] as unknown[]).push(current.config);
        } else {
          accumulator[name] = [current.config];
        }
      } else {
        accumulator[name] = current.config;
      }

      return accumulator;
    },
    {} as { [k: string]: unknown[] | unknown }
  );

  const newEntity = {
    ...entity,
    ...{ emoji: emoji || "?" },
    ...props,
  } as GameObject;

  if (genProps) console.log("new gusy", newEntity);

  // Check each component that needs to be able to serialize and load itself
  // gameObject.
  if (newEntity.movementPattern) {
    const { name: movementPatternName } = newEntity.movementPattern;
    const newMp = createMovementPattern(movementPatternName);
    if (newMp) {
      newEntity.movementPattern = createMovementPattern(movementPatternName) as MovementPatternComponent;
      if (newEntity.movementPattern && movementPatternClosureState)
        newEntity.movementPattern.setState(
          movementPatternClosureState as object
        );
    }
  }

  if (newEntity.aoePattern) {
    newEntity.aoePattern = createAoePattern(newEntity.aoePattern.name);
  }

  return {
    ...newEntity,
    serialize: function (this: GameObject) {
      const serializable: SerializableGameObject = { entity: this };
      if (this.movementPattern?.getState) {
        serializable.movementPattern = this.movementPattern.getState();
      }
      if (this.emits) {
        serializable.emits = {};
      }
      return JSON.stringify(serializable);
    },
  };
};

export const createMilk = async (position: PositionComponent) =>
  await createDefaultGameObject("milk", position);

export const createSeed = async (position: PositionComponent) =>
  await createDefaultGameObject("seed", position);

export const createTractor = async (position: PositionComponent) => {
  const tractor = await createDefaultGameObject("tractor", position);
  return {
    ...tractor,
    aoePattern: conveyor(),
  };
};

export const createFarmer = async (position: PositionComponent) => {
  const farmer = await createDefaultGameObject("farmer", position);
  return {
    ...farmer,
  };
};

export const createCow = async (position: PositionComponent) => {
  const cow = await createDefaultGameObject("cow", position);
  return {
    ...cow,
  };
};

export const createFire = async (position: PositionComponent) => {
  const fire = await createDefaultGameObject("fire", position);
  return {
    ...fire,
  };
};
