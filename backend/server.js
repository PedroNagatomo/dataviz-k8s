require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const ss = require("simple-statistics");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const http = require("http");
const socketIo = require("socket.io");
const os = require("os");

const app = express();
const server = http.createServer(app);
const upload = multer({ dest: "uploads/" });

// Configuração JWT
const JWT_SECRET = process.env.JWT_SECRET || "seu_secret_super_seguro_2024";

// Configuração Socket.io
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:30080",
      "http://localhost:8080",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Banco de dados em memória
const memoryDatasets = new Map();
let datasetCounter = 1;

// Função para gerar hash de senha (use uma vez para criar os hashes)
function generatePasswordHash(password) {
  return bcrypt.hashSync(password, 10);
}

// Usuários em memória com hashes CORRETOS
const users = [
  {
    id: 1,
    username: "admin",
    password: generatePasswordHash("admin123"),
    role: "admin",
    email: "admin@dataviz.com",
  },
  {
    id: 2,
    username: "user",
    password: generatePasswordHash("user123"),
    role: "user",
    email: "user@dataviz.com",
  },
];

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:30080",
      "http://localhost:8080",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado" });
    }
    return res.status(403).json({ error: "Token inválido" });
  }
};

// Middleware de admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Acesso restrito a administradores" });
  }
  next();
};

// ============= WEBSOCKET CONFIG =============
io.on("connection", (socket) => {
  console.log("🔌 Cliente WebSocket conectado:", socket.id);

  // Enviar métricas em tempo real
  const metricsInterval = setInterval(() => {
    const metrics = getSystemMetrics();
    socket.emit("system-metrics", metrics);
  }, 5000);

  socket.on("start-analysis", async (data) => {
    const { datasetId } = data;
    console.log("📊 Iniciando análise para dataset:", datasetId);

    for (let i = 0; i <= 100; i += 10) {
      socket.emit("analysis-progress", {
        datasetId,
        progress: i,
        message: `Processando dados... ${i}%`,
      });
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    socket.emit("analysis-complete", {
      datasetId,
      message: "Análise concluída com sucesso!",
    });
  });

  socket.on("disconnect", () => {
    console.log("🔌 Cliente WebSocket desconectado:", socket.id);
    clearInterval(metricsInterval);
  });
});

// ============= FUNÇÕES AUXILIARES =============
function getSystemMetrics() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const cpus = os.cpus();

  return {
    timestamp: new Date().toISOString(),
    cpu: {
      cores: cpus.length,
      model: cpus[0].model,
      loadAvg: os.loadavg(),
      usage: cpus.map((cpu) => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
        const idle = cpu.times.idle;
        return ((total - idle) / total) * 100;
      }),
    },
    memory: {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      usagePercent: (usedMem / totalMem) * 100,
    },
    uptime: os.uptime(),
    platform: os.platform(),
    hostname: os.hostname(),
    network: os.networkInterfaces(),
  };
}

// ============= ROTAS PÚBLICAS =============

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    websocket: io.engine.clientsCount,
  });
});

// ============= ROTAS DE AUTENTICAÇÃO =============

// Registro
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Usuário e senha obrigatórios" });
    }

    const userExists = users.find((u) => u.username === username);
    if (userExists) {
      return res.status(400).json({ error: "Usuário já existe" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword,
      email: email || `${username}@dataviz.com`,
      role: "user",
    };
    users.push(newUser);

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.status(201).json({
      message: "Usuário criado com sucesso",
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("📝 Tentativa de login:", username);

    const user = users.find((u) => u.username === username);
    if (!user) {
      console.log("❌ Usuário não encontrado");
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      console.log("❌ Senha incorreta");
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    console.log("✅ Login bem sucedido:", username);
    res.json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro ao fazer login" });
  }
});

// Logout
app.post("/api/auth/logout", authenticateToken, (req, res) => {
  res.json({ message: "Logout realizado com sucesso" });
});

// Dados do usuário atual
app.get("/api/auth/me", authenticateToken, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  res.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
    },
  });
});

// ============= ROTAS DE MÉTRICAS =============

app.get("/api/metrics", authenticateToken, (req, res) => {
  try {
    const metrics = getSystemMetrics();

    // Adicionar métricas do cluster (se existir)
    metrics.cluster = {
      datasets: memoryDatasets.size,
      activeConnections: io.engine.clientsCount,
      users: users.length,
    };

    res.json(metrics);
  } catch (error) {
    console.error("Erro ao obter métricas:", error);
    res.status(500).json({ error: "Erro ao obter métricas do sistema" });
  }
});

app.get("/api/metrics/history", authenticateToken, requireAdmin, (req, res) => {
  // Simular histórico de métricas
  const history = [];
  for (let i = 0; i < 24; i++) {
    history.push({
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      cpu: 20 + Math.random() * 60,
      memory: 40 + Math.random() * 30,
      requests: Math.floor(Math.random() * 1000),
    });
  }
  res.json(history.reverse());
});

// ============= ROTAS PROTEGIDAS =============

// Upload de arquivo
app.post(
  "/api/upload",
  authenticateToken,
  upload.single("file"),
  async (req, res) => {
    console.log(
      "📤 Recebendo upload:",
      req.file?.originalname,
      "de",
      req.user.username,
    );

    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const results = [];
    const columns = [];
    let rowCount = 0;

    try {
      await new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
          .pipe(csv())
          .on("headers", (headers) => {
            columns.push(...headers);
          })
          .on("data", (data) => {
            results.push(data);
            rowCount++;
          })
          .on("end", resolve)
          .on("error", reject);
      });

      // Calcular estatísticas completas
      const statistics = {};
      columns.forEach((column) => {
        const values = results
          .map((row) => parseFloat(row[column]))
          .filter((val) => !isNaN(val) && isFinite(val));

        if (values.length > 0) {
          try {
            statistics[column] = {
              mean: ss.mean(values),
              median: ss.median(values),
              mode: ss.mode(values),
              min: ss.min(values),
              max: ss.max(values),
              standardDeviation: ss.standardDeviation(values),
              variance: ss.variance(values),
              sum: ss.sum(values),
              quartiles: {
                q1: ss.quantile(values, 0.25),
                q2: ss.quantile(values, 0.5),
                q3: ss.quantile(values, 0.75),
              },
              sampleSize: values.length,
              skewness: ss.sampleSkewness(values),
              kurtosis: ss.sampleKurtosis(values),
            };
          } catch (statError) {
            console.warn(
              `Erro ao calcular estatísticas para ${column}:`,
              statError.message,
            );
            statistics[column] = {
              error: "Não foi possível calcular estatísticas para esta coluna",
              sampleSize: values.length,
            };
          }
        }
      });

      // Salvar dataset
      const datasetId = `ds_${Date.now()}_${datasetCounter++}`;
      const dataset = {
        id: datasetId,
        name: req.file.originalname,
        data: results.slice(0, 1000), // Limitar para evitar memória excessiva
        columns: columns,
        statistics: statistics,
        rowCount: rowCount,
        createdAt: new Date().toISOString(),
        userId: req.user.id,
        username: req.user.username,
        fileSize: req.file.size,
      };

      memoryDatasets.set(datasetId, dataset);

      // Limpar arquivo temporário
      fs.unlinkSync(req.file.path);

      // Emitir evento via WebSocket
      io.emit("dataset-uploaded", {
        id: datasetId,
        name: dataset.name,
        username: req.user.username,
        timestamp: dataset.createdAt,
      });

      console.log(
        `✅ Dataset ${datasetId} processado com sucesso: ${rowCount} linhas, ${columns.length} colunas`,
      );

      res.json({
        id: datasetId,
        name: dataset.name,
        columns: columns,
        rowCount: rowCount,
        fileSize: req.file.size,
        message: "Arquivo enviado e processado com sucesso!",
      });
    } catch (error) {
      console.error("❌ Erro ao processar:", error);
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res
        .status(500)
        .json({ error: "Erro ao processar arquivo: " + error.message });
    }
  },
);

// Listar datasets
app.get("/api/datasets", authenticateToken, async (req, res) => {
  try {
    const datasets = Array.from(memoryDatasets.values())
      .filter((ds) => req.user.role === "admin" || ds.userId === req.user.id)
      .map((ds) => ({
        id: ds.id,
        name: ds.name,
        columns: ds.columns,
        rowCount: ds.rowCount,
        createdAt: ds.createdAt,
        username: ds.username,
        fileSize: ds.fileSize,
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log(
      `📊 Retornando ${datasets.length} datasets para ${req.user.username}`,
    );
    res.json(datasets);
  } catch (error) {
    console.error("❌ Erro ao listar:", error);
    res.status(500).json({ error: "Erro ao listar datasets" });
  }
});

// Obter estatísticas de um dataset
app.get("/api/datasets/:id/statistics", authenticateToken, async (req, res) => {
  try {
    const dataset = memoryDatasets.get(req.params.id);
    if (!dataset) {
      return res.status(404).json({ error: "Dataset não encontrado" });
    }

    // Verificar permissão
    if (dataset.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Acesso negado a este dataset" });
    }

    res.json(dataset.statistics);
  } catch (error) {
    console.error("❌ Erro ao buscar estatísticas:", error);
    res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

// Deletar dataset
app.delete("/api/datasets/:id", authenticateToken, async (req, res) => {
  try {
    const dataset = memoryDatasets.get(req.params.id);
    if (!dataset) {
      return res.status(404).json({ error: "Dataset não encontrado" });
    }

    // Verificar permissão
    if (dataset.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    memoryDatasets.delete(req.params.id);

    io.emit("dataset-deleted", {
      id: req.params.id,
      username: req.user.username,
    });

    res.json({ message: "Dataset deletado com sucesso" });
  } catch (error) {
    console.error("❌ Erro ao deletar:", error);
    res.status(500).json({ error: "Erro ao deletar dataset" });
  }
});

// Exportar dataset
app.get("/api/datasets/:id/export", authenticateToken, async (req, res) => {
  try {
    const dataset = memoryDatasets.get(req.params.id);
    if (!dataset) {
      return res.status(404).json({ error: "Dataset não encontrado" });
    }

    const format = req.query.format || "json";

    if (format === "csv") {
      // Gerar CSV
      const csvData = [];
      csvData.push(dataset.columns.join(","));
      dataset.data.slice(0, 100).forEach((row) => {
        csvData.push(dataset.columns.map((col) => row[col] || "").join(","));
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${dataset.name}"`,
      );
      res.send(csvData.join("\n"));
    } else {
      res.json({
        name: dataset.name,
        columns: dataset.columns,
        statistics: dataset.statistics,
        sampleData: dataset.data.slice(0, 100),
      });
    }
  } catch (error) {
    console.error("❌ Erro ao exportar:", error);
    res.status(500).json({ error: "Erro ao exportar dataset" });
  }
});

// ============= INICIALIZAÇÃO =============

const PORT = process.env.PORT || 3001;

// Criar diretório de uploads se não existir
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

server.listen(PORT, () => {
  console.log("");
  console.log("🚀 ========================================");
  console.log(`🚀 DataViz Backend rodando na porta ${PORT}`);
  console.log("🚀 ========================================");
  console.log(`🔐 Autenticação JWT ativada`);
  console.log(`🔌 WebSocket ativo`);
  console.log(`💾 Armazenamento em memória`);
  console.log(`📊 Métricas do sistema disponíveis`);
  console.log("");
  console.log(`📝 Credenciais de teste:`);
  console.log(`   Admin: admin / admin123`);
  console.log(`   User:  user / user123`);
  console.log("");
  console.log(`🔗 URLs:`);
  console.log(`   API: http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   WebSocket: ws://localhost:${PORT}`);
  console.log("🚀 ========================================");
  console.log("");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 Recebido SIGTERM, fechando servidor...");
  io.close();
  server.close(() => {
    console.log("✅ Servidor fechado");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("👋 Recebido SIGINT, fechando servidor...");
  io.close();
  server.close(() => {
    console.log("✅ Servidor fechado");
    process.exit(0);
  });
});
