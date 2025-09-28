import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

function Model({ url, mtlUrl }: { url: string; mtlUrl: string }) {
  const meshRef = useRef<THREE.Group>(null);
  
  // Load materials first, then the model
  const materials = useLoader(MTLLoader, mtlUrl);
  const obj = useLoader(OBJLoader, url, (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  // Auto-rotation animation - 180 degrees back and forth
  useFrame((state) => {
    if (meshRef.current) {
      // Rotate between 0 and 180 degrees (0 and π radians)
      meshRef.current.rotation.y = (Math.sin(state.clock.elapsedTime * 0.2) + 1) * Math.PI / 2;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  useEffect(() => {
    if (obj) {
      // Center and scale the model
      const box = new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Center the model
      obj.position.copy(center).multiplyScalar(-1);
      
      // Scale to fit with zoom effect
      const maxSize = Math.max(size.x, size.y, size.z);
      const scale = 3.5 / maxSize; // Increased from 2 to 3.5 for zoom effect
      obj.scale.setScalar(scale);
    }
  }, [obj]);

  return (
    <group ref={meshRef}>
      <primitive object={obj} />
    </group>
  );
}

interface Model3DProps {
  className?: string;
  autoRotate?: boolean;
}

export default function Model3D({ className = "", autoRotate = true }: Model3DProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Model url="/models/untitled.obj" mtlUrl="/models/untitled.mtl" />
        
        {autoRotate && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
          />
        )}
        
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}