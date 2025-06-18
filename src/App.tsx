// src/App.tsx
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

// Modelo simplificado de remera - en un proyecto real usarías un modelo GLTF/OBJ
const TShirtModel = ({ color, decalTexture }: { color: string, decalTexture?: THREE.Texture }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      // Rotación suave continua para demostración
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      {/* Cuerpo de la remera */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 1.6, 0.05]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
      </mesh>
      
      {/* Mangas */}
      <mesh position={[-0.7, 0.1, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.6, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.7, 0.1, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.6, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Cuello */}
      <mesh position={[0, 0.8, 0]}>
        <torusGeometry args={[0.3, 0.05, 16, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Estampado */}
      {decalTexture && (
        <mesh position={[0, 0.1, 0.026]}>
          <planeGeometry args={[0.8, 0.8]} />
          <meshStandardMaterial 
            map={decalTexture} 
            transparent={true} 
            opacity={0.9}
            depthTest={false}
          />
        </mesh>
      )}
    </mesh>
  );
};

const ColorPalette = ({ colors, onSelect }: { colors: string[], onSelect: (color: string) => void }) => (
  <div className="color-palette">
    {colors.map((color, index) => (
      <button 
        key={index} 
        className="color-swatch" 
        style={{ backgroundColor: color }}
        onClick={() => onSelect(color)}
        aria-label={`Seleccionar color ${color}`}
      />
    ))}
  </div>
);

const ImageUploader = ({ onImageUpload }: { onImageUpload: (texture: THREE.Texture) => void }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const image = new Image();
        image.src = event.target?.result as string;
        image.onload = () => {
          const texture = new THREE.Texture(image);
          texture.needsUpdate = true;
          onImageUpload(texture);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="image-uploader">
      <label htmlFor="file-upload" className="upload-button">
        Subir Imagen
      </label>
      <input 
        id="file-upload" 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
      />
    </div>
  );
};

const App = () => {
  const [tshirtColor, setTshirtColor] = useState('#3498db');
  const [decalTexture, setDecalTexture] = useState<THREE.Texture | null>(null);
  const modelRef = useRef<THREE.Group>(null);
  
  const colorPalette = [
    '#3498db', '#e74c3c', '#2ecc71', '#f1c40f', 
    '#9b59b6', '#1abc9c', '#e67e22', '#34495e',
    '#d35400', '#16a085', '#27ae60', '#2980b9'
  ];
  
  const rotateModel = (direction: 'left' | 'right') => {
    if (modelRef.current) {
      const rotation = direction === 'left' ? 0.2 : -0.2;
      modelRef.current.rotation.y += rotation;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Diseñador de Remeras 3D</h1>
        <p>Crea tu diseño personalizado en tiempo real</p>
      </header>
      
      <div className="designer-container">
        <div className="controls-panel">
          <h2>Personaliza tu remera</h2>
          
          <div className="control-section">
            <h3>Color de la remera</h3>
            <ColorPalette colors={colorPalette} onSelect={setTshirtColor} />
            <div className="current-color" style={{ backgroundColor: tshirtColor }}>
              Color seleccionado
            </div>
          </div>
          
          <div className="control-section">
            <h3>Estampado</h3>
            <ImageUploader onImageUpload={setDecalTexture} />
            <p className="hint">Sube una imagen para estampar en el frente</p>
          </div>
          
          <div className="control-section">
            <h3>Rotar modelo</h3>
            <div className="rotation-controls">
              <button className="rotate-btn" onClick={() => rotateModel('left')}>
                ← Girar izquierda
              </button>
              <button className="rotate-btn" onClick={() => rotateModel('right')}>
                Girar derecha →
              </button>
            </div>
          </div>
        </div>
        
        <div className="viewer-container">
          <div className="canvas-wrapper">
            <Canvas shadows>
              <PerspectiveCamera makeDefault position={[0, 0, 3]} />
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
              <pointLight position={[-10, -10, -10]} intensity={0.5} />
              
              <group ref={modelRef} position={[0, -0.2, 0]}>
                <TShirtModel color={tshirtColor} decalTexture={decalTexture || undefined} />
              </group>
              
              <OrbitControls 
                enableZoom={true} 
                enablePan={false} 
                minPolarAngle={Math.PI / 4} 
                maxPolarAngle={Math.PI / 1.5} 
              />
              <Environment preset="city" />
              <gridHelper args={[5, 20, '#444', '#222']} position={[0, -1.5, 0]} />
            </Canvas>
          </div>
          
          <div className="preview-info">
            <div className="color-preview" style={{ backgroundColor: tshirtColor }}></div>
            <p>Vista previa de tu diseño</p>
          </div>
        </div>
      </div>
      
      <div className="actions">
        <button className="save-btn">Guardar diseño</button>
        <button className="export-btn">Exportar a imagen</button>
      </div>
      
      <footer className="footer">
        <p>Diseñador de remeras 3D • Creado con React, TypeScript y Three.js</p>
      </footer>
    </div>
  );
};

export default App;