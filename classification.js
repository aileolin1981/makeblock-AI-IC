// const URL = "./my_model/";
// const URL = "./classification_model_20200311/";
const URL = "./classification_model_20200311_2/";

let model, webcam, labelContainer, maxPredictions;
let count_value = 0;
let one_shoot = false;

// Load the image model and setup the webcam
async function classification_init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(500, 500, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
            let value = prediction[i].probability.toFixed(2);
            // if(i==0 && value >= 0.99)
            // {
            //     // if(!one_shoot)
            //     // {
                    
            //     //     one_shoot = true;
            //     // }
            //     mBot_Left();
            // }
            // if(i==1 && value >= 0.99)
            // {
            //     mBot_Right();
            // }
            if(prediction[i].className=="Right" && value >= 0.99)
            {
                mBot_Right();
            }
            else if(prediction[i].className=="Left" && value >= 0.99)
            {
                mBot_Left();
            }
            else if(prediction[i].className=="GO" && value >= 0.99)
            {
                mBot_Go();
            }
            else if(prediction[i].className=="STOP" && value >= 0.99)
            {
                mBot_Stop();
            }
            else if(prediction[i].className=="OTHER" && value >= 0.99)
            {
                console.log("OTHER");
            }
            else if(prediction[i].className=="BACK" && value >= 0.99)
            {
                mBot_Back();
            }

        labelContainer.childNodes[i].innerHTML = classPrediction;
        // count_value++;
    }
}