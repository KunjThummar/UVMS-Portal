const { connectToDatabase } = require('./config/db');
const createDefaultAdmin = require('./utils/createDefaultAdmin');

const PORT = process.env.PORT || 8000;

async function startServer(app) {
    try {
        await connectToDatabase();
        await createDefaultAdmin();

        // Bind explicitly to '0.0.0.0' for Render deployment
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

module.exports = startServer;