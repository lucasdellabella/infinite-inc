import { EventName } from "../tmp_events";

export interface InternalEvent {
  type: string;
}
export type Input =
  | React.MouseEvent<HTMLDivElement>
  | React.TouchEvent<HTMLDivElement>
  | React.KeyboardEvent<HTMLDivElement>;

export type Time = {
  current: number;
  previous: number | null;
  delta: number;
  previousDelta: number | null;
};

export interface SystemArgs<U> {
  input: { name: EventName; payload: Input }[];
  window: Window;
  events: (U | InternalEvent)[];
  dispatch: (e: U | InternalEvent) => void;
  defer: (e: U) => void;
  time: Time;
}
