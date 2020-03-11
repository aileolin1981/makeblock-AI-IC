const TYPE_MOTOR = 0x0a,
    TYPE_RGB = 0x08,
    TYPE_SOUND = 0x07;


// Const for the ports
const PORT_1 = 0x01,
    PORT_2 = 0x02,
    PORT_3 = 0x03,
    PORT_4 = 0x04,
    PORT_5 = 0x05,
    PORT_6 = 0x06,
    PORT_7 = 0x07,
    PORT_8 = 0x08,
    M_1 = 0x09,
    M_2 = 0x0a;

function functionName( s ){
	alert('[Leo] That is ' + s + '!');
}

function _writeCharacteristic(value) {
        return this.device.gatt.getPrimaryService("0000ffe1-0000-1000-8000-00805f9b34fb")
        .then(service => service.getCharacteristic("0000ffe3-0000-1000-8000-00805f9b34fb"))
            .then(characteristic => characteristic.writeValue(value));
            // .then(service => service.getCharacteristic(this.config.charateristic()))
            // .then(characteristic => characteristic.writeValue(value));
    }
    
function processMotor(valueM1, valueM2) {
        return this._writeCharacteristic(this._genericControl(TYPE_MOTOR, M_1, 0, valueM1))
            .then(() => {
                return this._writeCharacteristic(this._genericControl(TYPE_MOTOR, M_2, 0, valueM2));
            }).catch(error => {
                console.error(error);
            });

    }
    
function processColor(red,blue,green){
        let rHex = red<<8;
		let gHex = green<<16;
		let bHex = blue<<24;
		let value = rHex | gHex | bHex;
		this._writeCharacteristic(this._genericControl(TYPE_RGB,PORT_6,0,value));
        
    }
function _genericControl(type, port, slot, value) {
        /*
        ff 55 len idx action device port  slot  data a
        0  1  2   3   4      5      6     7     8
        */
        // Static values
        var buf = new ArrayBuffer(16);
        var bufView = new Uint16Array(buf);

        var byte0 = 0xff, // Static header
            byte1 = 0x55, // Static header
            byte2 = 0x09, // len
            byte3 = 0x00, // idx
            byte4 = 0x02, // action
            byte5 = type, // device
            byte6 = port, // port
            byte7 = slot; // slot
        //dynamics values
        var byte8 = 0x00, // data
            byte9 = 0x00, // data
            byte10 = 0x00, // data
            byte11 = 0x00; // data
        //End of message
        var byte12 = 0x0a,
            byte13 = 0x00,
            byte14 = 0x00,
            byte15 = 0x00;

        switch (type) {
            case TYPE_MOTOR:
                // Motor M1
                // ff:55  09:00  02:0a  09:64  00:00  00:00  0a"
                // 0x55ff;0x0009;0x0a02;0x0964;0x0000;0x0000;0x000a;0x0000;
                // Motor M2
                // ff:55:09:00:02:0a:0a:64:00:00:00:00:0a                
                var tempValue = value < 0 ? (parseInt("ffff", 16) + Math.max(-255, value)) : Math.min(255, value);
                byte7 = tempValue & 0x00ff;
                byte8 = 0x00;
                byte8 = tempValue >> 8;
                

                break;
            case TYPE_RGB:
                // ff:55  09:00  02:08  06:00  5c:99  6d:00  0a
                // 0x55ff;0x0009;0x0802;0x0006;0x995c;0x006d;0x000a;0x0000;
                byte7 = 0x00;
                byte8 = value >> 8 & 0xff;
                byte9 = value >> 16 & 0xff;
                byte10 = value >> 24 & 0xff;
                break;
            case TYPE_SOUND:
                //ff:55:05:00:02:22:00:00:0a
                //ff:55:05:00:02:22:06:01:0a
                //ff:55:05:00:02:22:ee:01:0a
                //ff:55:05:00:02:22:88:01:0a
                //ff:55:05:00:02:22:b8:01:0a
                //ff:55:05:00:02:22:5d:01:0a
                //ff:55:05:00:02:22:4a:01:0a
                //ff:55:05:00:02:22:26:01:0a
                byte2 = 0x05;
                byte5 = 0x22;
                if (value === 0) {
                    byte6 = 0x00;
                    byte7 = 0x00;
                } else if (value === 1) {
                    byte6 = 0x06;
                    byte7 = 0x01;
                } else if (value === 2) {
                    byte6 = 0xee;
                    byte7 = 0x01;
                } else if (value === 3) {
                    byte6 = 0x88;
                    byte7 = 0x01;
                } else if (value === 4) {
                    byte6 = 0xb8;
                    byte7 = 0x01;
                } else if (value === 5) {
                    byte6 = 0x5d;
                    byte7 = 0x01;
                } else if (value === 6) {
                    byte6 = 0x4a;
                    byte7 = 0x01;
                } else {
                    byte6 = 0x26;
                    byte7 = 0x01;
                }
                byte8 = 0x0a;
                byte12 = 0x00;

                break;
        }

        bufView[0] = byte1 << 8 | byte0;
        bufView[1] = byte3 << 8 | byte2;
        bufView[2] = byte5 << 8 | byte4;
        bufView[3] = byte7 << 8 | byte6;
        bufView[4] = byte9 << 8 | byte8;
        bufView[5] = byte11 << 8 | byte10;
        bufView[6] = byte13 << 8 | byte12;
        bufView[7] = byte15 << 8 | byte14;
        console.log(
            byte0.toString(16) + ":" +
            byte1.toString(16) + ":" +
            byte2.toString(16) + ":" +
            byte3.toString(16) + ":" +
            byte4.toString(16) + ":" +
            byte5.toString(16) + ":" +
            byte6.toString(16) + ":" +
            byte7.toString(16) + ":" +
            byte8.toString(16) + ":" +
            byte9.toString(16) + ":" +
            byte10.toString(16) + ":" +
            byte11.toString(16) + ":" +
            byte12.toString(16) + ":" +
            byte13.toString(16) + ":" +
            byte14.toString(16) + ":" +
            byte15.toString(16) + ":"
        );
        console.log(
            bufView[0].toString(16) + ":" +
            bufView[1].toString(16) + ":" +
            bufView[2].toString(16) + ":" +
            bufView[3].toString(16) + ":" +
            bufView[4].toString(16) + ":" +
            bufView[5].toString(16) + ":" +
            bufView[6].toString(16) + ":" +
            bufView[7].toString(16)
        );
        return buf;
    }

function connect_AIAndmBot() {
  let filters = [];

  let filterService = document.querySelector('#service').value;
  if (filterService.startsWith('0x')) {
    filterService = parseInt(filterService);
  }
  if (filterService) {
    filters.push({services: [filterService]});
  }
  filters.push({services: ["0000ffe1-0000-1000-8000-00805f9b34fb"]});

  let filterName = document.querySelector('#name').value;
  if (filterName) {
    filters.push({name: filterName});
  }

  let filterNamePrefix = document.querySelector('#namePrefix').value;
  if (filterNamePrefix) {
    filters.push({namePrefix: filterNamePrefix});
  }

  let options = {};
  // if (document.querySelector('#allDevices').checked) {
  //   options.acceptAllDevices = true;
  //   options.optionalServices = ['0000ffe1-0000-1000-8000-00805f9b34fb'];
  // } else {
  //   options.filters = filters;
  // }

  options.acceptAllDevices = true;
  options.optionalServices = ['0000ffe1-0000-1000-8000-00805f9b34fb'];

  console.log('Requesting Bluetooth Device...');
  console.log('with ' + JSON.stringify(options));
  navigator.bluetooth.requestDevice(options)
  .then(device => {
    console.log('> Name:             ' + device.name);
    console.log('> Id:               ' + device.id);
    console.log('> Connected:        ' + device.gatt.connected);
    this.device = device;
    device.gatt.connect();
    // processColor(1,2,3);
    classification_init();
  })
  .catch(error => {
    console.log('Argh! ' + error);
  });
}


function mBot_color() {
    processColor(2,5,8);
    // processMotor(255, 255);
}

function mBot_Go() {
    processMotor(-255, 255);
    setTimeout(function(){ processMotor(0, 0); }, 1000);
}

function mBot_Back() {
    processMotor(255, -255);
    setTimeout(function(){ processMotor(0, 0); }, 1000);
}

function mBot_Stop() {
    processMotor(0, 0);
}

function mBot_Left() {
    processMotor(255, 255);
    setTimeout(function(){ processMotor(0, 0); }, 500);
}

function mBot_Right() {
    processMotor(-255, -255);
    setTimeout(function(){ processMotor(0, 0); }, 500);
}


function connect_mBot() {
  let filters = [];

  let filterService = document.querySelector('#service').value;
  if (filterService.startsWith('0x')) {
    filterService = parseInt(filterService);
  }
  if (filterService) {
    filters.push({services: [filterService]});
  }
  filters.push({services: ["0000ffe1-0000-1000-8000-00805f9b34fb"]});

  let filterName = document.querySelector('#name').value;
  if (filterName) {
    filters.push({name: filterName});
  }

  let filterNamePrefix = document.querySelector('#namePrefix').value;
  if (filterNamePrefix) {
    filters.push({namePrefix: filterNamePrefix});
  }

  let options = {};
  // if (document.querySelector('#allDevices').checked) {
  //   options.acceptAllDevices = true;
  //   options.optionalServices = ['0000ffe1-0000-1000-8000-00805f9b34fb'];
  // } else {
  //   options.filters = filters;
  // }

  options.acceptAllDevices = true;
  options.optionalServices = ['0000ffe1-0000-1000-8000-00805f9b34fb'];

  console.log('Requesting Bluetooth Device...');
  console.log('with ' + JSON.stringify(options));
  navigator.bluetooth.requestDevice(options)
  .then(device => {
    console.log('> Name:             ' + device.name);
    console.log('> Id:               ' + device.id);
    console.log('> Connected:        ' + device.gatt.connected);
    this.device = device;
    device.gatt.connect();
  })
  .catch(error => {
    console.log('Argh! ' + error);
  });
}

////////////////////////////////////

// // More API functions here:
// // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// // the link to your model provided by Teachable Machine export panel
// const URL = "./my_model/";

// let model, webcam, labelContainer, maxPredictions;
// let count_value = 0;
// let one_shoot = false;

// // Load the image model and setup the webcam
// async function init() {
//     const modelURL = URL + "model.json";
//     const metadataURL = URL + "metadata.json";

//     // load the model and metadata
//     // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
//     // or files from your local hard drive
//     // Note: the pose library adds "tmImage" object to your window (window.tmImage)
//     model = await tmImage.load(modelURL, metadataURL);
//     maxPredictions = model.getTotalClasses();

//     // Convenience function to setup a webcam
//     const flip = true; // whether to flip the webcam
//     webcam = new tmImage.Webcam(500, 500, flip); // width, height, flip
//     await webcam.setup(); // request access to the webcam
//     await webcam.play();
//     window.requestAnimationFrame(loop);

//     // append elements to the DOM
//     document.getElementById("webcam-container").appendChild(webcam.canvas);
//     labelContainer = document.getElementById("label-container");
//     for (let i = 0; i < maxPredictions; i++) { // and class labels
//         labelContainer.appendChild(document.createElement("div"));
//     }
// }

// async function loop() {
//     webcam.update(); // update the webcam frame
//     await predict();
//     window.requestAnimationFrame(loop);
// }

// // run the webcam image through the image model
// async function predict() {
//     // predict can take in an image, video or canvas html element
//     const prediction = await model.predict(webcam.canvas);
//     for (let i = 0; i < maxPredictions; i++) {
//         const classPrediction =
//             prediction[i].className + ": " + prediction[i].probability.toFixed(2);
//             let value = prediction[i].probability.toFixed(2);
//             if(i==0 && value >= 0.99)
//             {
//                 // if(!one_shoot)
//                 // {
                    
//                 //     one_shoot = true;
//                 // }
//                 onButtonClick_Left();
//             }
//             if(i==1 && value >= 0.99)
//             {
//                 onButtonClick_Right();
//             }
//         labelContainer.childNodes[i].innerHTML = classPrediction;
//         // count_value++;
//     }
// }