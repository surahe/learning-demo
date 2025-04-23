/**
 * 封装拖拽上传
 * 使用了计数器机制解决拖拽事件的冒泡问题，在 DOM 结构中，拖拽事件（如 dragenter 和 dragleave）会向上冒泡
 * 
 * @param {*} params 
 */
export const addUploadDrag = (params) => {
    if (!params || !params.dom) {
        throw new Error('parameter is incorrect');
    }

    let counter = 0;
    let dragging = false;

    // 更新拖拽状态
    const updateDragging = (whether) => {
        if (dragging === whether) {
            return false;
        }

        dragging = whether;

        if (whether) {
            params.onEnter && params.onEnter();
        } else {
            params.onLeave && params.onLeave();
        }
    }

    // 添加计数器解决冒泡机制
    const updateCounter = (type) => {
        switch (type) {
            case 'add':
                counter++;
                break;
            case 'deduct':
                counter--;
                break;
            case 'clear':
                counter = 0;
                break;
        }

        console.log(`counter: ${counter}`);

        if (counter > 0) {
            updateDragging(true);
        } else {
            updateDragging(false);
        }
    }

    params.dom.ondragenter = (e) => { 
        e.preventDefault();
        updateCounter('add');
    }; 
        
    params.dom.ondragover = function(e) {
        e.preventDefault();
    };
   
    params.dom.ondragleave = (e) => {
        e.preventDefault();
        updateCounter('deduct');
    };
   
    params.dom.ondrop = (e) => {
        e.preventDefault();
        updateCounter('clear');

        params.onDrop && params.onDrop(e.dataTransfer.files);
    };
}