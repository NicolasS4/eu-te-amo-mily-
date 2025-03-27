document.addEventListener('DOMContentLoaded', function() {
    // Elementos
    const dayScene = document.getElementById('dayScene');
    const nightScene = document.getElementById('nightScene');
    const nightBtn = document.getElementById('nightBtn');
    const dayBtn = document.getElementById('dayBtn');
    const physicsHearts = document.getElementById('physics-hearts');
    const interactiveSky = document.getElementById('interactive-sky');
    const starsContainer = document.getElementById('stars-container');
    const daysCounter = document.getElementById('daysCounter');
    const youtubePlayer = document.getElementById('youtubePlayer');

    // Data do primeiro encontro (6 de outubro de 2024 às 17:00)
    const firstDate = new Date(2024, 9, 6, 17, 0, 0);
    
    // Atualizar contador de dias
    function updateDaysCounter() {
        const today = new Date();
        const diffTime = today - firstDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        daysCounter.textContent = `${diffDays} dias de felicidade desde nosso primeiro encontro`;
    }
    
    updateDaysCounter();
    setInterval(updateDaysCounter, 3600000); // Atualiza a cada hora

    // Configuração da física dos corações
    const Engine = Matter.Engine,
          Render = Matter.Render,
          World = Matter.World,
          Bodies = Matter.Bodies;

    // Criar engine de física
    const engine = Engine.create({
        enableSleeping: true
    });

    // Configurar renderização
    const render = Render.create({
        element: physicsHearts,
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false,
            background: 'transparent',
            showAngleIndicator: false
        }
    });

    // Criar paredes invisíveis
    const wallOptions = { 
        isStatic: true, 
        render: { visible: false },
        collisionFilter: { group: -1 }
    };
    
    const ground = Bodies.rectangle(
        window.innerWidth/2, 
        window.innerHeight + 50, 
        window.innerWidth, 
        100, 
        wallOptions
    );
    
    const leftWall = Bodies.rectangle(
        -50, 
        window.innerHeight/2, 
        100, 
        window.innerHeight, 
        wallOptions
    );
    
    const rightWall = Bodies.rectangle(
        window.innerWidth + 50, 
        window.innerHeight/2, 
        100, 
        window.innerHeight, 
        wallOptions
    );

    World.add(engine.world, [ground, leftWall, rightWall]);
    Engine.run(engine);
    Render.run(render);

    // Criar corações com física
    function createHeart() {
        const heartDiv = document.createElement('div');
        heartDiv.className = 'heart';
        physicsHearts.appendChild(heartDiv);
        
        const heartBody = Bodies.circle(
            Math.random() * window.innerWidth, 
            -50, 
            15, 
            {
                restitution: 0.7,
                friction: 0.001,
                render: {
                    visible: false
                },
                collisionFilter: {
                    group: 0
                }
            }
        );
        
        World.add(engine.world, heartBody);
        
        // Atualizar posição do coração visual
        Matter.Events.on(engine, 'afterUpdate', function() {
            heartDiv.style.left = (heartBody.position.x - 15) + 'px';
            heartDiv.style.top = (heartBody.position.y - 15) + 'px';
            heartDiv.style.transform = `rotate(-45deg)`;
        });
        
        // Remover corações que saem da tela
        Matter.Events.on(engine, 'afterUpdate', function() {
            if(heartBody.position.y > window.innerHeight + 100) {
                World.remove(engine.world, heartBody);
                heartDiv.remove();
            }
        });
    }

    // Criar estrelas fixas
    function createStars() {
        starsContainer.innerHTML = '';
        
        for(let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + 'vw';
            star.style.top = Math.random() * 100 + 'vh';
            star.style.width = (Math.random() * 3 + 1) + 'px';
            star.style.height = star.style.width;
            star.style.animationDelay = Math.random() * 2 + 's';
            starsContainer.appendChild(star);
        }
    }

    // Criar estrela cadente
    function createShootingStar(x, y) {
        const shootingStar = document.createElement('div');
        shootingStar.className = 'shooting-star';
        shootingStar.style.left = x + 'px';
        shootingStar.style.top = y + 'px';
        starsContainer.appendChild(shootingStar);
        
        let posX = x;
        let posY = y;
        let angle = Math.random() * Math.PI/4 + Math.PI/4;
        let speed = 15;
        let length = 0;
        
        function animate() {
            posX += Math.cos(angle) * speed;
            posY += Math.sin(angle) * speed;
            length += speed;
            
            shootingStar.style.left = posX + 'px';
            shootingStar.style.top = posY + 'px';
            
            if(posX > window.innerWidth + 100 || posY > window.innerHeight + 100 || length > 1000) {
                shootingStar.remove();
            } else {
                requestAnimationFrame(animate);
            }
        }
        
        animate();
    }

    // Interação com o céu noturno
    interactiveSky.addEventListener('click', function(e) {
        createShootingStar(e.clientX, e.clientY);
    });

    // Eventos dos botões
    nightBtn.addEventListener('click', function() {
        dayScene.style.opacity = '0';
        dayScene.style.pointerEvents = 'none';
        
        setTimeout(() => {
            nightScene.style.opacity = '1';
            nightScene.style.pointerEvents = 'all';
            
            // Pausar corações na cena noturna
            physicsHearts.style.display = 'none';
            
            // Iniciar música
            youtubePlayer.src = "https://www.youtube.com/embed/MOXgTIikrns?autoplay=1&loop=1&playlist=MOXgTIikrns";
            
            // Criar estrelas
            createStars();
        }, 1000);
    });

    dayBtn.addEventListener('click', function() {
        nightScene.style.opacity = '0';
        nightScene.style.pointerEvents = 'none';
        
        setTimeout(() => {
            dayScene.style.opacity = '1';
            dayScene.style.pointerEvents = 'all';
            
            // Retomar corações
            physicsHearts.style.display = 'block';
        }, 1000);
    });

    // Iniciar chuva de corações
    setInterval(createHeart, 800);

    // Redimensionamento
    window.addEventListener('resize', function() {
        render.options.width = window.innerWidth;
        render.options.height = window.innerHeight;
        render.canvas.width = window.innerWidth;
        render.canvas.height = window.innerHeight;
        
        // Reposicionar paredes
        Matter.Body.setPosition(ground, { 
            x: window.innerWidth/2, 
            y: window.innerHeight + 50 
        });
        Matter.Body.setPosition(rightWall, { 
            x: window.innerWidth + 50, 
            y: window.innerHeight/2 
        });
    });
});
