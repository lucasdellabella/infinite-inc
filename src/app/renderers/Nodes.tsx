import { GameObject } from "../App";

interface Props {
  nodes: GameObject[];
}

const Nodes = ({ nodes }: Props) => {
  const size = 100;
  return (
    <div>
      {nodes.map(({ id, position }) => {
        if (!position) {
          return null;
        }

        return (
          <div
            key={id}
            data-entity-id={id}
            className="absolute left-0 top-0 cursor-pointer bg-red-900"
            style={{
              width: size,
              height: size,
              transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            }}
          />
        );
      })}
    </div>
  );
};

export default Nodes;
