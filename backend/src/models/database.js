const { Pool } = require('pg');

const pool = new Pool({
	host: process.env.DB_HOST || 'localhost',
	port: process.env.DB_PORT || 5432,
	database: process.env.DB_NAME || 'blogdb',
	user: process.env.DB_USER || 'postgres',
	password: process.env.DB_PASSWORD || 'postgres',
});

async function initializeDatabase() {
	try {
		await pool.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

		const result = await pool.query('SELECT COUNT(*) FROM articles');
		const count = parseInt(result.rows[0].count);

		if (count < 3) {
			console.log(`Found ${count} articles. Generating initial articles...`);
			const { generateArticle } = require('../services/aiClient');

			for (let i = count; i < 3; i++) {
				try {
					const article = await generateArticle();
					await pool.query(
						'INSERT INTO articles (title, content) VALUES ($1, $2)',
						[article.title, article.content]
					);
					console.log(`Generated initial article ${i + 1}/3`);
				} catch (error) {
					console.error(
						`Error generating initial article ${i + 1}:`,
						error.message
					);
				}
			}
		}

		console.log('Database initialized successfully');
	} catch (error) {
		console.error('Database initialization error:', error);
		throw error;
	}
}

module.exports = {
	pool,
	initializeDatabase,
};
