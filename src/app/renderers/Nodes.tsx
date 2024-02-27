interface Node {
  x: number
  y: number
  id: string
}

interface Props {
  nodes: Node[]
}

const Nodes = ({ nodes }: Props) => {
  const size = 100
  return (
    <div>
      {nodes.map(({ x, y, id }) => {
        return (
          <div
            key={id}
            data-entity-id={id}
            className="absolute left-0 top-0 cursor-pointer bg-red-900"
            style={{
              width: size,
              height: size,
              transform: `translate3d(${x}px, ${y}px, 0)`,
            }}
          />
        )
      })}
    </div>
  )
}

export default Nodes
