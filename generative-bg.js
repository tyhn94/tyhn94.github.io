// generative-bg.js
(function() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '1';
    canvas.style.pointerEvents = 'none';
    
    // Bu kural, düşük çözünürlüklü piksellerin bulanıklaşmadan keskin (retro) görünmesini sağlar
    canvas.style.imageRendering = 'pixelated';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    
    // Piksellerin ekranda ne kadar iri görüneceğini belirler (değer büyüdükçe pikseller büyür)
    const PIXEL_SCALE = 16; 
    let cols, rows;

    function resize() {
        // Performans için iç çözünürlüğü kasten düşük hesaplıyoruz
        cols = Math.ceil(window.innerWidth / PIXEL_SCALE);
        rows = Math.ceil(window.innerHeight / PIXEL_SCALE);
        canvas.width = cols;
        canvas.height = rows;
    }
    window.addEventListener('resize', resize);
    resize();

    // Stokastik parametrelerle hareket eden görünmez "hücre" merkezleri
    const cells = [];
    const numCells = 15; // Ekranda kayan amorf şekillerin sayısı

    for (let i = 0; i < numCells; i++) {
        cells.push({
            x: Math.random() * (window.innerWidth / PIXEL_SCALE),
            y: Math.random() * (window.innerHeight / PIXEL_SCALE),
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            radius: Math.random() * 4 + 3
        });
    }

    function render() {
        ctx.clearRect(0, 0, cols, rows);

        // Hücrelerin pozisyonlarını sürekli güncelle
        for (let i = 0; i < cells.length; i++) {
            let c = cells[i];
            c.x += c.vx;
            c.y += c.vy;

            // Hücreler sınırların biraz dışına çıkıp geri dönsün
            if (c.x < -10 || c.x > cols + 10) c.vx *= -1;
            if (c.y < -10 || c.y > rows + 10) c.vy *= -1;
        }

        // Piksel gridi üzerinde yoğunluk (metaball) hesaplaması
        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                let sum = 0;
                
                for (let i = 0; i < cells.length; i++) {
                    let dx = x - cells[i].x;
                    let dy = y - cells[i].y;
                    let distSq = dx * dx + dy * dy;
                    
                    // Sıfıra bölme hatasını engellemek için distSq değerini minimum 0.1 tutuyoruz
                    sum += (cells[i].radius * cells[i].radius) / Math.max(0.1, distSq);
                }

                // Eşik (threshold) değerlerine göre pikselleri çiz (amorf ve bloklu yapı)
                if (sum > 1.0) {
                    // Merkeze yakın pikseller daha parlak, dışarıdakiler daha soluk
                    ctx.fillStyle = sum > 1.8 ? 'rgba(51, 255, 0, 0.4)' : 'rgba(51, 255, 0, 0.15)';
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }

        requestAnimationFrame(render);
    }

    render();
})();
