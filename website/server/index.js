const path = require('path');
const fs = require('fs');
const axios = require('axios');
const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
const imagemin = require('imagemin');
const imageminOptipng = require('imagemin-optipng');

const { Pxls } = require('../../api/pxls');

function stringHasSlur(string) {
	if (
		string.match(
			/([nN][iI1loO0a4A][gGq])+(l[e3E]+t+|[e3Ea4A]*[rR]*|n[oO0]+[gGq]+|[a4A]*)*[sS]*/g,
		)
	) {
		return true;
	} else if (
		string.match(
			/[fF]+[aA4]+[gGq]+([oO0e3EiI1l]+[tT]+([rR]+[yY]+|[rR]+[iI1l]+[e3E]+)?)?[sS]*/g,
		)
	) {
		return true;
	} else if (
		string.match(
			/[kK]+[iI1lyY]+[k]+[e3E]([rR]+[yY]+|[rR]+[iI1l]+[e3E]+)?[sS]*/g,
		)
	) {
		return true;
	} else if (
		string.match(
			/[tT]+[rR]+([aA4]+[nN]+([iI1l]+|[yY]+|[e3E]+[rR]+|[oO0]+[iI1l]+[dD]+)|[oO0]+[iI1l]+[dD]+)[sS]*/g,
		)
	) {
		return true;
	} else if (string.match(/[cC]+[oO0]{2,}[nN]+[sS]*/g)) {
		return true;
	} else if (string.match(/[cC]+[hH]+[iI1l]+[nN]+[kK]+[sS]*/g)) {
		return true;
	} else {
		return false;
	}
}

function createFileName(length) {
	let result = '';
	const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	if (
		fs.existsSync(`${path.resolve(__dirname, 'templates')}/${result}.png`) ||
    stringHasSlur(result)
	) {
		return createFileName(length);
	} else {
		return `${result}.png`;
	}
}

const storage = multer.memoryStorage();

const upload = multer({ storage: storage }).single('file');

module.exports = {
	start() {
		const app = express();

		const pxlsURL = new URL(process.env.PXLS_URL);

		app.set('trust proxy', 1);

		app.use(
			cors({
				origin: [`https://${pxlsURL.host}`, `http://${pxlsURL.host}`],
				optionsSuccessStatus: 200,
			}),
		);
		app.use(express.static(path.resolve(__dirname, '../client/build')));
		app.use(express.static(path.resolve(__dirname, 'templates')));

		app.get('/api/info', (req, res) => {
			const pxls = new Pxls({
				site: new URL(process.env.PXLS_URL).host,
			});
			pxls.connect().then(() => {
				res.json({
					appID: process.env.APP_ID,
					invitePerms: process.env.INVITE_PERMS,
					discordURL: process.env.DISCORD_URL,
					patreonURL: process.env.PATREON_URL,
					pxlsURL: process.env.PXLS_URL,
					width: pxls.width,
					height: pxls.height,
					palette: pxls.palette,
				});
			});
		});

		app.post(
			'/api/upload',
			rateLimit({
				windowMs: 2 * 60 * 1000,
				max: 1,
			}),
			(req, res) => {
				if (!fs.existsSync(path.resolve(__dirname, 'templates'))) {
					fs.mkdirSync(path.resolve(__dirname, 'templates'));
				}
				upload(req, res, async (err) => {
					if (err) {
						console.error(err);
						res.sendStatus(500);
					}
					const buffer = await imagemin.buffer(req.file.buffer,
						{
							plugins: [imageminOptipng()],
						},
					);
					const filename = createFileName(10);
					fs.writeFileSync(
						`${path.resolve(__dirname, 'templates')}/${filename}`,
						buffer,
					);
					res.send(`${process.env.WEBSITE_URL}${filename}`);
					const data = new FormData();
					data.append('file', req.file.buffer, filename);
					axios.post(process.env.UPLOAD_WEBHOOK, data, { headers: data.getHeaders() });
				});
			},
		);

		app.get('*', (req, res) => {
			res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
		});

		app.listen(process.env.PORT, () => {
			console.log(`Server listening on ${process.env.PORT}`);
		});
	},
};
