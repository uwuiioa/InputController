document.addEventListener('DOMContentLoaded', () => {
    const controller = new InputController({
        left: { keys: [37, 65] },    
        right: { keys: [39, 68] },   
        up: { keys: [38, 87] },      
        down: { keys: [40, 83] },     
        jump: { keys: [32], enabled: false } 
    }, document.body);

    const testObject = document.getElementById('test-object');
    let posX = 0, posY = 0;
    const speed = 8;

    document.body.addEventListener(controller.ACTION_ACTIVATED, e => {
        console.log(`Action activated: ${e.detail.action}`);
    });

    document.body.addEventListener(controller.ACTION_DEACTIVATED, e => {
        console.log(`Action deactivated: ${e.detail.action}`);
    });

    const update = () => {
        if (controller.isActionActive('left')) posX -= speed;
        if (controller.isActionActive('right')) posX += speed;
        if (controller.isActionActive('up')) posY -= speed;
        if (controller.isActionActive('down')) posY += speed;
    
        testObject.style.backgroundColor = controller.isActionActive('jump') ? 'turquoise' : 'blue';

        testObject.style.transform = `translate(${posX}px, ${posY}px)`;
        
        requestAnimationFrame(update);
    };

    update();

    const attachButton = document.querySelector('#attach-btn');
    const detachButton = document.querySelector('#detach-btn');
    const enableButton = document.querySelector('#enable-btn');
    const disableButton = document.querySelector('#disable-btn');
    const jumpButton = document.querySelector('#bind-jump-btn');

    attachButton.addEventListener('click', function() {
        controller.attach(document.body);
        console.log('Controller attached');
    });

    detachButton.addEventListener('click', function() {
        controller.detach();
        console.log('Controller detached');
    });

    enableButton.addEventListener('click', function() {
        controller.enabled = true;
        console.log('Controller enabled');
    });

    disableButton.addEventListener('click', function() {
        controller.enabled = false;
        console.log('Controller disabled');
    });

    jumpButton.addEventListener('click', function() {
        controller.bindActions({ jump: { keys: [32], enabled: true }});
        console.log('Jump action bound to Space');
    });
});
