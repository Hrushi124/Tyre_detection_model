import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import axios from "axios";

// API URL - change to match your deployed backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const HistoryPage = ({ onBack }) => {
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);

        // Get token from localStorage
        const token = localStorage.getItem("token");

        // Make API request to get history data
        const response = await axios.get(`${API_URL}/api/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setHistoryData(response.data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
        setError("Failed to load your scan history. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-transparent min-h-screen">
      {/* Background elements - reused from TyreDetectionApp */}
      <div className="fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-1/4 left-10 w-16 md:w-64 h-16 md:h-64 border border-cyan-500/20 rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-16 md:w-32 h-16 md:h-32 border border-cyan-500/20 rounded-full"></div>
        <div className="absolute bottom-40 left-1/4 w-24 md:w-48 h-24 md:h-48 border border-cyan-500/20 rounded-full"></div>
        <div className="absolute top-1/3 right-1/4 w-12 md:w-24 h-12 md:h-24 border border-cyan-500/20 rounded-full"></div>

        {/* Grid lines */}
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

      <div className="relative z-10 container mx-auto px-4 pt-6 md:pt-10 pb-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="mr-4 bg-gray-800 hover:bg-gray-700 text-white text-xs py-1 px-3 rounded-full"
          >
            Back
          </button>
          <div className="text-2xl font-bold tracking-wider text-cyan-300">
            TYRE<span className="text-white">DETECT</span>
            <span className="text-lg ml-2 text-gray-400">History</span>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-3xl overflow-hidden border border-gray-800 shadow-2xl p-4 md:p-8">
          <h1 className="text-2xl font-bold mb-6">Your Scan History</h1>

          {error && (
            <div className="p-3 mb-4 bg-red-500/20 border border-red-500 rounded-md">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <div className="text-cyan-300 animate-pulse">
                Loading history...
              </div>
            </div>
          ) : historyData.length === 0 ? (
            <div className="text-center p-12 text-gray-400">
              <p>No scan history found.</p>
              <p className="mt-2 text-sm">
                Upload and analyze a tyre image to see your history here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-2 text-xs uppercase text-gray-400">
                      Date
                    </th>
                    <th className="text-left p-2 text-xs uppercase text-gray-400">
                      Result
                    </th>
                    <th className="text-left p-2 text-xs uppercase text-gray-400">
                      Confidence
                    </th>
                    <th className="text-left p-2 text-xs uppercase text-gray-400">
                      Wear
                    </th>
                    <th className="text-left p-2 text-xs uppercase text-gray-400">
                      Tread
                    </th>
                    <th className="text-left p-2 text-xs uppercase text-gray-400 hidden md:table-cell">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-800 hover:bg-gray-800/30"
                    >
                      <td className="p-2 text-sm">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="p-2">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${
                            item.result === "PASS"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {item.result}
                        </span>
                      </td>
                      <td className="p-2 text-sm">{item.confidence}%</td>
                      <td className="p-2 text-sm">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-800 rounded-full h-1.5 mr-2">
                            <div
                              className={`h-1.5 rounded-full ${
                                item.wear.status === "Good"
                                  ? "bg-green-400"
                                  : item.wear.status === "Fair"
                                  ? "bg-yellow-400"
                                  : "bg-red-400"
                              }`}
                              style={{ width: `${item.wear.score}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{item.wear.status}</span>
                        </div>
                      </td>
                      <td className="p-2 text-sm">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-800 rounded-full h-1.5 mr-2">
                            <div
                              className={`h-1.5 rounded-full ${
                                item.tread.status === "Good"
                                  ? "bg-green-400"
                                  : item.tread.status === "Fair"
                                  ? "bg-yellow-400"
                                  : "bg-red-400"
                              }`}
                              style={{ width: `${item.tread.score}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{item.tread.status}</span>
                        </div>
                      </td>
                      <td className="p-2 text-sm text-gray-400 hidden md:table-cell">
                        {item.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
