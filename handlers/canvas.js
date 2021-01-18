require('dotenv').config();

const pxls = require('../pxls');

const PNG = require('pngjs').PNG;

module.exports = {
    board() {
        let board = pxls.board();

        const image = new PNG({
            width: board.width,
            height: board.height,
            filterType: -1
        });
        image.data = board.data;

        let chunks = [];
        let stream =  image.pack();

        stream.on('data', (chunk) => {
            chunks.push(chunk);
        });

        const end = new Promise(function(resolve, reject) {
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
        });
        
        return end;
    }
};