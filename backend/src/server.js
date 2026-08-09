const { connectToDatabase } = require('./config/db');
const createDefaultAdmin = require('./utils/createDefaultAdmin');

const PORT = process.env.PORT || 8000;

async function startServer(app){
    try {
        await connectToDatabase();
        await createDefaultAdmin();

        app.listen(PORT, () => {
            console.log(`🚀 Server listening at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

module.exports = startServer;