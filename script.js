var canvas_dimensions = {
    "width": 300,
    "height": 300
};

var longest = null;

var params = {
    "extended": false,
    "sx": 0,
    "sy": 0,
    "swidth": 0,
    "sheight": 0,
    "x": 0,
    "y": 0,
    "width": 0,
    "height": 0
};

function loadCanvas(input_field) {

    var canvas = document.createElement("canvas");
    if (!canvas.getContext){
        return
    }
    canvas.id = "image-crop-canvas";
    canvas.width = canvas_dimensions["width"];
    canvas.height = canvas_dimensions["height"];

    let currentCanvas = document.getElementById("image-crop-canvas");
    if (currentCanvas != null) {
        currentCanvas.remove();
    }
    input_field.after(canvas);

    var controlDiv = document.createElement("div");
    controlDiv.id = "image-params";
    var zoomSlider = document.createElement("input");
    zoomSlider.id = "szoom";
    zoomSlider.type = "range";
    // controlDiv.appendChild(zoomSlider);
    addZoomEvent(zoomSlider);
    canvas.after(zoomSlider);

    var cropper = document.createElement("div");
    cropper.id = "cropper";
    cropper.appendChild(canvas);
    cropper.appendChild(zoomSlider);
    input_field.after(cropper);


    var drag = false;
    var dragStart;
    var dragEnd;

    /// attach click/drag events for panning
    ["mousedown", "touchstart"].forEach(function(event) {
        canvas.addEventListener(event, (e) => {
            if (typeof e.pageX !== 'undefined') {
                dragStart = { // record drag start position
                    x: e.pageX - canvas.offsetLeft,
                    y: e.pageY - canvas.offsetTop
                };
            } else {
                dragStart = { // record drag start position
                    x: e.touches[0].pageX - canvas.offsetLeft,
                    y: e.touches[0].pageY - canvas.offsetTop
                };
            }
            
            drag = true;
        });
    });

    ["mousemove", "touchmove"].forEach(function(event) {
        canvas.addEventListener(event, (e) => {
            if (drag) {
                if (typeof e.pageX !== 'undefined') {
                    dragEnd = { // record drag start position
                        x: e.pageX - canvas.offsetLeft,
                        y: e.pageY - canvas.offsetTop
                    };
                } else {
                    dragEnd = { // record drag start position
                        x: e.touches[0].pageX - canvas.offsetLeft,
                        y: e.touches[0].pageY - canvas.offsetTop
                    };
                }
                //canvas.getContext('2d').translate(dragEnd.x - dragStart.x, dragEnd.y - dragStart.y);

                // check new values would be valid
                
                newParams = {}; // clone params
                for (let key in params) {
                    newParams[key] = params[key];
                }
                newParams.x += dragEnd.x - dragStart.x;
                newParams.y += dragEnd.y - dragStart.y;

                newParams = ensurePanValid(params, newParams);
                if (newParams != false) {
                    params = newParams;
                    dragStart = dragEnd;
                    updateImage(input_field.files[0], input_field, params);
                }
                
                
            }
        });
    });

    ["mouseup", "touchend"].forEach(function(event) {
        document.addEventListener(event, (e) => {
            drag = false;
        });
    });

}

function updateImage(file, img_input, newParams) {

    if (file.type && !file.type.startsWith('image/')) {
        console.log("File is not an image.");
        return;
    }

    var currentCanvas = document.getElementById("image-crop-canvas");
    if (!currentCanvas) {
        loadCanvas(img_input); // create Canvas
        currentCanvas = document.getElementById("image-crop-canvas");
    }
    
    var context = currentCanvas.getContext('2d');

    const reader2 = new FileReader();

    reader2.addEventListener('load', (event) => {

        var image = new Image();
        image.src = event.target.result;

        

        image.onload = function(){
            if (newParams.extended){
                context.drawImage(
                    image,
                    newParams.sx,
                    newParams.sy,
                    newParams.swidth,
                    newParams.sheight,
                    newParams.x,
                    newParams.y,
                    newParams.width,
                    newParams.height
                );
            } else {
                context.drawImage(
                    image,
                    newParams.x,
                    newParams.y,
                    newParams.width,
                    newParams.height
                );
            }
        }
    });

    reader2.readAsDataURL(file);
}

function ensurePanValid(params, newParams) {
    // if all parameters are valid, return true

    // if left or top side of image would be inside of canvas
    if (newParams.x > 0) {
        newParams.x = 0;
    }
    if (newParams.y > 0) {
        newParams.y = 0;
    }
    //if right or bottom side of image would be inside of canvas
    if (newParams.height - Math.abs(newParams.y) < canvas_dimensions.height) {
        newParams.y = params.y;
    }
    if (newParams.width - Math.abs(newParams.x) < canvas_dimensions.width) {
        newParams.x = params.x;
    }

    return newParams;
}



// startup
document.addEventListener("DOMContentLoaded", () => {

    let img_input = document.getElementById("img_upload");
    img_input.addEventListener("change", (e) => loadImage(e));

    function loadImage(e) {
        var file = e.currentTarget.files[0];
        defaultParams(file, updateImage, e.currentTarget);
    }
});

/////// Form submit


document.addEventListener("DOMContentLoaded", () => {
    let img_input = document.getElementById("img_upload") 
    var form = getFormParent(img_input);
    form.addEventListener("submit", function(e){
        var input = document.createElement("input");
        input.type = "text";
        input.name = "image_base64";

        var canvas = document.getElementById("image-crop-canvas");
        var canvas_base64 = canvas.toDataURL();
        input.value = canvas_base64;

        form.appendChild(input);
        console.log("hello");
        return true;
    });
});

function getFormParent(element) {
    if (element.tagName == "FORM") {
        return element;
    } else {
        return getFormParent(element.parentNode);
    }
}

function scaleImage(scale) {
    var currentCanvas = document.getElementById("image-crop-canvas");
    var context = currentCanvas.getContext('2d');

    context.scale(scale, scale);
}

function defaultParams(file, callback, currentTarget) {
    const reader3 = new FileReader();

    reader3.addEventListener("load", (event) => {
        var image = new Image();
        image.src = event.target.result;

        image.onload = function(){
            const ratio = (image.width / image.height);
            let newWidth = canvas_dimensions.width;
            let newHeight = (newWidth / ratio);
            longest = "height";
            if (newHeight < canvas_dimensions.height) {
                newHeight = canvas_dimensions.height;
                newWidth = newHeight * ratio;
                longest = "width";
            }
            const xOffset = newWidth > canvas_dimensions.width ? (canvas_dimensions.width - newWidth) / 2 : 0;
            const yOffset = newHeight > canvas_dimensions.height ? (canvas_dimensions.height - newHeight) / 2 : 0;
            params = {
                "x": xOffset,
                "y": yOffset,
                "width": newWidth,
                "height": newHeight,
            }

            params.sx = 0;
            params.sy = 0;
            params.swidth = image.width;
            params.sheight = image.height;
            params.x = xOffset;
            params.y = yOffset;
            params.width = newWidth;
            params.height = newHeight;
            params.extended = true;

            callback(file, currentTarget, params);
            setRangeMax(ratio);
        }
    });        

    reader3.readAsDataURL(file);
}

function setRangeMax(ratio) {
    var slider = document.getElementById("szoom");
    slider.min = Math.min(canvas_dimensions.width, canvas_dimensions.height);
    slider.max = slider.min * 3;
    slider.value = slider.min;
}

function addZoomEvent(zoomSlider) {
    zoomSlider.addEventListener("input", (e) => {

        const oldWidth = params.width;
        const oldHeight = params.height;
        const ratio = (oldWidth / oldHeight);

        let value = Number(e.currentTarget.value);
        
        if (longest == "height") {
            var newWidth = value;
            var newHeight = value / ratio;
        } else if (longest == "width") {
            var newHeight = value;
            var newWidth = value * ratio;
        }

        // if left or top side of image would be inside of canvas
        
        // if right or bottom side of image would be inside of canvas
        // console.log(newParams.height - Math.abs(newParams.y), canvas_dimensions.height);
        // console.log(params.y);
        var xcompensate = 0;
        var ycompensate = 0;
        if (newHeight + params.y < canvas_dimensions.height) {
            ycompensate = newHeight + params.y - canvas_dimensions.height;
        }
        if (newWidth + params.x < canvas_dimensions.width) {
            xcompensate = newWidth + params.x - canvas_dimensions.width;
        }

        var xdifference = ((oldWidth - newWidth) / 2) + params.x - xcompensate;
        var ydifference = ((oldHeight - newHeight) / 2) + params.y - ycompensate;

        // var xdifference = params.x + xcompensate;
        // var ydifference = params.y + ycompensate;
        if (xdifference > 0) {
            xdifference = 0;
        }
        if (ydifference > 0) {  //////////// do this bit
            ydifference = 0;
        }

        params.x = xdifference;
        params.y = ydifference;
        params.width = newWidth;
        params.height = newHeight;
        params.extended = false;
        
        let img_input = document.getElementById("img_upload"); 
        updateImage(img_input.files[0], img_input, params);
    });
}