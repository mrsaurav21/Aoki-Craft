// src/FurnitureRoom3D.jsx
import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  TransformControls,
  useGLTF,
  Loader,
} from "@react-three/drei";
import * as THREE from "three";
import "./FurnitureRoom3D.css"; // Make sure to import the CSS

// --- Constants ---
const MODEL_PATHS = {
  chair: "/models/chair.glb",
  table: "/models/table.glb",
  bed: "/models/bed1.glb",
};

// --- Helper Components ---
function GLTFModel({ url, scale = 1, ...props }) {
  const gltf = useGLTF(url, true);
  const cloned = gltf.scene.clone();

  // Fix bounding box center
  const box = new THREE.Box3().setFromObject(cloned);
  const lowestPointY = box.min.y;
  cloned.position.y += -lowestPointY;

  return <primitive object={cloned} scale={scale} {...props} />;
}

function Room({ width, depth, height }) {
  return (
    <group>
      {/* Back Wall */}
      <mesh position={[0, height / 2, -depth / 2]} receiveShadow>
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-width / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[0.1, height, depth]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      {/* Right Wall */}
      <mesh position={[width / 2, height / 2, 0]} receiveShadow>
        <boxGeometry args={[0.1, height, depth]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
    </group>
  );
}

function PlacedItem({ item, isSelected, onSelect, transformRef, onTransformChange }) {
  const meshRef = useRef();

  useEffect(() => {
    if (!transformRef.current) return;
    const ctrl = transformRef.current;
    const obj = meshRef.current;
    
    if (isSelected) {
        ctrl.attach(obj);
    }

    function handleChange() {
      const m = meshRef.current;
      if (!m) return;
      onTransformChange(item.id, {
        position: [m.position.x, m.position.y, m.position.z],
        rotation: [m.rotation.x, m.rotation.y, m.rotation.z],
        scale: [m.scale.x, m.scale.y, m.scale.z],
      });
    }

    ctrl.addEventListener("objectChange", handleChange);
    return () => {
      ctrl.removeEventListener("objectChange", handleChange);
      if (!isSelected && ctrl.object === obj) {
        ctrl.detach();
      }
    };
  }, [transformRef, item.id, onTransformChange, isSelected]);

  return (
    <group
      ref={meshRef}
      position={item.position}
      rotation={item.rotation}
      scale={item.scale}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect(item.id);
      }}
      castShadow
      receiveShadow
    >
      <Suspense fallback={null}>
        <GLTFModel url={MODEL_PATHS[item.type]} scale={item.modelScale || 1} />
      </Suspense>
    </group>
  );
}

const PreviewGltf = ({ type, position }) => {
  if (!type) return null;
  return (
    <group position={position}>
      <GLTFModel url={MODEL_PATHS[type]} />
    </group>
  );
};

// --- Main Component ---
export default function FurnitureRoom3D() {
  // State
  const [roomW, setRoomW] = useState(6);
  const [roomD, setRoomD] = useState(4);
  const [roomH, setRoomH] = useState(3);
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [previewPos, setPreviewPos] = useState([0, 0, 0]);
  const [snap, setSnap] = useState(0.25);

  // Refs
  const transformRef = useRef();
  const orbitRef = useRef();
  const floorRef = useRef();

  // OrbitControls Fix
  useEffect(() => {
    if (!transformRef.current || !orbitRef.current) return;
    const controls = transformRef.current;
    const orbit = orbitRef.current;

    const handleDrag = (event) => {
        orbit.enabled = !event.value;
    };
    controls.addEventListener('dragging-changed', handleDrag);
    return () => controls.removeEventListener('dragging-changed', handleDrag);
  }, []);

  // Logic
  function addItem(type, position = [0, 0, 0]) { 
    const id = `${type}_${Date.now()}`;
    setItems((p) => [
      ...p,
      { id, type, position, rotation: [0, 0, 0], scale: [1, 1, 1], modelScale: 1 },
    ]);
    setSelectedId(id);
  }

  function removeSelected() {
    if (!selectedId) return;
    setItems((p) => p.filter((it) => it.id !== selectedId));
    setSelectedId(null);
  }

  function onTransformChange(id, patch) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  // Drag & Drop Logic
  function startDrag(type, e) {
    e.preventDefault();
    setDragging({ type });
    setPreviewPos([0, 0, 0]);
  }

  function handleCanvasPointerMove(e) {
    if (!dragging) return;
    // Raycasting logic happens automatically in e.point
    const px = Math.round(e.point.x / snap) * snap;
    const pz = Math.round(e.point.z / snap) * snap;
    setPreviewPos([px, 0, pz]);
  }

  function handleCanvasPointerUp() {
    if (!dragging) return;
    addItem(dragging.type, previewPos);
    setDragging(null);
  }

  function handleCanvasPointerDown() {
    if (transformRef.current && !transformRef.current.dragging) {
      setSelectedId(null);
    }
  }

  useEffect(() => {
    function handleMouseUp() {
      if (dragging) setDragging(null);
    }
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [dragging]);

  useEffect(() => {
    if (!selectedId && transformRef.current) {
        transformRef.current.detach();
    }
  }, [selectedId]);


  return (
    <div className="app-container">
      {/* --- Sidebar --- */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Room Planner</h2>
        </div>

        <div className="sidebar-content">
          {/* Room Dimensions */}
          <div className="control-group">
            <span className="control-label">Dimensions</span>
            <div className="input-row">
              <label>Width (m)</label>
              <input className="styled-input" type="number" value={roomW} step="0.5" onChange={(e) => setRoomW(Number(e.target.value) || 1)} />
            </div>
            <div className="input-row">
              <label>Depth (m)</label>
              <input className="styled-input" type="number" value={roomD} step="0.5" onChange={(e) => setRoomD(Number(e.target.value) || 1)} />
            </div>
            <div className="input-row">
              <label>Height (m)</label>
              <input className="styled-input" type="number" value={roomH} step="0.1" onChange={(e) => setRoomH(Number(e.target.value) || 1)} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="control-group">
            <span className="control-label">Quick Add</span>
            <div className="button-group">
              <button className="btn" onClick={() => addItem("chair")}>+ Chair</button>
              <button className="btn" onClick={() => addItem("table")}>+ Table</button>
              <button className="btn" onClick={() => addItem("bed")}>+ Bed</button>
            </div>
          </div>

          {/* Items List */}
          <div className="control-group">
            <span className="control-label">Scene Items</span>
            {items.length === 0 ? (
                <div style={{color: '#999', fontSize: '0.85rem', fontStyle:'italic'}}>No items placed yet.</div>
            ) : (
                <div className="item-list">
                {items.map((it) => (
                    <div
                    key={it.id}
                    className={`list-item ${it.id === selectedId ? 'selected' : ''}`}
                    onClick={() => setSelectedId(it.id)}
                    >
                    <span>{it.type}</span>
                    <span style={{fontSize: '0.7rem', opacity: 0.5}}>ID: {it.id.slice(-4)}</span>
                    </div>
                ))}
                </div>
            )}
            
            <div className="button-group" style={{marginTop: 10}}>
                <button className="btn btn-danger" onClick={removeSelected} disabled={!selectedId}>Delete Selected</button>
                <button className="btn" style={{color: '#666'}} onClick={() => setItems([])}>Clear All</button>
            </div>
          </div>

          <div className="hint-text">
            <strong>Controls:</strong><br/>
            • Click item to select.<br/>
            • <strong>W</strong> to Move<br/>
            • <strong>E</strong> to Rotate<br/>
            • Drag from bottom dock to place.
          </div>
        </div>
      </div>

      {/* --- Canvas Area --- */}
      <div className="canvas-wrapper">
        <Canvas
          shadows
          camera={{ position: [5, 4, 6], fov: 50 }}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          onPointerDown={handleCanvasPointerDown}
        >
          <ambientLight intensity={0.6} />
          <directionalLight castShadow position={[6, 10, 6]} intensity={0.8} shadow-mapSize={[2048, 2048]} />

          <group>
            {/* Floor */}
            <mesh ref={floorRef} rotation-x={-Math.PI / 2} receiveShadow>
              <planeGeometry args={[roomW, roomD]} />
              <meshStandardMaterial color="#f0f0f0" />
            </mesh>

            <Room width={roomW} depth={roomD} height={roomH} />
            <gridHelper args={[Math.max(roomW, roomD), Math.max(1, Math.round(Math.max(roomW, roomD) / (snap || 1)))]} position={[0, 0.01, 0]} />

            <Suspense fallback={null}>
              <group>
                {items.map((it) => (
                  <PlacedItem
                    key={it.id}
                    item={it}
                    isSelected={it.id === selectedId}
                    onSelect={setSelectedId}
                    transformRef={transformRef}
                    onTransformChange={onTransformChange}
                  />
                ))}
              </group>
              {dragging && <PreviewGltf type={dragging.type} position={previewPos} />}
            </Suspense>

            <TransformControls 
                ref={transformRef} 
                mode="translate" 
                size={0.8} 
                rotationSnap={Math.PI / 4} 
                showY={false} 
                showRx={false} 
                showRz={false}
            />
            <OrbitControls ref={orbitRef} makeDefault /> 
          </group>
        </Canvas>

        {/* --- Floating Dock (Drag Sources) --- */}
        <div className="floating-dock">
          {["chair", "table", "bed"].map((t) => (
            <div
              key={t}
              className="drag-card"
              onPointerDown={(e) => startDrag(t, e)}
            >
              {/* Simple visual placeholders for icons */}
              <div className="drag-icon" style={{
                  background: t === 'chair' ? '#ffedd5' : t === 'table' ? '#dbeafe' : '#e0e7ff'
              }} />
              <div className="drag-label">{t}</div>
            </div>
          ))}
        </div>

        {/* --- Top Right HUD --- */}
        <div className="hud-info">
          <label style={{marginRight: 8, fontSize: '0.8rem', color: '#666'}}>Grid Snap:</label>
          <input 
            type="number" 
            className="styled-input" 
            style={{width: 50, padding: '4px'}}
            value={snap} 
            step="0.05" 
            onChange={(e) => setSnap(Number(e.target.value) || 0)} 
          />
        </div>

        <Loader />
      </div>
    </div>
  );
}