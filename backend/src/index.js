const express = require('express');
const cors = require('cors');
const articleRoutes = require('./routes/articles');
const { initializeDatabase } = require('./models/database');
const { startScheduler } = require('./services/articleJob');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/articles', articleRoutes);

app.get('/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start() {
	try {
		await initializeDatabase();
		console.log('Database initialized');

		startScheduler();
		console.log('Article generation scheduler started');

		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	} catch (error) {
		console.error('Failed to start server:', error);
		process.exit(1);
	}
}

start();
