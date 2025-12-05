import { useRef, Suspense, useEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [colorMap, bumpMap] = useLoader(THREE.TextureLoader, [
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    'https://unpkg.com/three-globe/example/img/earth-topology.png',
  ]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial map={colorMap} bumpMap={bumpMap} bumpScale={0.05} />
    </mesh>
  );
}

function CameraAnimation() {
  const { camera } = useThree();
  const startPosition = useRef(new THREE.Vector3(0, 2, 25));
  const targetPosition = useRef(new THREE.Vector3(0, 0, 5));
  const progress = useRef(0);
  const isAnimating = useRef(true);

  useEffect(() => {
    camera.position.copy(startPosition.current);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useFrame((_state, delta) => {
    if (isAnimating.current && progress.current < 1) {
      progress.current += delta * 0.3; // ความเร็วในการบิน
      
      if (progress.current >= 1) {
        progress.current = 1;
        isAnimating.current = false;
      }

      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress.current, 3);
      
      camera.position.lerpVectors(startPosition.current, targetPosition.current, eased);
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

export default function Globe() {
  return (
    <>
      <OrbitControls enablePan={false} minDistance={3} maxDistance={15} rotateSpeed={0.5} />
      <Stars radius={300} depth={60} count={8000} factor={7} fade speed={1} />
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={2} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      <Suspense fallback={null}>
        <Earth />
      </Suspense>
      
      <CameraAnimation />
    </>
  );
}
