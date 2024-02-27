interface Node {
  x: number
  y: number
}

interface Props {
  nodes: Node[]
}

const Nodes = ({ nodes }: Props) => {
  const size = 100
  return (
    <div>
      {nodes.map(({ x, y }, i) => {
        return (
          <div
            key={i}
            className="absolute left-0 top-0 bg-red-900 opacity-50"
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
