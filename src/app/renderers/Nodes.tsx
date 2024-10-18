import { cn } from "@/lib/utils";
import { useState } from "react";
import { GameObject } from "../App";

interface Props {
  nodes: GameObject[];
}

const Node = ({
  id,
  emoji,
  name,
  position,
  isCombining,
  areaOfEffect,
}: GameObject) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleHoverStart = () => {
    setIsHovered(true);
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
  };

  if (!position) {
    return null;
  }

  const translate3dString = (x: number, y: number, adjustSelf: string = "") => {
    return `translate3d(calc(${x}px ${adjustSelf}), calc(${y}px ${adjustSelf}), 0)`;
  };

  const AreaOfEffectBounds = ({
    origin,
  }: {
    origin: { x: number; y: number };
  }) =>
    areaOfEffect ? (
      <div
        className={cn(
          "absolute border-dashed border-2 border-slate-950 opacity-30",
          isCombining ? "animate-pulse" : "",
          areaOfEffect.shape === "ellipse" ? "rounded-" : ""
        )}
        style={{
          transform: translate3dString(
            origin.x - areaOfEffect.dims.x,
            origin.y - areaOfEffect.dims.y,
            "+ 50%"
          ),
          width: `${areaOfEffect?.dims.x}px`,
          height: `${areaOfEffect?.dims.y}px`,
          top: `${areaOfEffect?.offset.y}px`,
          left: `${areaOfEffect?.offset.x}px`,
        }}
      >
        {" "}
      </div>
    ) : null;

  if (!isHovered && !isCombining) {
    return (
      <>
        <AreaOfEffectBounds origin={position} />
        <div
          key={id}
          data-entity-id={id}
          className={cn(
            "absolute flex items-center py-1 px-2 left-0 top-0 select-none cursor-pointer",
            isCombining ? "animate-pulse" : ""
          )}
          style={{
            transform: translate3dString(position.x, position.y, "- 50%"),
          }}
          onMouseEnter={handleHoverStart}
          onMouseLeave={handleHoverEnd}
          onTouchStart={handleHoverStart}
          onTouchEnd={handleHoverEnd}
        >
          <span className="text-3xl cursor-pointer pointer-events-none">
            {emoji}
          </span>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        key={id}
        data-entity-id={id}
        className={cn(
          "absolute z-[9999999999] flex items-center py-1 px-2 left-0 top-0 select-none cursor-pointer",
          isCombining ? "animate-pulse" : ""
        )}
        onMouseEnter={handleHoverStart}
        onMouseLeave={handleHoverEnd}
        onTouchStart={handleHoverStart}
        onTouchEnd={handleHoverEnd}
        style={{
          transform: translate3dString(position.x, position.y, "- 50%"),
        }}
      >
        <div
          className={cn(
            "absolute z-[-1] top-0 left-0 opacity-60 bg-white border border-slate-900 pointer-events-none w-full h-full rounded-md cursor-pointer transition-all"
          )}
        ></div>
        <span className="text-3xl cursor-pointer pointer-events-none">
          {emoji}
        </span>
        <span className={cn("text-xl ml-2 transition-all pointer-events-none")}>
          {name}
        </span>
      </div>
      <AreaOfEffectBounds origin={position} />
    </>
  );
};

const Nodes = ({ nodes }: Props) => {
  return (
    <div>
      {nodes.map((props) => (
        <Node key={props.id} {...props} />
      ))}
    </div>
  );
};

export default Nodes;
