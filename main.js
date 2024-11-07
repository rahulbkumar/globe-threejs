<!DOCTYPE html>
<html>
<!-- Previous HTML structure remains the same -->
<head>
    <title>Globe with Purple Markers</title>
    <style>
        body { 
            margin: 0;
            background-color: #000000;
        }
        canvas { display: block; }
        #info {
            position: absolute;
            top: 10px;
            width: 100%;
            text-align: center;
            color: white;
            font-family: Arial, sans-serif;
        }
    </style>
</head>
<body>
    <div id="info">Interactive World Globe<br/>Click and drag to rotate. Scroll to zoom.</div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        // Previous scene setup remains the same
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // Globe setup
        const geometry = new THREE.SphereGeometry(5, 128, 128);
        const material = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            shininess: 30,
            specular: 0xCCCCCC,
            emissive: 0x111111,
            transparent: true,
            opacity: 0.95
        });

        const globe = new THREE.Mesh(geometry, material);
        scene.add(globe);

        // Atmosphere
        const atmosphereGeometry = new THREE.SphereGeometry(5.2, 128, 128);
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        scene.add(atmosphere);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.3);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xFFFFFF, 1.2);
        pointLight.position.set(10, 10, 10);
        scene.add(pointLight);

        const rimLight = new THREE.PointLight(0xFFFFFF, 0.5);
        rimLight.position.set(-10, 0, -10);
        scene.add(rimLight);

        // Marker container
        const markerContainer = new THREE.Group();
        scene.add(markerContainer);

        // Purple color variations
        const purpleColors = [
            0x9400D3, // Dark Violet
            0x800080, // Purple
            0x9932CC, // Dark Orchid
            0x8B008B, // Dark Magenta
            0x9370DB  // Medium Purple
        ];

        // Generate marker locations
        const markerLocations = [
            // Major cities
            { lat: 40.7128, lon: -74.0060 },    // New York
            { lat: 51.5074, lon: -0.1278 },     // London
            { lat: 35.6762, lon: 139.6503 },    // Tokyo
            { lat: -33.8688, lon: 151.2093 },   // Sydney
            { lat: 28.6139, lon: 77.2090 },     // New Delhi
            { lat: -22.9068, lon: -43.1729 },   // Rio
            { lat: 31.2304, lon: 121.4737 },    // Shanghai
            { lat: -1.2921, lon: 36.8219 },     // Nairobi
            { lat: 48.8566, lon: 2.3522 },      // Paris
            { lat: 55.7558, lon: 37.6173 },     // Moscow
            { lat: -34.6037, lon: -58.3816 },   // Buenos Aires
            { lat: 19.4326, lon: -99.1332 },    // Mexico City
            { lat: 1.3521, lon: 103.8198 },     // Singapore
            { lat: 25.2048, lon: 55.2708 },     // Dubai
            { lat: -26.2041, lon: 28.0473 },    // Johannesburg
            { lat: 37.7749, lon: -122.4194 },   // San Francisco
            { lat: 41.9028, lon: 12.4964 },     // Rome
            { lat: -37.8136, lon: 144.9631 },   // Melbourne
            { lat: 52.5200, lon: 13.4050 },     // Berlin
            { lat: 39.9042, lon: 116.4074 }     // Beijing
        ];

        // Generate additional random markers
        for(let i = 0; i < 80; i++) {
            markerLocations.push({
                lat: (Math.random() * 180 - 90),
                lon: (Math.random() * 360 - 180)
            });
        }

        function latLonToVector3(lat, lon, radius) {
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lon + 180) * (Math.PI / 180);
            return new THREE.Vector3(
                -radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );
        }

        // Create markers
        const markers = [];
        const markerGroups = [];

        markerLocations.forEach((location, index) => {
            const position = latLonToVector3(location.lat, location.lon, 5.2);
            
            const markerGroup = new THREE.Group();
            markerGroup.position.copy(position);
            markerGroup.lookAt(0, 0, 0);
            
            const color = purpleColors[index % purpleColors.length];
            
            const markerGeometry = new THREE.SphereGeometry(0.03, 16, 16);
            const markerMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.8
            });
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            
            const ringGeometry = new THREE.RingGeometry(0.06, 0.08, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.4,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            
            const outerRingGeometry = new THREE.RingGeometry(0.1, 0.12, 32);
            const outerRing = new THREE.Mesh(outerRingGeometry, ringMaterial.clone());
            
            markerGroup.add(marker);
            markerGroup.add(ring);
            markerGroup.add(outerRing);
            
            markerContainer.add(markerGroup);
            markers.push(marker);
            markerGroups.push({
                group: markerGroup,
                rings: [ring, outerRing],
                phase: Math.random() * Math.PI * 2,
                baseColor: color
            });
        });

        // Stars background
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });

        const starsVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = THREE.MathUtils.randFloatSpread(2000);
            const y = THREE.MathUtils.randFloatSpread(2000);
            const z = THREE.MathUtils.randFloatSpread(2000);
            starsVertices.push(x, y, z);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);

        // Camera setup
        camera.position.z = 15;

        // Controls setup
        let mouseDown = false;
        let mouseX = 0;
        let mouseY = 0;
        let rotationSpeed = 0.005;
        let autoRotate = true;

        // Event listeners
        document.addEventListener('mousedown', (e) => {
            mouseDown = true;
            mouseX = e.clientX;
            mouseY = e.clientY;
            autoRotate = false;
        });

        document.addEventListener('mouseup', () => {
            mouseDown = false;
            autoRotate = true;
        });

        document.addEventListener('mousemove', (e) => {
            if (mouseDown) {
                const deltaX = e.clientX - mouseX;
                const deltaY = e.clientY - mouseY;
                
                globe.rotation.y += deltaX * 0.005;
                globe.rotation.x += deltaY * 0.005;
                
                atmosphere.rotation.copy(globe.rotation);
                markerContainer.rotation.copy(globe.rotation);
                
                mouseX = e.clientX;
                mouseY = e.clientY;
            }
        });

        document.addEventListener('wheel', (e) => {
            camera.position.z += e.deltaY * 0.01;
            camera.position.z = Math.max(8, Math.min(20, camera.position.z));
        });

        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            
            const time = Date.now() * 0.001;
            
            // Marker animations
            markerGroups.forEach((markerGroup, index) => {
                const speed = 1 + (index % 3) * 0.5;
                const pulse = Math.sin(time * speed + markerGroup.phase) * 0.5 + 0.5;
                
                markerGroup.rings.forEach((ring) => {
                    ring.scale.x = ring.scale.y = 1 + pulse * 0.3;
                    ring.material.opacity = 0.4 * (1 - pulse);
                });
            });
            
            if (autoRotate) {
                globe.rotation.y += rotationSpeed;
                atmosphere.rotation.copy(globe.rotation);
                markerContainer.rotation.copy(globe.rotation);
            }
            
            stars.rotation.y += rotationSpeed * 0.1;
            
            renderer.render(scene, camera);
        }

        // Handle window resize
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        
        window.addEventListener('resize', onWindowResize, false);
        
        animate();
    </script>
</body>
</html>
