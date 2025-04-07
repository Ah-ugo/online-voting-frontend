"use client";

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import StudentLayout from "../../components/layouts/StudentLayout";
import axios from "axios";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Results = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialElectionId = queryParams.get("election");

  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = "https://online-voting-br3j.onrender.com";

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/elections/completed`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setElections(response.data);

        // If an election ID was provided in the URL, select it
        if (initialElectionId && response.data.length > 0) {
          const election = response.data.find(
            (e) => e._id === initialElectionId
          );
          if (election) {
            setSelectedElection(election);
            fetchResults(initialElectionId);
          } else if (response.data.length > 0) {
            setSelectedElection(response.data[0]);
            fetchResults(response.data[0]._id);
          }
        } else if (response.data.length > 0) {
          setSelectedElection(response.data[0]);
          fetchResults(response.data[0]._id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching elections:", error);
        setError("Failed to load elections");
        setLoading(false);
      }
    };

    fetchElections();
  }, [initialElectionId, API_URL]);

  const fetchResults = async (electionId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/elections/${electionId}/results`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching results:", error);
      setError("Failed to load election results");
    } finally {
      setLoading(false);
    }
  };

  const handleElectionChange = (e) => {
    const electionId = e.target.value;
    const election = elections.find((e) => e._id === electionId);
    setSelectedElection(election);
    fetchResults(electionId);
  };

  // Prepare chart data
  const pieChartData = {
    labels: results.map(
      (r) => `${r.candidate.firstName} ${r.candidate.lastName}`
    ),
    datasets: [
      {
        data: results.map((r) => r.voteCount),
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(199, 199, 199, 0.6)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(199, 199, 199, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const barChartData = {
    labels: results.map(
      (r) => `${r.candidate.firstName} ${r.candidate.lastName}`
    ),
    datasets: [
      {
        label: "Votes",
        data: results.map((r) => r.voteCount),
        backgroundColor: "rgba(99, 102, 241, 0.6)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Vote Distribution",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  if (loading && !selectedElection) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading election results...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Election Results
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          View the results of completed elections
        </p>
      </div>

      {elections.length === 0 ? (
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md p-6">
          <p className="text-gray-500 text-center">
            No completed elections available yet.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md p-6">
            <div className="mb-6">
              <label
                htmlFor="election-select"
                className="block text-sm font-medium text-gray-700"
              >
                Select Election
              </label>
              <select
                id="election-select"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={selectedElection?._id || ""}
                onChange={handleElectionChange}
              >
                {elections.map((election) => (
                  <option key={election._id} value={election._id}>
                    {election.title} ({election.category})
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading results...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No results available for this election.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Results Summary
                  </h2>
                  <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        {selectedElection.title}
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        {selectedElection.description}
                      </p>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                      <dl className="sm:divide-y sm:divide-gray-200">
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Category
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {selectedElection.category}
                          </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Total Votes
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {results.reduce((sum, r) => sum + r.voteCount, 0)}
                          </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Winner
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {results.length > 0 &&
                              `${results[0].candidate.firstName} ${results[0].candidate.lastName} (${results[0].voteCount} votes)`}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                      Vote Distribution (Pie Chart)
                    </h2>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <Pie data={pieChartData} />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                      Vote Distribution (Bar Chart)
                    </h2>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <Bar data={barChartData} options={barChartOptions} />
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Detailed Results
                  </h2>
                  <div className="flex flex-col">
                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                      <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Rank
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Candidate
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Votes
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  Percentage
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {results.map((result, index) => {
                                const totalVotes = results.reduce(
                                  (sum, r) => sum + r.voteCount,
                                  0
                                );
                                const percentage =
                                  totalVotes > 0
                                    ? (
                                        (result.voteCount / totalVotes) *
                                        100
                                      ).toFixed(2)
                                    : "0.00";

                                return (
                                  <tr key={result.candidate._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                          <img
                                            className="h-10 w-10 rounded-full object-cover"
                                            src={
                                              result.candidate
                                                .profileImageUrl ||
                                              "/placeholder.svg?height=40&width=40"
                                            }
                                            alt=""
                                          />
                                        </div>
                                        <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900">
                                            {result.candidate.firstName}{" "}
                                            {result.candidate.lastName}
                                          </div>
                                          <div className="text-sm text-gray-500">
                                            {result.candidate.position}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {result.voteCount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {percentage}%
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </StudentLayout>
  );
};

export default Results;
