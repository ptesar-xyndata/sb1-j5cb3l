import React, { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import { Machine } from '../types'

interface PlanViewerProps {
  plan: string | null
  machines: Machine[]
  updateMachinePosition: (index: number, x: number, y: number) => void
  selectedMachineIndex: number | null
}

const PlanTexture: React.FC<{ plan: string }> = ({ plan }) => {
  const texture = useRef<THREE.Texture | null>(null)
  const { scene } = useThree()

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(plan, (loadedTexture) => {
      texture.current = loadedTexture
      const aspect = loadedTexture.image.width / loadedTexture.image.height
      const planeGeometry = new THREE.PlaneGeometry(aspect, 1)
      const planeMaterial = new THREE.MeshBasicMaterial({ map: loadedTexture })
      const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
      planeMesh.position.set(0, 0, -0.1)
      scene.add(planeMesh)
    })

    return () => {
      if (texture.current) {
        texture.current.dispose()
      }
    }
  }, [plan, scene])

  return null
}

const MachineObject: React.FC<{
  machine: Machine
  index: number
  updatePosition: (index: number, x: number, y: number) => void
  isSelected: boolean
}> = ({ machine, index, updatePosition, isSelected }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { camera, gl } = useThree()
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  const intersection = new THREE.Vector3()

  const onPointerDown = (event: THREE.Event) => {
    event.stopPropagation()
    setIsDragging(true)
    gl.domElement.style.cursor = 'grabbing'
  }

  const onPointerUp = () => {
    setIsDragging(false)
    gl.domElement.style.cursor = 'grab'
  }

  const onPointerMove = (event: THREE.Event) => {
    if (isDragging && meshRef.current) {
      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2(
        (event.clientX / gl.domElement.clientWidth) * 2 - 1,
        -(event.clientY / gl.domElement.clientHeight) * 2 + 1
      )
      raycaster.setFromCamera(mouse, camera)
      raycaster.ray.intersectPlane(plane, intersection)
      meshRef.current.position.set(intersection.x, intersection.y, 0)
      updatePosition(index, intersection.x, intersection.y)
    }
  }

  useEffect(() => {
    gl.domElement.addEventListener('pointerup', onPointerUp)
    gl.domElement.addEventListener('pointermove', onPointerMove)

    return () => {
      gl.domElement.removeEventListener('pointerup', onPointerUp)
      gl.domElement.removeEventListener('pointermove', onPointerMove)
    }
  }, [isDragging, gl.domElement])

  return (
    <mesh
      ref={meshRef}
      position={[machine.x, machine.y, 0]}
      scale={[0.2, 0.1, 1]}
      onPointerDown={onPointerDown}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color={isSelected ? 'yellow' : machine.color} />
      <Html distanceFactor={10} position={[0, 0, 0.1]}>
        <div className="bg-white p-1 rounded text-xs whitespace-nowrap">{machine.name}</div>
      </Html>
    </mesh>
  )
}

const Controls: React.FC = () => {
  const { camera, gl } = useThree()
  const controls = useRef<any>()

  useFrame(() => {
    controls.current?.update()
  })

  return <OrbitControls ref={controls} args={[camera, gl.domElement]} enableRotate={false} />
}

const Scene: React.FC<{
  plan: string
  machines: Machine[]
  updateMachinePosition: (index: number, x: number, y: number) => void
  selectedMachineIndex: number | null
  cameraPosition: { x: number; y: number }
  cameraZoom: number
}> = ({ plan, machines, updateMachinePosition, selectedMachineIndex, cameraPosition, cameraZoom }) => {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(cameraPosition.x, cameraPosition.y, 5)
    camera.zoom = cameraZoom
    camera.updateProjectionMatrix()
  }, [camera, cameraPosition, cameraZoom])

  return (
    <>
      <PlanTexture plan={plan} />
      <group>
        {machines.map((machine, index) => (
          <MachineObject
            key={index}
            machine={machine}
            index={index}
            updatePosition={updateMachinePosition}
            isSelected={index === selectedMachineIndex}
          />
        ))}
      </group>
      <Controls />
    </>
  )
}

const PlanViewer: React.FC<PlanViewerProps> = ({ plan, machines, updateMachinePosition, selectedMachineIndex }) => {
  const [cameraZoom, setCameraZoom] = useState(50)
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0 })

  const handleZoomIn = useCallback(() => setCameraZoom((prev) => prev * 1.2), [])
  const handleZoomOut = useCallback(() => setCameraZoom((prev) => prev / 1.2), [])

  useEffect(() => {
    if (selectedMachineIndex !== null && machines[selectedMachineIndex]) {
      const machine = machines[selectedMachineIndex]
      setCameraPosition({ x: machine.x, y: machine.y })
    }
  }, [selectedMachineIndex, machines])

  if (!plan) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
        No plan uploaded
      </div>
    )
  }

  return (
    <div className="w-full h-full relative" style={{ height: 'calc(100vh - 120px)' }}>
      <Canvas orthographic>
        <Scene
          plan={plan}
          machines={machines}
          updateMachinePosition={updateMachinePosition}
          selectedMachineIndex={selectedMachineIndex}
          cameraPosition={cameraPosition}
          cameraZoom={cameraZoom}
        />
      </Canvas>
      <div className="absolute top-4 right-4 flex space-x-2">
        <button onClick={handleZoomIn} className="bg-blue-500 text-white p-2 rounded">+</button>
        <button onClick={handleZoomOut} className="bg-blue-500 text-white p-2 rounded">-</button>
      </div>
    </div>
  )
}

export default PlanViewer