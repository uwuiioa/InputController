document.addEventListener('DOMContentLoaded', function() {
    const controller = new InputController({
        left: { keys: [37, 65] },    
        right: { keys: [39, 68] },   
        up: { keys: [38, 87] },      
        down: { keys: [40, 83] },     
        jump: { keys: [32], enabled: false } 
    }, document.body);

    const testObject = document.getElementById('test-object');
    let posX = 0;
    let posY = 0;
    const speed = 8;

    // Обработчики событий контроллера
    document.body.addEventListener(controller.ACTION_ACTIVATED, function(e) {
        console.log(`Action activated: ${e.detail.action}`);
    });

    document.body.addEventListener(controller.ACTION_DEACTIVATED, function(e) {
        console.log(`Action deactivated: ${e.detail.action}`);
    });

    // Анимация
    function update() {
        if (controller.isActionActive('left')) {
            posX -= speed;
        }
        if (controller.isActionActive('right')) {
            posX += speed;
        }
        if (controller.isActionActive('up')) {
            posY -= speed;
        }
        if (controller.isActionActive('down')) {
            posY += speed;
        }
        if (controller.isActionActive('jump')) {
            testObject.style.backgroundColor = 'turquoise';
        } else {
            testObject.style.backgroundColor = 'blue';
        }

        testObject.style.transform = `translate(${posX}px, ${posY}px)`;
        requestAnimationFrame(update);
    }

    update();

    // Тестовые кнопки
    document.getElementById('attach-btn').addEventListener('click', function() {
        controller.attach(document.body);
        console.log('Controller attached to body');
    });

    document.getElementById('detach-btn').addEventListener('click', function() {
        controller.detach();
        console.log('Controller detached');
    });

    document.getElementById('enable-btn').addEventListener('click', function() {
        controller.enabled = true;
        console.log('Controller enabled');
    });

    document.getElementById('disable-btn').addEventListener('click', function() {
        controller.enabled = false;
        console.log('Controller disabled');
    });

    document.getElementById('bind-jump-btn').addEventListener('click', function() {
        controller.bindActions({
            jump: { keys: [32], enabled: true } 
        });
        console.log('Jump action bound to Space');
    });

    document.getElementById('enable-jump-btn').addEventListener('click', function() {
        controller.enableAction('jump');
        console.log('Jump action enabled');
    });

    document.getElementById('disable-jump-btn').addEventListener('click', function() {
        controller.disableAction('jump');
        console.log('Jump action disabled');
    });
});