import { useState } from "react";
import { GameObject } from "../App";

interface Props {
  nodes: GameObject[];
}

const Node = ({ id, emoji, name, position }) => {
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

  if (!isHovered) {
    return (
      <div
        key={id}
        data-entity-id={id}
        className="absolute flex items-center py-1 px-2 left-0 top-0 select-none cursor-pointer"
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
      className="absolute group z-[9999999999] flex items-center py-1 px-2 left-0 top-0 select-none cursor-pointer"
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      onTouchStart={handleHoverStart}
      onTouchEnd={handleHoverEnd}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
    >
      <div className="absolute z-[-1] top-0 left-0 bg-white border border-slate-900 pointer-events-none w-full h-full rounded-md cursor-pointer opacity-0 transition-all group-hover:opacity-60"></div>
      <span className="text-3xl cursor-pointer pointer-events-none">
        {emoji}
      </span>
      <span className="text-xl ml-2 opacity-0 transition-all pointer-events-none group-hover:opacity-100">
        {name}
      </span>
    </div>
  );
};

const Nodes = ({ nodes }: Props) => {
  return (
    <div>
      {nodes.map((props) => (
        <Node {...props} />
      ))}
    </div>
  );
};

export default Nodes;
