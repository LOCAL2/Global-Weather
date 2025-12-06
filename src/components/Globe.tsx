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

function CameraAnimation({ 
  onComplete, 
  skipAnimation = false 
}: { 
  onComplete?: () => void;
  skipAnimation?: boolean;
}) {
  const { camera } = useThree();
  const startPosition = useRef(new THREE.Vector3(0, 2, 25));
  const targetPosition = useRef(new THREE.Vector3(0, 0, 5));
  const progress = useRef(0);
  const isAnimating = useRef(!skipAnimation);
  const hasCompleted = useRef(false);

  useEffect(() => {
    if (skipAnimation) {
      // ถ้า skip animation ให้ไปที่ตำแหน่งสุดท้ายเลย
      camera.position.copy(targetPosition.current);
      camera.lookAt(0, 0, 0);
      
      // เรียก onComplete ทันที
      if (!hasCompleted.current && onComplete) {
        hasCompleted.current = true;
        onComplete();
      }
    } else {
      camera.position.copy(startPosition.current);
      camera.lookAt(0, 0, 0);
    }
  }, [camera, skipAnimation, onComplete]);

  useFrame((_state, delta) => {
    if (isAnimating.current && progress.current < 1) {
      progress.current += delta * 0.3; // ความเร็วในการบิน
      
      if (progress.current >= 1) {
        progress.current = 1;
        isAnimating.current = false;
        
        // Call onComplete callback when animation finishes
        if (!hasCompleted.current && onComplete) {
          hasCompleted.current = true;
          onComplete();
        }
      }

      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress.current, 3);
      
      camera.position.lerpVectors(startPosition.current, targetPosition.current, eased);
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const sunTexture = useLoader(THREE.TextureLoader, '/8k_sun.jpg');

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0002;
      meshRef.current.rotation.x += 0.0001;
    }
  });

  return (
    <group position={[10, 5, -12]}>
      {/* Main sun body with texture */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial 
          map={sunTexture}
          emissive="#FF6B00"
          emissiveIntensity={1.5}
          roughness={1}
          metalness={0}
          toneMapped={false}
        />
      </mesh>
      
      {/* Directional sun light - creates day/night effect */}
      <directionalLight 
        position={[0, 0, 5]} 
        intensity={2.5} 
        color="#FFA500"
        castShadow
      />
      <pointLight intensity={2} color="#FFA500" distance={40} decay={2} />
    </group>
  );
}

function Moon() {
  const meshRef = useRef<THREE.Mesh>(null);
  const moonTexture = useLoader(THREE.TextureLoader, '/8k_moon.jpg');

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <group position={[-10, -3, -12]}>
      {/* Moon with texture */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshStandardMaterial 
          map={moonTexture}
          roughness={0.9}
          metalness={0}
        />
      </mesh>
      
      {/* Subtle moon light */}
      <pointLight intensity={0.3} color="#B0C4DE" distance={30} decay={2} />
    </group>
  );
}

export default function Globe({ 
  onAnimationComplete, 
  skipAnimation = false 
}: { 
  onAnimationComplete?: () => void;
  skipAnimation?: boolean;
}) {
  return (
    <>
      <OrbitControls enablePan={false} minDistance={3} maxDistance={15} rotateSpeed={0.5} />
      <Stars radius={300} depth={60} count={8000} factor={7} fade speed={1} />
      <ambientLight intensity={0.6} />
      <hemisphereLight intensity={0.5} groundColor="#444444" />

      <Suspense fallback={null}>
        <Earth />
        <Sun />
        <Moon />
      </Suspense>
      
      <CameraAnimation onComplete={onAnimationComplete} skipAnimation={skipAnimation} />
    </>
  );
}
