document.addEventListener('DOMContentLoaded', () => {
    const controller = new InputController();
    
    const keyboardPlugin = new KeyboardPlugin({
        left: { keys: [37, 65], enabled: true },    
        right: { keys: [39, 68], enabled: true },   
        up: { keys: [38, 87], enabled: true },      
        down: { keys: [40, 83], enabled: true },     
        jump: { keys: [32], enabled: true } 
    });
    
    const mousePlugin = new MousePlugin({
        mouse_left: { buttons: [0], enabled: true },    
        mouse_right: { buttons: [2], enabled: true }    
    });
    
    controller.addPlugin('keyboard', keyboardPlugin);
    controller.addPlugin('mouse', mousePlugin);
    
    const testObject = document.getElementById('test-object');
    let posX = 0, posY = 0;
    const speed = 8;

    document.body.addEventListener(controller.ACTION_ACTIVATED, e => {
        console.log(`[CONTROLLER] Action activated: ${e.detail.action}`);
    });

    document.body.addEventListener(controller.ACTION_DEACTIVATED, e => {
        console.log(`[CONTROLLER] Action deactivated: ${e.detail.action}`);
    });

    const update = () => {
        if (controller.isActionActive('left')) {
            posX -= speed;
            console.log(`[GAME] Moving left (keyboard): ${posX}`);
        }
        if (controller.isActionActive('right')) {
            posX += speed;
            console.log(`[GAME] Moving right (keyboard): ${posX}`);
        }
        if (controller.isActionActive('up')) {
            posY -= speed;
            console.log(`[GAME] Moving up: ${posY}`);
        }
        if (controller.isActionActive('down')) {
            posY += speed;
            console.log(`[GAME] Moving down: ${posY}`);
        }
        
        if (controller.isActionActive('mouse_left')) {
            posX -= speed;
            console.log(`[GAME] Moving left (mouse): ${posX}`);
        }
        if (controller.isActionActive('mouse_right')) {
            posX += speed;
            console.log(`[GAME] Moving right (mouse): ${posX}`);
        }
    
        testObject.style.backgroundColor = controller.isActionActive('jump') ? 'turquoise' : 'blue';
        testObject.style.transform = `translate(${posX}px, ${posY}px)`;
        
        requestAnimationFrame(update);
    };

    update();

    const keyboardToggleButton = document.querySelector('#keyboard-toggle-btn');
    const mouseToggleButton = document.querySelector('#mouse-toggle-btn');

    let keyboardEnabled = true;
    let mouseEnabled = true;
    
    keyboardToggleButton.addEventListener('click', function() {
        keyboardEnabled = !keyboardEnabled;
        keyboardPlugin.enabled = keyboardEnabled;
        this.textContent = keyboardEnabled ? 'Выключить клавиатуру' : 'Включить клавиатуру';
    });
    
    mouseToggleButton.addEventListener('click', function() {
        mouseEnabled = !mouseEnabled;
        mousePlugin.enabled = mouseEnabled;
        this.textContent = mouseEnabled ? 'Выключить мышь' : 'Включить мышь';
    });

    controller.attach(document.body);
});
