const MongoClient = require('mongodb').MongoClient;

module.exports = {
	async getTemplate(data) {
		const mongo = new MongoClient(process.env.DB_CONNECTION, {
			useUnifiedTopology: true,
		});
		try {
			await mongo.connect();
			const database = mongo.db('charity');
			const templates = database.collection('templates');

			const result = await templates.findOne(data);

			return result;
		} finally {
			await mongo.close();
		}
	},
	async addTemplate(name, gid, data) {
		const mongo = new MongoClient(process.env.DB_CONNECTION, {
			useUnifiedTopology: true,
		});
		try {
			await mongo.connect();
			const database = mongo.db('charity');
			const templates = database.collection('templates');

			const exists = await templates.findOne({
				name: name,
				gid: gid,
			});

			if (exists) {
				const result = await templates.updateOne({
					name: name,
					gid: gid,
				}, {
					$set: data,
				});
				return result;
			} else {
				const result = await templates.insertOne(data);
				return result;
			}
		} finally {
			await mongo.close();
		}
	},
	async editTemplate(name, gid, data) {
		const mongo = new MongoClient(process.env.DB_CONNECTION, {
			useUnifiedTopology: true,
		});
		try {
			await mongo.connect();
			const database = mongo.db('charity');
			const templates = database.collection('templates');

			const result = await templates.updateOne({
				name: name,
				gid: gid,
			}, {
				$set: data,
			});

			return result;
		} finally {
			await mongo.close();
		}
	},
	async removeTemplate(name, gid) {
		const mongo = new MongoClient(process.env.DB_CONNECTION, {
			useUnifiedTopology: true,
		});
		try {
			await mongo.connect();
			const database = mongo.db('charity');
			const templates = database.collection('templates');

			const result = await templates.deleteOne({
				name: name,
				gid: gid,
			});

			return result;
		} finally {
			await mongo.close();
		}
	},
	async listTemplates(data) {
		const mongo = new MongoClient(process.env.DB_CONNECTION, {
			useUnifiedTopology: true,
		});
		try {
			await mongo.connect();
			const database = mongo.db('charity');
			const templates = database.collection('templates');

			const results = [];


			const find = await templates.find(data);

			await find.forEach(result => {
				results.push(result);
			});

			return results;
		} finally {
			await mongo.close();
		}
	},
	async purgeTemplates(canvasCode) {
		const mongo = new MongoClient(process.env.DB_CONNECTION, {
			useUnifiedTopology: true,
		});
		try {
			await mongo.connect();
			const database = mongo.db('charity');
			const templates = database.collection('templates');

			await templates.deleteMany({ canvasCode: { $ne: canvasCode } });
		} finally {
			await mongo.close();
		}
	},
};