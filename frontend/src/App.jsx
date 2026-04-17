import React, { useState, useEffect, useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  CloudArrowUpIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  ClockIcon,
  XCircleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  SunIcon,
  MoonIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  TrashIcon, // ← ADICIONAR
  XMarkIcon, // ← ADICIONAR
} from "@heroicons/react/24/outline";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import io from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ==================== COMPONENTE DE LOGIN ====================
const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const response = await axios.post(`${API_URL}${endpoint}`, {
        username,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      axios.defaults.headers.common["Authorization"] =
        `Bearer ${response.data.token}`;

      if (onLogin) {
        onLogin(response.data.user, response.data.token);
      }
    } catch (error) {
      setError(error.response?.data?.error || "Erro na autenticação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mb-4">
            <ChartBarIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            DataViz Analytics
          </h2>
          <p className="text-gray-500 mt-2">
            {isLogin ? "Faça login para continuar" : "Crie sua conta gratuita"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuário
            </label>
            <div className="relative">
              <UserCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu_usuario"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processando...
              </div>
            ) : isLogin ? (
              "Entrar"
            ) : (
              "Registrar"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            {isLogin
              ? "Não tem uma conta? Registre-se"
              : "Já tem uma conta? Faça login"}
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-2">Credenciais de teste:</p>
          <p className="text-xs text-gray-600">Admin: admin / admin123</p>
          <p className="text-xs text-gray-600">User: user / user123</p>
        </div>
      </div>
    </div>
  );
};

// ==================== COMPONENTE DE MÉTRICAS ====================
const MetricsWidget = () => {
  const [metrics, setMetrics] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/metrics`);
        setMetrics(response.data);
      } catch (error) {
        console.error("Erro ao buscar métricas:", error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-all"
      >
        <ChartBarIcon className="w-6 h-6" />
      </button>

      {expanded && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl p-4 w-80 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">
            Métricas do Sistema
          </h4>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">CPU Usage</span>
                <span className="font-medium">
                  {metrics.cpu.loadAvg[0].toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(metrics.cpu.loadAvg[0] * 10, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Memória</span>
                <span className="font-medium">
                  {metrics.memory.usagePercent.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${metrics.memory.usagePercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {(metrics.memory.used / 1024 / 1024 / 1024).toFixed(2)} GB /
                {(metrics.memory.total / 1024 / 1024 / 1024).toFixed(2)} GB
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ClockIcon className="w-4 h-4" />
              <span>
                Uptime: {Math.floor(metrics.uptime / 3600)}h{" "}
                {Math.floor((metrics.uptime % 3600) / 60)}m
              </span>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-400">Host: {metrics.hostname}</p>
              <p className="text-xs text-gray-400">
                Platform: {metrics.platform}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== COMPONENTE PRINCIPAL DO DASHBOARD ====================
const Dashboard = ({ user, token, onLogout }) => {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [notification, setNotification] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [chartType, setChartType] = useState("bar");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("🟢 WebSocket conectado");
      showNotification("Conectado ao servidor em tempo real", "success");
    });

    socket.on("connect_error", (error) => {
      console.error("🔴 Erro WebSocket:", error);
      // Não mostrar notificação de erro para não incomodar o usuário
    });

    socket.on("disconnect", (reason) => {
      console.log("🟡 WebSocket desconectado:", reason);
      if (reason === "io server disconnect") {
        // Reconectar manualmente
        socket.connect();
      }
    });

    socket.on("analysis-progress", (data) => {
      console.log("📊 Progresso:", data);
      showNotification(`${data.message}`, "info");
    });

    socket.on("analysis-complete", (data) => {
      showNotification("✅ Análise concluída!", "success");
      fetchDatasets();
    });

    socket.on("dataset-uploaded", (data) => {
      showNotification(`📤 ${data.username} enviou: ${data.name}`, "info");
      fetchDatasets();
    });

    socket.on("system-metrics", (metrics) => {
      // Atualizar estado de métricas se necessário
      console.debug("Métricas recebidas:", metrics.cpu.loadAvg[0]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Aplicar dark mode
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchDatasets = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/datasets`);
      setDatasets(response.data);
    } catch (error) {
      console.error("Erro ao buscar datasets:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        showNotification("Sessão expirada. Faça login novamente.", "error");
        onLogout();
        navigate("/login");
      } else {
        showNotification("Erro ao carregar datasets", "error");
      }
    }
  };

  const fetchStatistics = async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/datasets/${id}/statistics`,
      );
      setStatistics(response.data);
      setSelectedDataset(id);
      setSelectedColumns(Object.keys(response.data));
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      showNotification("Erro ao carregar estatísticas", "error");
    }
  };

  const deleteDataset = async (id, name) => {
    // Confirmação do usuário
    if (
      !window.confirm(`Tem certeza que deseja excluir o dataset "${name}"?`)
    ) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/datasets/${id}`);

      showNotification(`Dataset "${name}" excluído com sucesso!`, "success");

      // Se o dataset excluído era o selecionado, limpar a seleção
      if (selectedDataset === id) {
        setSelectedDataset(null);
        setStatistics(null);
        setSelectedColumns([]);
      }

      // Atualizar a lista de datasets
      fetchDatasets();
    } catch (error) {
      console.error("Erro ao excluir dataset:", error);
      if (error.response?.status === 403) {
        showNotification(
          "Você não tem permissão para excluir este dataset",
          "error",
        );
      } else {
        showNotification("Erro ao excluir dataset", "error");
      }
    }
  };

  // Função para deletar todos os datasets (apenas admin)
  const deleteAllDatasets = async () => {
    if (
      !window.confirm(
        "⚠️ ATENÇÃO: Tem certeza que deseja excluir TODOS os datasets? Esta ação não pode ser desfeita!",
      )
    ) {
      return;
    }

    try {
      // Deletar um por um
      const deletePromises = datasets.map((ds) =>
        axios
          .delete(`${API_URL}/api/datasets/${ds.id}`)
          .catch((err) => console.error(`Erro ao deletar ${ds.id}:`, err)),
      );

      await Promise.all(deletePromises);

      showNotification("Todos os datasets foram excluídos!", "success");
      setSelectedDataset(null);
      setStatistics(null);
      setSelectedColumns([]);
      fetchDatasets();
    } catch (error) {
      console.error("Erro ao excluir datasets:", error);
      showNotification("Erro ao excluir todos os datasets", "error");
    }
  };

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setUploadProgress(0);

    try {
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(percent);
        },
      });

      showNotification(
        "Arquivo enviado com sucesso! Processando análise...",
        "success",
      );

      // Iniciar análise via WebSocket
      if (socket && response.data.id) {
        socket.emit("start-analysis", { datasetId: response.data.id });
      }

      setTimeout(() => {
        fetchDatasets();
        setLoading(false);
        setUploadProgress(0);
      }, 2000);
    } catch (error) {
      console.error("Erro no upload:", error);
      showNotification("Erro ao fazer upload do arquivo", "error");
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    setExporting(true);
    try {
      const element = document.getElementById("report-content");
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Cabeçalho
      pdf.setFontSize(20);
      pdf.setTextColor(37, 99, 235);
      pdf.text("DataViz Analytics Report", 10, 15);

      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 10, 22);
      pdf.text(`Usuário: ${user.username}`, 10, 28);
      pdf.text(
        `Dataset: ${datasets.find((d) => d.id === selectedDataset)?.name || "N/A"}`,
        10,
        34,
      );

      // Conteúdo
      pdf.addImage(imgData, "PNG", 5, 40, pdfWidth - 10, pdfHeight - 20);

      // Rodapé
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Página ${i} de ${totalPages} - DataViz Analytics Platform`,
          pdfWidth / 2,
          pdfHeight + 35,
          { align: "center" },
        );
      }

      pdf.save(`dataviz-report-${new Date().toISOString().split("T")[0]}.pdf`);
      showNotification("Relatório exportado com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      showNotification("Erro ao exportar relatório", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxSize: 10485760, // 10MB
  });

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#FF6B6B",
    "#4ECDC4",
  ];

  const prepareChartData = (stats) => {
    if (!stats) return [];
    return Object.entries(stats)
      .filter(
        ([key]) =>
          selectedColumns.length === 0 || selectedColumns.includes(key),
      )
      .map(([key, values]) => ({
        name: key,
        mean: values.mean?.toFixed(2),
        median: values.median?.toFixed(2),
        max: values.max?.toFixed(2),
        min: values.min?.toFixed(2),
        standardDeviation: values.standardDeviation?.toFixed(2),
      }));
  };

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0";
    return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(
      num,
    );
  };

  const filteredDatasets = useMemo(() => {
    return datasets.filter((dataset) =>
      dataset.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [datasets, searchTerm]);

  const renderChart = () => {
    const data = prepareChartData(statistics);

    switch (chartType) {
      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} />
            <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "white", borderRadius: "8px" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="mean"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Média"
            />
            <Line
              type="monotone"
              dataKey="median"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Mediana"
            />
            <Line
              type="monotone"
              dataKey="max"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Máximo"
            />
          </LineChart>
        );
      case "area":
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} />
            <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "white", borderRadius: "8px" }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="mean"
              stackId="1"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              name="Média"
            />
            <Area
              type="monotone"
              dataKey="median"
              stackId="2"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
              name="Mediana"
            />
          </AreaChart>
        );
      default:
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} />
            <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "white", borderRadius: "8px" }}
            />
            <Legend />
            <Bar
              dataKey="mean"
              fill="#3b82f6"
              name="Média"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="median"
              fill="#10b981"
              name="Mediana"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="max"
              fill="#f59e0b"
              name="Máximo"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      {/* Notificação Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : notification.type === "error"
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            ) : notification.type === "error" ? (
              <XCircleIcon className="w-5 h-5 text-red-600" />
            ) : (
              <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Navbar Melhorada */}
      <nav className="glass-effect shadow-lg sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg shadow-md">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                DataViz Analytics
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Informações do usuário */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <UserCircleIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {user.username}
                </span>
                {user.role === "admin" && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={darkMode ? "Modo Claro" : "Modo Escuro"}
              >
                {darkMode ? (
                  <SunIcon className="w-5 h-5 text-gray-600" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Botão Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sair"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Sair</span>
              </button>

              <div className="flex gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse animation-delay-200"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse animation-delay-400"></div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barra de Busca */}
        {datasets.length > 0 && (
          <div className="mb-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar datasets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Upload e Lista */}
          <div className="lg:col-span-1 space-y-6">
            {/* Card de Upload Melhorado */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <CloudArrowUpIcon className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Upload de Dados
                </h2>
              </div>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                  ${
                    isDragActive
                      ? "border-blue-500 bg-blue-50 scale-105"
                      : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                  }`}
              >
                <input {...getInputProps()} />
                <DocumentTextIcon
                  className={`mx-auto h-12 w-12 transition-colors duration-200
                  ${isDragActive ? "text-blue-600" : "text-gray-400"}`}
                />
                <p className="mt-2 text-sm text-gray-600">
                  {isDragActive
                    ? "Solte o arquivo CSV aqui..."
                    : "Arraste um arquivo CSV ou clique para selecionar"}
                </p>
                <p className="mt-1 text-xs text-gray-400">Máximo 10MB</p>
              </div>

              {loading && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Processando upload...</span>
                    <span className="font-medium text-blue-600">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Lista de Datasets com Filtro */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-gray-900">
                  Datasets Recentes ({filteredDatasets.length})
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchDatasets}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    title="Atualizar lista"
                  >
                    <ArrowDownTrayIcon className="w-3 h-3" />
                    Atualizar
                  </button>

                  {/* Botão Excluir Todos (apenas admin) */}
                  {user.role === "admin" && filteredDatasets.length > 0 && (
                    <button
                      onClick={deleteAllDatasets}
                      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                      title="Excluir todos os datasets"
                    >
                      <TrashIcon className="w-3 h-3" />
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-hide">
                {filteredDatasets.length === 0 ? (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="mx-auto h-10 w-10 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">
                      {searchTerm
                        ? "Nenhum dataset encontrado"
                        : "Nenhum dataset ainda"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {searchTerm
                        ? "Tente outro termo de busca"
                        : "Faça upload de um arquivo CSV"}
                    </p>
                  </div>
                ) : (
                  filteredDatasets.map((dataset) => (
                    <div
                      key={dataset.id}
                      className={`relative group rounded-lg transition-all duration-200 
            ${
              selectedDataset === dataset.id
                ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md"
                : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:shadow-sm"
            }`}
                    >
                      {/* Botão de selecionar dataset */}
                      <button
                        onClick={() => fetchStatistics(dataset.id)}
                        className="w-full text-left p-4 pr-12"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {dataset.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <DocumentTextIcon className="w-3 h-3" />
                                {dataset.rowCount} linhas
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                {dataset.columns?.length} colunas
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <ClockIcon className="w-3 h-3 text-gray-400" />
                              <p className="text-xs text-gray-400">
                                {new Date(dataset.createdAt).toLocaleDateString(
                                  "pt-BR",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                          {selectedDataset === dataset.id && (
                            <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                      </button>

                      {/* Botão de excluir (aparece no hover) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDataset(dataset.id, dataset.name);
                        }}
                        className="absolute top-3 right-3 p-1.5 rounded-full 
                     bg-white/80 hover:bg-red-100 text-gray-400 hover:text-red-600
                     opacity-0 group-hover:opacity-100 transition-all duration-200
                     shadow-sm hover:shadow"
                        title="Excluir dataset"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Contador e ações em lote */}
              {filteredDatasets.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    {filteredDatasets.length} dataset
                    {filteredDatasets.length !== 1 ? "s" : ""} disponível
                    {filteredDatasets.length !== 1 ? "s" : ""}
                  </p>
                  {selectedDataset && (
                    <button
                      onClick={() =>
                        deleteDataset(
                          selectedDataset,
                          datasets.find((d) => d.id === selectedDataset)?.name,
                        )
                      }
                      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <TrashIcon className="w-3 h-3" />
                      Excluir selecionado
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Área Principal - Visualizações */}
          <div className="lg:col-span-2">
            {statistics ? (
              <div id="report-content" className="space-y-6">
                {/* Métricas Resumidas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100">
                    <p className="text-xs text-blue-600 font-medium">
                      Total de Colunas
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {Object.keys(statistics).length}
                    </p>
                  </div>
                  <div className="stat-card bg-gradient-to-br from-green-50 to-green-100">
                    <p className="text-xs text-green-600 font-medium">
                      Média Geral
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatNumber(
                        Object.values(statistics).reduce(
                          (acc, curr) => acc + (curr.mean || 0),
                          0,
                        ) / Object.keys(statistics).length,
                      )}
                    </p>
                  </div>
                  <div className="stat-card bg-gradient-to-br from-purple-50 to-purple-100">
                    <p className="text-xs text-purple-600 font-medium">
                      Desvio Padrão Médio
                    </p>
                    <p className="text-2xl font-bold text-purple-900">
                      {formatNumber(
                        Object.values(statistics).reduce(
                          (acc, curr) => acc + (curr.standardDeviation || 0),
                          0,
                        ) / Object.keys(statistics).length,
                      )}
                    </p>
                  </div>
                  <div className="stat-card bg-gradient-to-br from-orange-50 to-orange-100">
                    <p className="text-xs text-orange-600 font-medium">
                      Amostras
                    </p>
                    <p className="text-2xl font-bold text-orange-900">
                      {Object.values(statistics)[0]?.sampleSize || 0}
                    </p>
                  </div>
                </div>

                {/* Controles do Gráfico */}
                <div className="card">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Comparativo de Métricas por Coluna
                    </h3>
                    <div className="flex gap-2">
                      {/* Seletor de Tipo de Gráfico */}
                      <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="bar">Barras</option>
                        <option value="line">Linhas</option>
                        <option value="area">Área</option>
                      </select>

                      {/* Botão Exportar PDF */}
                      <button
                        onClick={exportToPDF}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 text-sm"
                      >
                        {exporting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Exportando...
                          </>
                        ) : (
                          <>
                            <DocumentTextIcon className="w-4 h-4" />
                            Exportar PDF
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Filtro de Colunas */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {Object.keys(statistics).map((col) => (
                      <button
                        key={col}
                        onClick={() => {
                          if (selectedColumns.includes(col)) {
                            setSelectedColumns(
                              selectedColumns.filter((c) => c !== col),
                            );
                          } else {
                            setSelectedColumns([...selectedColumns, col]);
                          }
                        }}
                        className={`px-3 py-1 text-xs rounded-full transition-all ${
                          selectedColumns.includes(col)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>

                  <ResponsiveContainer width="100%" height={350}>
                    {renderChart()}
                  </ResponsiveContainer>
                </div>

                {/* Gráfico de Tendência (Área) */}
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">
                    Tendência de Distribuição
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={prepareChartData(statistics)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                      />
                      <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="mean"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                        name="Média"
                      />
                      <Area
                        type="monotone"
                        dataKey="standardDeviation"
                        stackId="2"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.2}
                        name="Desvio Padrão"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Cards de Estatísticas Detalhadas */}
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">
                    Análise Estatística Detalhada
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(statistics)
                      .filter(
                        ([column]) =>
                          selectedColumns.length === 0 ||
                          selectedColumns.includes(column),
                      )
                      .map(([column, stats], index) => (
                        <div key={column} className="stat-card">
                          <div className="flex items-center gap-2 mb-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{
                                backgroundColor:
                                  COLORS[index % COLORS.length] + "20",
                              }}
                            >
                              <span
                                className="text-sm font-bold"
                                style={{ color: COLORS[index % COLORS.length] }}
                              >
                                {column[0]?.toUpperCase() || "C"}
                              </span>
                            </div>
                            <h4 className="font-semibold text-gray-800">
                              {column}
                            </h4>
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <span className="text-gray-500">Média:</span>
                            <span className="font-medium text-right">
                              {stats.mean?.toFixed(2)}
                            </span>

                            <span className="text-gray-500">Mediana:</span>
                            <span className="font-medium text-right">
                              {stats.median?.toFixed(2)}
                            </span>

                            <span className="text-gray-500">Moda:</span>
                            <span className="font-medium text-right">
                              {stats.mode || "N/A"}
                            </span>

                            <span className="text-gray-500">
                              Desvio Padrão:
                            </span>
                            <span className="font-medium text-right">
                              {stats.standardDeviation?.toFixed(2)}
                            </span>

                            <span className="text-gray-500">Variância:</span>
                            <span className="font-medium text-right">
                              {stats.variance?.toFixed(2)}
                            </span>

                            <span className="text-gray-500">Mínimo:</span>
                            <span className="font-medium text-right">
                              {stats.min?.toFixed(2)}
                            </span>

                            <span className="text-gray-500">Máximo:</span>
                            <span className="font-medium text-right">
                              {stats.max?.toFixed(2)}
                            </span>

                            <span className="text-gray-500">Soma Total:</span>
                            <span className="font-medium text-right">
                              {formatNumber(stats.sum)}
                            </span>
                          </div>

                          {stats.quartiles && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-400 mb-1">
                                Quartis
                              </p>
                              <div className="flex justify-between text-xs">
                                <div>
                                  <span className="text-gray-500">Q1:</span>
                                  <span className="ml-1 font-medium">
                                    {stats.quartiles.q1?.toFixed(2)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Q2:</span>
                                  <span className="ml-1 font-medium">
                                    {stats.quartiles.q2?.toFixed(2)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Q3:</span>
                                  <span className="ml-1 font-medium">
                                    {stats.quartiles.q3?.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card flex flex-col items-center justify-center py-16">
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-full mb-6">
                  <ChartBarIcon className="h-20 w-20 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Bem-vindo, {user.username}!
                </h3>
                <p className="text-gray-500 text-center max-w-md">
                  Faça upload de um arquivo CSV e selecione um dataset para
                  visualizar análises estatísticas detalhadas e gráficos
                  interativos.
                </p>
                <div className="mt-6 flex gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-200"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce animation-delay-400"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Powered by Kubernetes • React • Node.js • Tailwind CSS
            </p>
            <div className="flex gap-4">
              <span className="text-xs text-gray-400">v3.0.0</span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Cluster: Active
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Widget de Métricas */}
      <MetricsWidget />
    </div>
  );
};

// ==================== COMPONENTE PRINCIPAL DA APLICAÇÃO ====================
function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
    }

    setLoading(false);
  }, []);

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
        <div className="text-center">
          <div className="inline-flex p-3 bg-white rounded-xl mb-4">
            <ChartBarIcon className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <p className="text-white text-lg">Carregando DataViz Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard user={user} token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/"
          element={<Navigate to={user ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
