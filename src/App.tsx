import React, { useState } from 'react'
import { Upload, ZoomIn, ZoomOut, Move } from 'lucide-react'
import PlanViewer from './components/PlanViewer'
import MachineList from './components/MachineList'
import { Machine } from './types'

function App() {
  const [plan, setPlan] = useState<string | null>(null)
  const [machines, setMachines] = useState<Machine[]>([])
  const [selectedMachineIndex, setSelectedMachineIndex] = useState<number | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPlan(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addMachine = (machine: Machine) => {
    setMachines([...machines, machine])
  }

  const removeMachine = (index: number) => {
    setMachines(machines.filter((_, i) => i !== index))
    if (selectedMachineIndex === index) {
      setSelectedMachineIndex(null)
    }
  }

  const removeAllMachines = () => {
    setMachines([])
    setSelectedMachineIndex(null)
  }

  const updateMachinePosition = (index: number, x: number, y: number) => {
    setMachines(machines.map((machine, i) => 
      i === index ? { ...machine, x, y } : machine
    ))
  }

  const handleMachineSelect = (index: number) => {
    setSelectedMachineIndex(index)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Plan and Machine Placement</h1>
      </header>
      <main className="flex-grow flex">
        <div className="w-1/4 bg-white p-4 border-r overflow-y-auto">
          <div className="mb-4">
            <label htmlFor="plan-upload" className="block mb-2 font-semibold">
              Upload Plan
            </label>
            <div className="flex items-center">
              <input
                type="file"
                id="plan-upload"
                accept=".pdf,.png,.jpg,.jpeg,.svg"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="plan-upload"
                className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded flex items-center"
              >
                <Upload size={18} className="mr-2" />
                Choose File
              </label>
            </div>
          </div>
          <MachineList
            machines={machines}
            addMachine={addMachine}
            removeMachine={removeMachine}
            removeAllMachines={removeAllMachines}
            onMachineSelect={handleMachineSelect}
            selectedMachineIndex={selectedMachineIndex}
          />
        </div>
        <div className="w-3/4 p-4 flex-grow">
          <PlanViewer
            plan={plan}
            machines={machines}
            updateMachinePosition={updateMachinePosition}
            selectedMachineIndex={selectedMachineIndex}
          />
        </div>
      </main>
    </div>
  )
}

export default App