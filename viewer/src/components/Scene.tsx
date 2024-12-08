import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ArcballControls } from "three/addons/controls/ArcballControls.js";

const Scene: React.FC = () => {
    // Get a reference to the surrounding div
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log("useEffect triggered");
        // Check that div is mounted before processing anything
        const mount = mountRef.current;
        if (!mount) return;

        // Set up camera, scene, renderer & attach to dom
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        const controls = new ArcballControls(
            camera,
            renderer.domElement,
            scene
        );

        const controlsConfig = {
            maxDistance: 80,
            minDistance: 1,
            enableGrid: true,

            // Add other properties as needed
        };

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

        // Apply configuration to controls
        Object.assign(controls, controlsConfig);
        controls.setGizmosVisible(false);

        const light = new THREE.AmbientLight(0x404040, 22); // soft white light
        scene.add(light);

        mount.appendChild(renderer.domElement);

        let gltfModel: THREE.Group = null;
        let shipModels: THREE.Group[] = [];
        // GLTF Loading
        const loader = new GLTFLoader();

        const loadStarships = async () => {
            const data = await fetch("http://localhost:6969/starships").then(
                (ships) => ships.json()
            );
// some bumfuckery here
            data.starships.forEach((starship) => {
                // console.log(starship);
                loader.load(
                    "/3D_Assets/mothership.gltf", // Ensure this path is correct
                    (gltf) => {
                        shipModels.push(gltf.scene); // Store the loaded modes
                        scene.add(shipModels);
                        console.log("Mothership loaded successfully");
                    },
                    (xhr) => {
                        console.log(
                            (xhr.loaded / xhr.total) * 100 + "% loaded"
                        );
                    },
                    (error) => {
                        console.error("An error happened", error);
                    }
                );
            });
        };

        loadStarships();

        // somehow make the loadstarships stuff work to generate a starship per thing

        // Ref cube for comparison
        const refCube = new THREE.Mesh(
            new THREE.BoxGeometry(),
            new THREE.MeshStandardMaterial({ color: 0x00ff00 })
        );
        scene.add(refCube);

        // Background Texture
        const spaceTexture = new THREE.TextureLoader().load(
            "https://images.unsplash.com/photo-1557683316-973673baf926"
        );
        scene.background = spaceTexture;

        function onPointerMove(event) {
            // calculate pointer position in normalized device coordinates
            // (-1 to +1) for both components

            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }

        // Set up animation
        const animate = () => {
            // update the picking ray with the camera and pointer position
            raycaster.setFromCamera(pointer, camera);

            // calculate objects intersecting the picking ray
            const intersects = raycaster.intersectObjects(scene.children);

            for (let i = 0; i < intersects.length; i++) {
                intersects[i].object.material.color.set(0xff0000);
            }

            // Rotate the reference cube
            refCube.rotation.x += 0.01;
            refCube.rotation.y += 0.01;

            // Rotate the GLTF model (if it has been loaded)
            if (shipModels[0]) {
                shipModels[0].rotation.x += 0.01;
                // gltfModel.rotation.y += 0.01;
            }
            // controls.update();
            renderer.render(scene, camera);
        };

        window.addEventListener("pointermove", onPointerMove);

        renderer.setAnimationLoop(animate);

        // Window resizing
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener("resize", handleResize);

        // Clean up previous render on reload
        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("pointermove", onPointerMove);
            mount.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} className="w-full h-full" />;
};

export default Scene;
