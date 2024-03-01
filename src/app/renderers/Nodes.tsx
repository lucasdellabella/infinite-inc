import { useState } from "react";
import { GameObject } from "../App";
import { cn } from "@/lib/utils";

interface Props {
  nodes: GameObject[];
}

const Node = ({ id, emoji, name, position, isCombining }: GameObject) => {
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

  if (!isHovered && !isCombining) {
    return (
      <div
        key={id}
        data-entity-id={id}
        className={cn(
          "absolute flex items-center py-1 px-2 left-0 top-0 select-none cursor-pointer",
          isCombining ? "animate-pulse" : ""
        )}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
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
    );
  }

  return (
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
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
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