require('dotenv').config();

const WebSocket = require('ws');

const axios = require('axios');
const PNG = require('pngjs').PNG;

let info;
let board;

module.exports = {
    async init() {
        const ws = new WebSocket(process.env.PXLS_WEBSOCKET);

        ws.on('open', async function open() {
            console.log('WebSocket Connected.');

            try {
                info = await axios.get(`${process.env.PXLS_URL}info`, {responseType: 'json'});
                const boardData = await axios.get(`${process.env.PXLS_URL}boarddata`, {responseType: 'arraybuffer'});

                board = new PNG({
                    width: info.data.width,
                    height: info.data.height,
                    filterType: -1
                });

                for (let y = 0; y < board.height; y++) {
                    for (let x = 0; x < board.width; x++) {

                        let index = board.width * y + x;
                        let idx = index << 2;
                        let paletteIndex = boardData.data[index];

                        if(board.data[idx] === 0 && board.data[idx+1] === 0 && board.data[idx+2] === 0 && board.data[idx+3] === 0) {
                            if(paletteIndex === 255) {
                                board.data[idx  ] = 0;
                                board.data[idx+1] = 0;
                                board.data[idx+2] = 0;
                                board.data[idx+3] = 0;
                            } else {
                                let color = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(info.data.palette[paletteIndex].value);

                                board.data[idx  ] = parseInt(color[1], 16);
                                board.data[idx+1] = parseInt(color[2], 16);
                                board.data[idx+2] = parseInt(color[3], 16);
                                board.data[idx+3] = 255;
                            }
                        }
                    }
                }
                console.log("Board initialized!");
            } catch (error) {
                console.error(error);
            }
        });

        ws.on('close', function close() {
            console.log('WebSocket Disconnected.');
            module.exports.init();
        });

        ws.on('message', function incoming(data) {
            try {
                data = JSON.parse(data);
                if(data.type === 'pixel') {
                    for(let i = 0; i < data.pixels.length; i++) {
                        let x = data.pixels[i].x;
                        let y = data.pixels[i].y;

                        let idx = (board.width * y + x) << 2;

                        if(data.pixels[i].color === 255) {
                            board.data[idx  ] = 0;
                            board.data[idx+1] = 0;
                            board.data[idx+2] = 0;
                            board.data[idx+3] = 0;
                        } else {
                            let color = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(info.data.palette[data.pixels[i].color].value);

                            board.data[idx  ] = parseInt(color[1], 16);
                            board.data[idx+1] = parseInt(color[2], 16);
                            board.data[idx+2] = parseInt(color[3], 16);
                            board.data[idx+3] = 255;
                        }
                    }
                }
            } catch (error) {
                if(data.type === 'pixel') {
                    console.log('Couldn\'t update pixel! Board still initializing?');
                } else {
                    console.error(error);
                }
            }
        });
    },
    board() {
        return board;
    }
};