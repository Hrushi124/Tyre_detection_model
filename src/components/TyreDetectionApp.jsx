import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_URL = "http://localhost:3000";

const TyreDetectionApp = ({ user, onLogout }) => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ checked: 0, scanned: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem("token"));
  const [activePage, setActivePage] = useState("Dashboard");
  const [darkMode, setDarkMode] = useState(true);
  const [userName, setUserName] = useState(user?.name || "User");
  const [historyData, setHistoryData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState(null); // New state for modal

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/stats`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats({ checked: data.totalChecked, scanned: data.totalScanned });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/history`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to fetch history: ${errorData.error || response.status}`
        );
      }
      const data = await response.json();
      setHistoryData(data.history);
      setMonthlyTrends(data.monthlyTrends);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("Failed to load history");
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_URL}/api/analytics`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to fetch analytics: ${errorData.error || response.status}`
        );
      }
      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data");
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchStats();
      if (activePage === "History" || activePage === "Detection")
        fetchHistory();
      if (activePage === "Analytics") fetchAnalytics();
    } else {
      setError("Please log in to access this feature");
    }
  }, [authToken, activePage]);

  useEffect(() => {
    const checkViewport = () => setIsMobile(window.innerWidth < 768);
    checkViewport();
    window.addEventListener("resize", checkViewport);

    document.body.className = darkMode
      ? "bg-gradient-to-br from-gray-900 to-black text-white"
      : "bg-gray-100 text-black";
    document.body.style.minHeight = "100vh";

    return () => {
      window.removeEventListener("resize", checkViewport);
      document.body.className = "";
      document.body.style.minHeight = "";
    };
  }, [darkMode]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        setAnalysisResults(null);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      setError("Please upload an image file");
    }
  };

  const triggerFileUpload = () => fileInputRef.current.click();

  const startAnalysis = async () => {
    if (!uploadedImage || !imageFile) {
      setError("Please upload an image first");
      return;
    }

    if (!authToken) {
      setError("Please log in to analyze images");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Server error: ${errorData.error || response.status}`);
      }

      const data = await response.json();
      const predictionIsGood = data.prediction === "Good";
      const probability = Math.round((data.probability || 0.5) * 100);

      setStats((prev) => ({
        checked: prev.checked + 1,
        scanned: prev.scanned + 1,
      }));

      const results = {
        wear: {
          score: predictionIsGood ? 85 : 40,
          status: predictionIsGood ? "Good" : "Poor",
        },
        cuts: {
          score: predictionIsGood ? 92 : 45,
          status: predictionIsGood ? "Good" : "Poor",
        },
        tread: {
          score: predictionIsGood ? 78 : 35,
          status: predictionIsGood ? "Fair" : "Poor",
        },
        bulge: {
          score: predictionIsGood ? 95 : 30,
          status: predictionIsGood ? "Good" : "Poor",
        },
        aging: {
          score: predictionIsGood ? 83 : 40,
          status: predictionIsGood ? "Good" : "Poor",
        },
        depth: {
          score: predictionIsGood ? 76 : 35,
          status: predictionIsGood ? "Fair" : "Poor",
        },
        confidence: probability,
        overallStatus: predictionIsGood ? "PASS" : "FAIL",
      };
      setAnalysisResults(results);

      await fetchHistory();
      if (activePage === "Analytics") await fetchAnalytics();
    } catch (error) {
      console.error("Error analyzing image:", error);
      setError(`Error analyzing image: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setUploadedImage(null);
    setAnalysisResults(null);
    setImageFile(null);
    setError(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    onLogout();
  };

  const handleNameChange = (e) => setUserName(e.target.value);

  const handleViewDetails = (entry) => {
    setSelectedHistoryEntry(entry); // Show modal with this entry's details
  };

  const closeModal = () => {
    setSelectedHistoryEntry(null); // Hide modal
  };

  const renderPageContent = () => {
    switch (activePage) {
      case "Dashboard":
        return (
          <div className="p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col md:flex-row items-center justify-between py-8 md:py-16"
            >
              <div className="md:w-1/2 mb-10 md:mb-0">
                <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
                  Advanced Tyre Detection{" "}
                  <span className="text-cyan-400">Technology</span>
                </h2>
                <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                  Identify tyre issues before they escalate. Our AI-powered
                  system delivers real-time insights and safety recommendations
                  with unmatched precision.
                </p>
                <button
                  onClick={() => setActivePage("Detection")}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold rounded-full hover:opacity-90 transition-opacity shadow-lg"
                >
                  Start Analysis
                </button>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="w-64 md:w-80 h-64 md:h-80 relative"
                >
                  <div className="absolute inset-0 border-4 border-cyan-400/30 rounded-full animate-spin-slow"></div>
                  <div className="absolute inset-8 border-2 border-cyan-400/50 rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 md:w-40 h-32 md:h-40 bg-cyan-400/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <span className="text-cyan-300 text-4xl md:text-5xl font-bold">
                        T
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="py-8 md:py-16"
            >
              <h3 className="text-2xl md:text-3xl font-bold mb-10 text-center">
                Key <span className="text-cyan-400">Features</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {[
                  {
                    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                    title: "Real-time Analysis",
                    desc: "Instant feedback on tyre condition using advanced AI algorithms.",
                  },
                  {
                    icon: "M13 10V3L4 14h7v7l9-11h-7z",
                    title: "Predictive Maintenance",
                    desc: "Spot potential issues early, saving time and costs.",
                  },
                  {
                    icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                    title: "Detailed Reports",
                    desc: "Comprehensive insights with actionable next steps.",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.2 }}
                    className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-cyan-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={feature.icon}
                        />
                      </svg>
                    </div>
                    <h4 className="text-xl font-bold mb-2 text-white">
                      {feature.title}
                    </h4>
                    <p className="text-gray-400">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <footer className="border-t border-gray-800 py-6 mt-8">
              <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                <p>© 2025 TyreDetect Technology. All rights reserved.</p>
                <div className="flex space-x-4 mt-4 md:mt-0">
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Privacy Policy
                  </a>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Terms of Service
                  </a>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    Contact Us
                  </a>
                </div>
              </div>
            </footer>
          </div>
        );
      case "Detection":
        return (
          <>
            <div className="p-4 md:p-8 md:pb-4">
              <h1 className="text-2xl md:text-4xl font-bold tracking-wide">
                TYRE DETECTION
              </h1>
              <h2 className="text-lg md:text-xl text-gray-300 mt-1">
                AI-POWERED ANALYSIS
              </h2>
              <p className="mt-2 md:mt-4 text-xs md:text-sm text-gray-400 max-w-lg">
                AI-powered tyre detection monitoring system integrates real-time
                analysis for precise identification of wear patterns, tread
                depth, and potential safety issues.
              </p>
            </div>
            {error && (
              <div className="mx-4 md:mx-8 p-3 bg-red-500/20 border border-red-500 rounded-md">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6">
              <div
                className={`${
                  isMobile ? "order-1" : "order-2"
                } col-span-1 md:col-span-6 flex items-center justify-center relative`}
              >
                <TyreDisplay
                  uploadedImage={uploadedImage}
                  isAnalyzing={isAnalyzing}
                  analysisResults={analysisResults}
                />
              </div>
              <div
                className={`${
                  isMobile ? "order-2" : "order-1"
                } col-span-1 md:col-span-6`}
              >
                <div className="flex justify-around mb-6">
                  <StatisticDisplay value={stats.checked} label="Checked" />
                  <StatisticDisplay value={stats.scanned} label="Scanned" />
                </div>
                {analysisResults ? (
                  <AnalysisResultsDisplay results={analysisResults} />
                ) : (
                  <DefaultAnalyticsDisplay
                    isMobile={isMobile}
                    monthlyTrends={monthlyTrends}
                  />
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <ActionButton
                  uploadedImage={uploadedImage}
                  analysisResults={analysisResults}
                  isAnalyzing={isAnalyzing}
                  triggerFileUpload={triggerFileUpload}
                  startAnalysis={startAnalysis}
                  resetAnalysis={resetAnalysis}
                />
              </div>
            </div>
            <div className="p-4 flex justify-center">
              <FooterActionButton
                uploadedImage={uploadedImage}
                analysisResults={analysisResults}
                isAnalyzing={isAnalyzing}
                triggerFileUpload={triggerFileUpload}
                startAnalysis={startAnalysis}
                resetAnalysis={resetAnalysis}
              />
            </div>
          </>
        );
      case "Analytics":
        if (!analyticsData) {
          return (
            <div className="p-4 md:p-8 text-center">
              <p className="text-gray-400">Loading analytics data...</p>
            </div>
          );
        }

        const totalAnalyses = analyticsData.history.reduce(
          (acc, month) => acc + month.pass + month.fail,
          0
        );
        const passRate = totalAnalyses
          ? Math.round(
              (analyticsData.history.reduce(
                (acc, month) => acc + month.pass,
                0
              ) /
                totalAnalyses) *
                100
            )
          : 0;
        const avgConfidence = analyticsData.history.length
          ? Math.round(
              analyticsData.history.reduce(
                (acc, month) => acc + month.avgConfidence,
                0
              ) / analyticsData.history.length
            )
          : 0;

        const barData = {
          labels: analyticsData.history.map((month) => month.date),
          datasets: [
            {
              label: "Pass",
              data: analyticsData.history.map((month) => month.pass),
              backgroundColor: "rgba(34, 197, 94, 0.7)",
            },
            {
              label: "Fail",
              data: analyticsData.history.map((month) => month.fail),
              backgroundColor: "rgba(239, 68, 68, 0.7)",
            },
          ],
        };

        const pieData = {
          labels: ["Good", "Poor"], // Updated to match new backend
          datasets: [
            {
              data: [
                analyticsData.categoryBreakdown.good,
                analyticsData.categoryBreakdown.poor,
              ],
              backgroundColor: ["#22c55e", "#ef4444"], // Green for Good, Red for Poor
              hoverOffset: 4,
            },
          ],
        };

        return (
          <div className="p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-2xl md:text-4xl font-bold tracking-wide text-center">
                ANALYTICS
              </h1>
              <p className="mt-2 text-gray-400 text-center">
                Insights from your tyre detection history
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
            >
              <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-bold text-cyan-300">
                  Total Analyses
                </h3>
                <p className="text-3xl font-bold mt-2">{totalAnalyses}</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-bold text-cyan-300">Pass Rate</h3>
                <p className="text-3xl font-bold mt-2">{passRate}%</p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-bold text-cyan-300">
                  Avg Confidence
                </h3>
                <p className="text-3xl font-bold mt-2">{avgConfidence}%</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-12"
            >
              <h3 className="text-xl font-bold mb-4">Monthly Trends</h3>
              <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-gray-700">
                <Bar
                  data={barData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: "top" },
                      title: {
                        display: true,
                        text: "Pass/Fail Over Time",
                        color: "#fff",
                      },
                    },
                    scales: {
                      x: { ticks: { color: "#fff" } },
                      y: { ticks: { color: "#fff" } },
                    },
                  }}
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-12"
            >
              <h3 className="text-xl font-bold mb-4">Category Breakdown</h3>
              <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-gray-700 flex justify-center">
                <div className="w-full md:w-1/2">
                  <Pie
                    data={pieData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: "top", labels: { color: "#fff" } },
                        title: {
                          display: true,
                          text: "Overall Condition Distribution",
                          color: "#fff",
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        );
      case "History":
        return (
          <div className="p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-2xl md:text-4xl font-bold tracking-wide text-center">
                HISTORY
              </h1>
              <p className="mt-2 text-gray-400 text-center">
                Review your past tyre analyses
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Past Analyses</h3>
                <input
                  type="text"
                  placeholder="Search by date..."
                  className="bg-gray-800/50 border border-gray-700 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              {historyData.length === 0 ? (
                <p className="text-gray-400 text-center">
                  No history available yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {historyData.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.2 + (historyData.indexOf(entry) % 10) * 0.1,
                      }}
                      className="bg-gray-800/50 backdrop-blur-md p-4 rounded-xl border border-gray-700 flex items-center justify-between hover:border-cyan-500/50 transition-colors"
                    >
                      <div className="flex items-center">
                        <img
                          src={entry.image}
                          alt="Tyre"
                          className="w-12 h-12 rounded-full mr-4 object-cover"
                        />
                        <div>
                          <p className="text-sm text-gray-400">
                            Date: {entry.date}
                          </p>
                          <p
                            className={`text-lg font-bold ${
                              entry.status === "PASS"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {entry.status}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">
                          Confidence: {entry.confidence}%
                        </p>
                        <button
                          className="text-cyan-400 text-sm hover:underline"
                          onClick={() => handleViewDetails(entry)}
                        >
                          View Details
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Modal for Detailed View */}
            {selectedHistoryEntry && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                onClick={closeModal}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800/90 backdrop-blur-md p-6 rounded-xl border border-gray-700 max-w-md w-full mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold mb-4 text-center">
                    Analysis Details - {selectedHistoryEntry.date}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedHistoryEntry.details &&
                      Object.entries(selectedHistoryEntry.details).map(
                        ([key, data]) => (
                          <div key={key} className="mb-2">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm uppercase text-gray-300">
                                {key}
                              </span>
                              <span
                                className={`text-sm ${
                                  data.status === "Good"
                                    ? "text-green-400"
                                    : data.status === "Fair"
                                    ? "text-yellow-400"
                                    : "text-red-400"
                                }`}
                              >
                                {data.status}
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  data.status === "Good"
                                    ? "bg-green-400"
                                    : data.status === "Fair"
                                    ? "bg-yellow-400"
                                    : "bg-red-400"
                                }`}
                                style={{ width: `${data.score}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      )}
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                      Confidence: {selectedHistoryEntry.confidence}%
                    </p>
                    <p
                      className={`text-lg font-bold mt-1 ${
                        selectedHistoryEntry.status === "PASS"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {selectedHistoryEntry.status}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="mt-6 w-full bg-cyan-500 text-black font-bold py-2 px-4 rounded-full hover:opacity-90 transition-opacity"
                  >
                    Close
                  </button>
                </motion.div>
              </motion.div>
            )}
          </div>
        );
      case "Settings":
        return (
          <div className="p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-2xl md:text-4xl font-bold tracking-wide text-center">
                SETTINGS
              </h1>
              <p className="mt-2 text-gray-400 text-center">
                Customize your experience
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-8 max-w-md mx-auto"
            >
              <div className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-gray-700 space-y-6">
                <div className="flex justify-between items-center">
                  <label className="text-lg font-bold">Dark Mode</label>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-12 h-6 rounded-full p-1 flex items-center ${
                      darkMode ? "bg-cyan-400" : "bg-gray-600"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        darkMode ? "translate-x-6" : "translate-x-0"
                      }`}
                    ></div>
                  </button>
                </div>
                <div>
                  <label className="text-lg font-bold">User Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={handleNameChange}
                    className="w-full mt-2 bg-gray-700 border border-gray-600 text-white rounded-full px-4 py-2 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white font-bold py-2 px-4 rounded-full hover:opacity-90 transition-opacity"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`bg-transparent min-h-screen ${
        darkMode ? "" : "bg-gray-100 text-black"
      }`}
    >
      <BackgroundElements />
      <div className="relative z-10 container mx-auto px-4 pt-6 md:pt-10 pb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-2xl font-bold tracking-wider text-cyan-300">
            TYRE<span className="text-white">DETECT</span>
          </div>
          <div
            className={`order-3 sm:order-2 w-full ${isMobile ? "mt-4" : ""}`}
          >
            <CompactNavbar
              isMobile={isMobile}
              activePage={activePage}
              setActivePage={setActivePage}
            />
          </div>
          <UserProfile
            user={{ name: userName }}
            onLogout={handleLogout}
            className="order-2 sm:order-3"
          />
        </div>
        <div className="mt-6 bg-gray-900/80 backdrop-blur-lg rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
          {renderPageContent()}
        </div>
      </div>
    </div>
  );
};

// BackgroundElements Component
const BackgroundElements = () => (
  <div className="fixed inset-0 overflow-hidden z-0">
    <div className="absolute top-1/4 left-10 w-16 md:w-64 h-16 md:h-64 border border-cyan-500/20 rounded-full"></div>
    <div className="absolute bottom-20 right-10 w-16 md:w-32 h-16 md:h-32 border border-cyan-500/20 rounded-full"></div>
    <div className="absolute bottom-40 left-1/4 w-24 md:w-48 h-24 md:h-48 border border-cyan-500/20 rounded-full"></div>
    <div className="absolute top-1/3 right-1/4 w-12 md:w-24 h-12 md:h-24 border border-cyan-500/20 rounded-full"></div>
    {Array.from({ length: 10 }).map((_, i) => (
      <div
        key={`h-line-${i}`}
        className="absolute h-px w-full bg-cyan-500/10"
        style={{ top: `${i * 10}%` }}
      ></div>
    ))}
    {Array.from({ length: 10 }).map((_, i) => (
      <div
        key={`v-line-${i}`}
        className="absolute w-px h-full bg-cyan-500/10"
        style={{ left: `${i * 10}%` }}
      ></div>
    ))}
  </div>
);

// UserProfile Component
const UserProfile = ({ user, onLogout, className = "" }) => (
  <div className={`flex items-center ${className}`}>
    <div className="mr-3 text-right">
      <div className="text-xs md:text-sm text-gray-300">Welcome,</div>
      <div className="text-cyan-300 font-bold">{user?.name || "User"}</div>
    </div>
    <button
      onClick={onLogout}
      className="bg-gray-800 hover:bg-gray-700 text-white text-xs py-1 px-2 md:px-3 rounded-full"
    >
      Logout
    </button>
  </div>
);

// StatisticDisplay Component
const StatisticDisplay = ({ value, label }) => (
  <div className="text-center">
    <div className="text-3xl md:text-5xl font-bold text-cyan-300">{value}</div>
    <div className="text-xs uppercase text-gray-400 mt-1">{label}</div>
  </div>
);

// AnalysisResultsDisplay Component
const AnalysisResultsDisplay = ({ results }) => (
  <div className="mt-4 space-y-3 md:space-y-4">
    <div className="text-xs uppercase text-gray-400 mb-2">Analysis Results</div>
    <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-2">
      {Object.entries(results)
        .filter(([key]) => key !== "overallStatus" && key !== "confidence")
        .map(([key, data]) => (
          <div key={key} className="mb-1 md:mb-2">
            <div className="flex justify-between mb-1">
              <span className="text-xs uppercase">{key}</span>
              <span
                className={`text-xs ${
                  data.status === "Good"
                    ? "text-green-400"
                    : data.status === "Fair"
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {data.status}
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  data.status === "Good"
                    ? "bg-green-400"
                    : data.status === "Fair"
                    ? "bg-yellow-400"
                    : "bg-red-400"
                }`}
                style={{ width: `${data.score}%` }}
              ></div>
            </div>
          </div>
        ))}
    </div>
    <div className="mt-4 md:mt-6 text-center">
      <div className="text-xs uppercase text-gray-400">Overall Status</div>
      <div
        className={`text-xl md:text-2xl font-bold mt-1 ${
          results.overallStatus === "PASS" ? "text-green-400" : "text-red-500"
        }`}
      >
        {results.overallStatus}
      </div>
      <div className="text-xs text-gray-400 mt-1">
        Confidence: {results.confidence}%
      </div>
    </div>
  </div>
);

// DefaultAnalyticsDisplay Component
const DefaultAnalyticsDisplay = ({ isMobile, monthlyTrends }) => {
  const totalChecks = monthlyTrends.reduce(
    (acc, month) => acc + month.passes + month.fails,
    0
  );
  const passRate = totalChecks
    ? Math.round(
        (monthlyTrends.reduce((acc, month) => acc + month.passes, 0) /
          totalChecks) *
          100
      )
    : 0;

  return (
    <>
      <div className="mb-4">
        <div className="text-xs uppercase text-gray-400 mb-2">
          System Health
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 md:h-4">
          <div
            className="bg-gradient-to-r from-cyan-300 to-blue-500 h-3 md:h-4 rounded-full"
            style={{ width: `${passRate}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">
            Performance: {passRate}%
          </span>
          <span className="text-xs text-cyan-300">{totalChecks} checks</span>
        </div>
      </div>
      <div className="mt-6">
        <div className="text-xs uppercase text-gray-400 mb-3">
          Monthly Trend
        </div>
        {monthlyTrends.length === 0 ? (
          <p className="text-gray-400 text-center">No data available yet</p>
        ) : (
          <div className="flex justify-between items-end h-24 pb-2 border-b border-gray-700">
            {monthlyTrends.map((data, idx) => {
              const total = data.passes + data.fails;
              const passHeight = total
                ? `${(data.passes / total) * 100}%`
                : "0%";
              const failHeight = total
                ? `${(data.fails / total) * 100}%`
                : "0%";
              const monthLabel = new Date(data.month + "-01").toLocaleString(
                "default",
                { month: "short" }
              );
              return (
                <div key={idx} className="flex flex-col items-center w-1/6">
                  <div className="w-full flex flex-col h-20 mb-1">
                    <div
                      className="w-full bg-green-400"
                      style={{ height: passHeight }}
                    ></div>
                    <div
                      className="w-full bg-red-400"
                      style={{ height: failHeight }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400">{monthLabel}</span>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex justify-between mt-2">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 mr-1"></div>
            <span className="text-xs text-gray-400">Pass</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-400 mr-1"></div>
            <span className="text-xs text-gray-400">Fail</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-between mt-6 md:mt-8 gap-2">
        {["WEAR", "CUTS", "TREAD", "BULGE", "AGING", "DEPTH"].map(
          (label, index) => (
            <div key={index} className={isMobile ? "w-1/4" : ""}>
              <AnalysisCategory label={label} active={index % 3 === 0} />
            </div>
          )
        )}
      </div>
    </>
  );
};

// ActionButton Component
const ActionButton = ({
  uploadedImage,
  analysisResults,
  isAnalyzing,
  triggerFileUpload,
  startAnalysis,
  resetAnalysis,
}) => {
  if (!uploadedImage) {
    return (
      <button
        onClick={triggerFileUpload}
        className="mt-6 md:mt-8 w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-2 px-4 rounded-full text-sm md:text-base hover:opacity-90 transition-opacity"
      >
        UPLOAD TYRE IMAGE
      </button>
    );
  } else if (!analysisResults) {
    return (
      <button
        onClick={startAnalysis}
        disabled={isAnalyzing}
        className={`mt-6 md:mt-8 w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-2 px-4 rounded-full text-sm md:text-base ${
          isAnalyzing
            ? "opacity-70 cursor-not-allowed"
            : "hover:opacity-90 transition-opacity"
        }`}
      >
        {isAnalyzing ? "ANALYZING..." : "DETECT"}
      </button>
    );
  } else {
    return (
      <button
        onClick={resetAnalysis}
        className="mt-6 md:mt-8 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full text-sm md:text-base transition-colors"
      >
        RESET
      </button>
    );
  }
};

// FooterActionButton Component
const FooterActionButton = ({
  uploadedImage,
  analysisResults,
  isAnalyzing,
  triggerFileUpload,
  startAnalysis,
  resetAnalysis,
}) => {
  if (!uploadedImage) {
    return (
      <button
        onClick={triggerFileUpload}
        className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-2 px-4 md:px-8 rounded-full text-xs md:text-base hover:opacity-90 transition-opacity"
      >
        START ANALYSIS
      </button>
    );
  } else if (!analysisResults) {
    return (
      <button
        onClick={startAnalysis}
        disabled={isAnalyzing}
        className={`bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold py-2 px-4 md:px-8 rounded-full text-xs md:text-base ${
          isAnalyzing
            ? "opacity-70 cursor-not-allowed"
            : "hover:opacity-90 transition-opacity"
        }`}
      >
        {isAnalyzing ? "ANALYZING..." : "START ANALYSIS"}
      </button>
    );
  } else {
    return (
      <button
        onClick={resetAnalysis}
        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 md:px-8 rounded-full text-xs md:text-base transition-colors"
      >
        ANALYZE ANOTHER TYRE
      </button>
    );
  }
};

// TyreDisplay Component
const TyreDisplay = ({ uploadedImage, isAnalyzing, analysisResults }) => (
  <div
    className={`w-48 h-48 md:w-64 md:h-64 relative ${
      uploadedImage
        ? "rounded-full overflow-hidden border-2 border-cyan-400"
        : ""
    }`}
  >
    {uploadedImage ? (
      <>
        <img
          src={uploadedImage}
          alt="Uploaded tyre"
          className="w-full h-full object-cover"
        />
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-cyan-300 font-bold animate-pulse">
              ANALYZING...
            </div>
          </div>
        )}
        {analysisResults && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div
              className={`text-base md:text-lg font-bold ${
                analysisResults.overallStatus === "PASS"
                  ? "text-green-400"
                  : "text-red-500"
              }`}
            >
              {analysisResults.overallStatus}
            </div>
          </div>
        )}
      </>
    ) : (
      <>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#0891b2"
            strokeWidth="1"
          />
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="#0891b2"
            strokeWidth="1"
          />
          <circle
            cx="100"
            cy="100"
            r="50"
            fill="none"
            stroke="#0891b2"
            strokeWidth="1"
          />
          <circle
            cx="100"
            cy="100"
            r="30"
            fill="none"
            stroke="#0891b2"
            strokeWidth="1"
          />
          <circle cx="100" cy="100" r="10" fill="#0891b2" opacity="0.5" />
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 15 * Math.PI) / 180;
            const x1 = 100 + 70 * Math.cos(angle);
            const y1 = 100 + 70 * Math.sin(angle);
            const x2 = 100 + 90 * Math.cos(angle);
            const y2 = 100 + 90 * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#0891b2"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-cyan-300 text-sm md:text-base font-bold">
            TYRE SCAN
          </div>
        </div>
      </>
    )}
  </div>
);

// CompactNavbar Component
const CompactNavbar = ({ isMobile, activePage, setActivePage }) => {
  const pages = ["Dashboard", "Detection", "Analytics", "History", "Settings"];
  const tabRefs = useRef(pages.map(() => React.createRef()));
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex justify-center">
      <ul
        className={`relative flex ${
          isMobile ? "flex-wrap justify-center" : "w-fit"
        } rounded-full border border-gray-700 bg-gray-800/50 backdrop-blur-sm p-px`}
      >
        {pages.map((page, index) => (
          <Tab
            key={page}
            ref={tabRefs.current[index]}
            active={page === activePage}
            onClick={() => setActivePage(page)}
          >
            {page}
          </Tab>
        ))}
        {isMounted && (
          <motion.li
            initial={{
              left:
                tabRefs.current[pages.indexOf("Dashboard")]?.current
                  ?.offsetLeft || 0,
              width:
                tabRefs.current[pages.indexOf("Dashboard")]?.current
                  ?.offsetWidth || 0,
            }}
            animate={{
              left:
                tabRefs.current[pages.indexOf(activePage)]?.current
                  ?.offsetLeft || 0,
              width:
                tabRefs.current[pages.indexOf(activePage)]?.current
                  ?.offsetWidth || 0,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute z-0 h-6 rounded-full bg-cyan-400"
          />
        )}
      </ul>
    </div>
  );
};

// Tab Component
const Tab = React.forwardRef(({ children, active, onClick }, ref) => (
  <li
    ref={ref}
    onClick={onClick}
    className={`relative z-10 block cursor-pointer px-3 py-1 text-xs uppercase ${
      active ? "text-black font-bold" : "text-white hover:text-cyan-300"
    } transition-colors duration-300`}
  >
    {children}
  </li>
));

// AnalysisCategory Component
const AnalysisCategory = ({ label, active }) => (
  <button
    className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full ${
      active ? "bg-cyan-600" : "bg-gray-800"
    } transition-colors duration-300`}
  >
    <span className="text-xs">{label}</span>
  </button>
);

export default TyreDetectionApp;
