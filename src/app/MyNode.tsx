import React, { memo } from "react"
import { Handle, Position } from "reactflow"

function MyNode({ data }) {
  return (
    <div className="rounded-md border-2 border-stone-400 bg-white px-4 py-2 shadow-md">
      <div className="flex items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
          {data.emoji}
        </div>
        <div className="ml-2 text-lg font-bold">{data.label}</div>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-teal-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-teal-500"
      />
    </div>
  )
}

export default memo(MyNode)
