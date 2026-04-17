const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Cliente conectado:', socket.id);

    socket.on('start-analysis', async (data) => {
      const { datasetId } = data;
      
      // Simular progresso da análise
      for (let i = 0; i <= 100; i += 10) {
        socket.emit('analysis-progress', {
          datasetId,
          progress: i,
          message: `Processando... ${i}%`
        });
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      socket.emit('analysis-complete', {
        datasetId,
        message: 'Análise concluída!'
      });
    });

    socket.on('disconnect', () => {
      console.log('🔌 Cliente desconectado:', socket.id);
    });
  });

  return io;
};

const emitAnalysisUpdate = (datasetId, stats) => {
  if (io) {
    io.emit('analysis-update', { datasetId, stats });
  }
};

module.exports = { initializeSocket, emitAnalysisUpdate };