// generative-bg.js
(function() {
    // 1. Canvas elementini koda dokunmadan dinamik olarak oluştur
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '1'; // Arayüzün (10) ve CRT efektinin (2) arkasında kalacak
    canvas.style.pointerEvents = 'none'; // Etkileşimi engellememesi için
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    let width, height;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        // Retina ekranlar için keskinlik ayarı
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resize);
    resize();

    // 2. Stokastik Düğümler (Nodlar)
    const nodes = [];
    const nodeCount = Math.floor((width * height) / 15000); // Ekran boyutuna göre performanslı node sayısı

    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            baseSize: Math.random() * 2 + 1
        });
    }

    // Sistemin mevcut neon yeşil rengi
    const themeColor = 'rgba(51, 255, 0, 0.15)'; 

    // 3. Performans dostu render döngüsü
    function render() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < nodes.length; i++) {
            let n = nodes[i];
            
            // Stokastik sürüklenme
            n.x += n.vx;
            n.y += n.vy;

            // Ekran sınırlarından sekme
            if (n.x < 0 || n.x > width) n.vx *= -1;
            if (n.y < 0 || n.y > height) n.vy *= -1;

            // PS1 tarzı vertex snapping (Köşeleri belirli gridlere oturtarak retro titreme efekti verir)
            let snappedX = Math.floor(n.x / 4) * 4;
            let snappedY = Math.floor(n.y / 4) * 4;

            // Çizgileri bağla
            for (let j = i + 1; j < nodes.length; j++) {
                let n2 = nodes[j];
                let dx = n.x - n2.x;
                let dy = n.y - n2.y;
                let distSq = dx * dx + dy * dy;

                if (distSq < 12000) {
                    let snappedX2 = Math.floor(n2.x / 4) * 4;
                    let snappedY2 = Math.floor(n2.y / 4) * 4;
                    
                    let opacity = 1 - (distSq / 12000);
                    ctx.beginPath();
                    ctx.moveTo(snappedX, snappedY);
                    ctx.lineTo(snappedX2, snappedY2);
                    ctx.strokeStyle = `rgba(51, 255, 0, ${opacity * 0.3})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            // Düğümleri çiz
            ctx.fillStyle = themeColor;
            ctx.fillRect(snappedX, snappedY, n.baseSize, n.baseSize);
        }

        requestAnimationFrame(render);
    }

    render();
})();
