const cron = require('node-cron');
const { generateArticle } = require('./aiClient');
const { pool } = require('../models/database');

async function generateAndSaveArticle() {
	try {
		console.log('Starting daily article generation...');
		const article = await generateArticle();

		await pool.query('INSERT INTO articles (title, content) VALUES ($1, $2)', [
			article.title,
			article.content,
		]);

		console.log(`Successfully generated and saved article: "${article.title}"`);
	} catch (error) {
		console.error('Error in article generation job:', error);
	}
}

function startScheduler() {
	cron.schedule('15 13 * * *', async () => {
		await generateAndSaveArticle();
	});
	console.log('Article generation scheduled: Daily at 2:15 PM WAT (1:15 PM UTC)');
}

module.exports = {
	startScheduler,
	generateAndSaveArticle,
};
