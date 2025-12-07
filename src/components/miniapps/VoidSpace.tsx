"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function VoidSpace() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Setup Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.002);

    // Setup Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 50;

    // Setup Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 1. Wired Torus Knot
    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    // 2. Inner Glowing Core
    const coreGeo = new THREE.IcosahedronGeometry(4, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // 3. Particles / Data Bits
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 2000;
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
    });
    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);

    // Animation Loop
    let frameId: number;
    let mouseX = 0;
    let mouseY = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      // Rotations
      torusKnot.rotation.x += 0.01;
      torusKnot.rotation.y += 0.01;

      core.rotation.x -= 0.02;
      core.rotation.y -= 0.02;

      particlesMesh.rotation.y += 0.002;

      // Mouse Parallax
      camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Event Listeners
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX / window.innerWidth - 0.5;
      mouseY = event.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      container.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute top-0 left-0 w-full h-full z-0 bg-black" />;
}
