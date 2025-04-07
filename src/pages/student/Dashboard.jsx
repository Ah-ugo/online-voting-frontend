"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StudentLayout from "../../components/layouts/StudentLayout";
import { useAuth } from "../../contexts/AuthContext";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import axios from "axios";

const Dashboard = () => {
  const { user } = useAuth();
  const [upcomingElections, setUpcomingElections] = useState([]);
  const [activeElections, setActiveElections] = useState([]);
  const [votingHistory, setVotingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = "https://online-voting-br3j.onrender.com";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch upcoming elections
        const upcomingRes = await axios.get(`${API_URL}/elections/upcoming`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch active elections
        const activeRes = await axios.get(`${API_URL}/elections/active`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch voting history
        const historyRes = await axios.get(`${API_URL}/user/votes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUpcomingElections(upcomingRes.data);
        setActiveElections(activeRes.data);
        setVotingHistory(historyRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back, {user?.firstName}! Here's what's happening with your
          elections.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Active Elections Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <CheckCircleIcon
                  className="h-6 w-6 text-green-600"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Elections
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {activeElections.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link
                to="/elections"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all elections<span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Upcoming Elections Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <ClockIcon
                  className="h-6 w-6 text-blue-600"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Upcoming Elections
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {upcomingElections.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link
                to="/elections"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                View upcoming elections<span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Votes Cast Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Votes Cast
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                      {votingHistory.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link
                to="/results"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                View voting history<span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Active Elections */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Active Elections</h2>
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
          {activeElections.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {activeElections.map((election) => (
                <li key={election._id}>
                  <Link
                    to={`/vote/${election._id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {election.title}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                election.category === "SUG"
                                  ? "bg-green-100 text-green-800"
                                  : election.category === "Faculty"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {election.category}
                            </p>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Active
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {election.description.substring(0, 100)}
                            {election.description.length > 100 ? "..." : ""}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>Ends: {formatDate(election.endDate)}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-5 sm:p-6 text-center">
              <p className="text-gray-500">
                No active elections at the moment.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Voting Activity */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">
          Recent Voting Activity
        </h2>
        <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
          {votingHistory.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {votingHistory.slice(0, 5).map((vote) => (
                <li key={vote._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {vote.election.title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Vote Cast
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {vote.candidate.firstName} {vote.candidate.lastName}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>{formatDate(vote.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-5 sm:p-6 text-center">
              <p className="text-gray-500">
                You haven't voted in any elections yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default Dashboard;
