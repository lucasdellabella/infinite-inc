import { GameObject } from "../App";

interface Props {
  nodes: GameObject[];
}

const Nodes = ({ nodes }: Props) => {
  return (
    <div>
      {nodes.map(({ id, emoji, name, position }) => {
        if (!position) {
          return null;
        }

        return (
          <div
            key={id}
            data-entity-id={id}
            className="absolute group flex items-center py-2 px-4 left-0 top-0 select-none"
            style={{
              minWidth: "60px",
              minHeight: "20px",
              transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            }}
          >
            <div className="absolute z-[-1] top-0 left-0 bg-transparent border border-slate-900 pointer-events-none w-full h-full rounded-md cursor-pointer opacity-0 transition-all group-hover:opacity-100"></div>
            <span className="text-3xl cursor-pointer pointer-events-none">
              {emoji}
            </span>
            <span className="text-xl ml-2 opacity-0 transition-all pointer-events-none group-hover:opacity-100">
              {name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default Nodes;
