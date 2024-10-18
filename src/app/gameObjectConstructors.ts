import { combine } from "@/lib/httpClient";
import { selectRandomElement } from "@/utils/array";
import { capitalizeFirstLetter } from "@/utils/string";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { Database, supaSelectMany, supaSelectOne } from "../lib/supabase";
import {
  ComponentDictionary,
  GameObject,
  MovementPatternComponent,
  PositionComponent,
} from "./App";
import {
  createComponent,
  createMovementPattern,
} from "./componentConstructors";
import baseAreaOfEffect from "./systems/areaOfEffect/baseAreaOfEffect";

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
  nameOpt: string | undefined,
  position: PositionComponent,
  movementPatternClosureState?: string | number | boolean | object | undefined,
  genProps?: Database["public"]["Tables"]["entity_properties"]["Row"][]
) => {
  const name = nameOpt || "unknown";
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
    autoCombines: {
      isCombinable: name !== "farmer",
    },
    position,
    name: name
      .replaceAll("_", " ")
      .split(" ")
      .map(capitalizeFirstLetter)
      .join(" "),
    identifier: name,
  };
  const emojis = await supaSelectOne(supabase, "entity_emojis", [
    ["res_name1", name],
  ]);

  const { emojis: emoji } =
    (emojis as Database["public"]["Views"]["entity_emojis"]["Row"]) || {};

  const propRows = (await supaSelectMany(supabase, "entity_properties", [
    ["entity_name", name],
  ])) as { data: unknown };

  const allProps: Database["public"]["Tables"]["entity_properties"]["Row"][] = [
    ...(genProps || []),
    ...(propRows?.data as Database["public"]["Tables"]["entity_properties"]["Row"][]),
  ];

  if (!emoji || allProps.length === 0) {
    await combine(name);
  }
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

  if (props["emits"])
    props["emits"] = selectRandomElement(
      props["emits"] as unknown[],
      entity.id
    );

  const newEntity = {
    ...entity,
    ...{ emoji: emoji || "?" },
    ...props,
  } as GameObject;

  if (genProps) console.log("new entity props", newEntity);

  // Check each component that needs to be able to serialize and load itself
  // gameObject.
  if (newEntity.movementPattern) {
    const { name: movementPatternName } = newEntity.movementPattern;
    const newMp = createMovementPattern(movementPatternName);
    if (newMp) {
      newEntity.movementPattern = createMovementPattern(
        movementPatternName
      ) as MovementPatternComponent;
      if (newEntity.movementPattern && movementPatternClosureState)
        newEntity.movementPattern.setState(
          movementPatternClosureState as object
        );
    }
  }

  // if (newEntity.areaOfEffect) {
  //   newEntity.areaOfEffect = baseAreaOfEffect(
  //     newEntity.areaOfEffect.componentType,
  //     // newEntity.areaOfEffect.component,
  //     constructNewComponent(),
  //     newEntity.areaOfEffect.shape,
  //     newEntity.areaOfEffect.dims,
  //     newEntity.areaOfEffect
  //   );
  // }

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
    areaOfEffect: baseAreaOfEffect(
      // "disappears",
      // createComponent("disappears", { timeLeftMs: 5000 }),
      "velocity",
      createComponent("velocity", { vx: 0, vy: 20 }),
      "rectangle",
      { x: 200, y: 200 }
    ),
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
