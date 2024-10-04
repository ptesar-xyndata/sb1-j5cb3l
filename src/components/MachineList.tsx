import React, { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { Machine } from '../types'

interface MachineListProps {
  machines: Machine[]
  addMachine: (machine: Machine) => void
  removeMachine: (index: number) => void
  removeAllMachines: () => void
  onMachineSelect: (index: number) => void
  selectedMachineIndex: number | null
}

const MachineList: React.FC<MachineListProps> = ({
  machines,
  addMachine,
  removeMachine,
  removeAllMachines,
  onMachineSelect,
  selectedMachineIndex
}) => {
  const [newMachineName, setNewMachineName] = useState('')

  const handleAddMachine = () => {
    if (newMachineName.trim()) {
      const newMachine: Machine = {
        name: newMachineName.trim(),
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        x: 0,
        y: 0,
      }
      addMachine(newMachine)
      setNewMachineName('')
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Machines</h2>
      <div className="mb-4">
        <input
          type="text"
          value={newMachineName}
          onChange={(e) => setNewMachineName(e.target.value)}
          placeholder="Enter machine name"
          className="w-full p-2 border rounded"
        />
        <div className="flex space-x-2 mt-2">
          <button
            onClick={handleAddMachine}
            className="bg-green-500 text-white px-4 py-2 rounded flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Add Machine
          </button>
          <button
            onClick={removeAllMachines}
            className="bg-red-500 text-white px-4 py-2 rounded flex items-center"
          >
            <Trash2 size={18} className="mr-2" />
            Remove All
          </button>
        </div>
      </div>
      <ul className="space-y-2">
        {machines.map((machine, index) => (
          <li
            key={index}
            className={`flex items-center justify-between p-2 rounded cursor-pointer ${
              index === selectedMachineIndex ? 'bg-blue-100' : 'bg-gray-100'
            }`}
            onClick={() => onMachineSelect(index)}
          >
            <div className="flex items-center">
              <div
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: machine.color }}
              ></div>
              <span>{machine.name}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeMachine(index)
              }}
              className="text-red-500 hover:text-red-700"
            >
              <X size={18} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MachineList