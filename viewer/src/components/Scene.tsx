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


        const shipModels: THREE.Object3D[] = [];
        // GLTF Loading
        const manager = new THREE.LoadingManager()
        const loader = new GLTFLoader(manager);

        const loadStarships = async () => {
            const data = await fetch("http://localhost:6969/starships").then(
                (ships) => ships.json()
            );

            manager.onLoad = () => {
                console.log("All models loaded!");
    
                const numModels = shipModels.length;  // Number of models loaded
                const radius = 10; // Radius of the circle
                const angleStep = (2 * Math.PI) / numModels;  // Angle step to distribute models evenly
            
                // Calculate and set positions for each model in the array
                for (let i = 0; i < numModels; i++) {
                    const model = shipModels[i];
            
                    // Calculate the position for each model inside the onLoad callback
                    const angle = i * angleStep;
                    const x = radius * Math.cos(angle); // X position using cosine
                    const z = radius * Math.sin(angle); // Z position using sine
            
                    model.position.set(x, 0, z); // Set position (y is kept as 0)
                    scene.add(model); // Add the model to the scene after positioning
                    console.log(`Model ${i + 1} positioned at:`, model.position);
                }
            };

// some bumfuckery here
            // console.log(data.starships.length);
            for (let i = 0; i < data.starships.length; i++) {
                console.log(i);
                // console.log(starship);
                loader.load(
                    "/3D_Assets/mothership.gltf", // Ensure this path is correct
                    (gltf) => {
                        const model = gltf.scene
                        console.log("loading new model!!")
                        model.scale.set(5, 2, 2); // Adjust scale if necessary
                        model.position.set(2, 0, 0); // Adjust position if necessary
                        shipModels.push(model); // Store the loaded modes
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
                )
            };
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
            "/constellation-background.png"
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
            if (shipModels) {
                for (let i = 0; i < shipModels.length; i++) {
                    shipModels[i].rotation.y += 0.01;
                }
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
