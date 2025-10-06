document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('electric-canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Configuration
    let config = {
        particleCount: 150,
        baseSpeed: 1,
        intensity: 0.5,
        connectionDistance: 150,
        particleSize: 2,
        colorTheme: 0,
        colors: [
            ['#00ffff', '#0080ff', '#00ff80'],
            ['#ff00ff', '#8000ff', '#ff0080'],
            ['#00ff00', '#80ff00', '#008000'],
            ['#ff0000', '#ff8000', '#800000']
        ]
    };
    
    // Particles array
    let particles = [];
    let mouse = {
        x: null,
        y: null,
        radius: 100
    };
    
    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * config.particleSize + 1;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 1;
            this.speedX = Math.random() * config.baseSpeed - config.baseSpeed/2;
            this.speedY = Math.random() * config.baseSpeed - config.baseSpeed/2;
            this.hue = config.colors[config.colorTheme][Math.floor(Math.random() * config.colors[config.colorTheme].length)];
            this.alpha = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            // Move particles
            this.x += this.speedX * config.intensity;
            this.y += this.speedY * config.intensity;
            
            // Bounce off walls
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            
            // Mouse interaction
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    // Repel particles from mouse
                    let force = (mouse.radius - distance) / mouse.radius;
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let directionX = forceDirectionX * force * this.density * 0.6;
                    let directionY = forceDirectionY * force * this.density * 0.6;
                    
                    this.speedX -= directionX;
                    this.speedY -= directionY;
                }
            }
            
            // Friction
            this.speedX *= 0.98;
            this.speedY *= 0.98;
        }
        
        draw() {
            ctx.fillStyle = this.hue;
            ctx.globalAlpha = this.alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    // Create particles
    function initParticles() {
        particles = [];
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    // Connect particles with lines
    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < config.connectionDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = particles[i].hue;
                    ctx.globalAlpha = 0.1 * (1 - distance / config.connectionDistance);
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        }
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        
        // Connect particles
        connectParticles();
        
        requestAnimationFrame(animate);
    }
    
    // Mouse event handlers
    canvas.addEventListener('mousemove', function(e) {
        mouse.x = e.x;
        mouse.y = e.y;
    });
    
    canvas.addEventListener('mouseleave', function() {
        mouse.x = null;
        mouse.y = null;
    });
    
    canvas.addEventListener('click', function(e) {
        // Create burst effect on click
        for (let i = 0; i < 10; i++) {
            let particle = new Particle();
            particle.x = e.x;
            particle.y = e.y;
            particle.speedX = (Math.random() - 0.5) * 10;
            particle.speedY = (Math.random() - 0.5) * 10;
            particle.size = Math.random() * 3 + 1;
            particles.push(particle);
        }
        
        // Limit particles count
        if (particles.length > config.particleCount + 50) {
            particles.splice(0, 10);
        }
    });
    
    // Initialize
    initParticles();
    animate();
});