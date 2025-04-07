import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "../../components/layouts/StudentLayout";
import axios from "axios";
import toast from "react-hot-toast";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

// Create axios instance with default config
const api = axios.create({
  baseURL: "https://online-voting-br3j.onrender.com",
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

// Add request interceptor to handle auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const VotingPage = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        // Check if user has already voted
        const userVotesRes = await api.get("/user/votes");
        const hasVotedInElection = userVotesRes.data.some(
          (vote) => vote.electionId === electionId
        );
        setHasVoted(hasVotedInElection);

        // Fetch election details
        const [electionRes, candidatesRes] = await Promise.all([
          api.get(`/elections/${electionId}`),
          api.get(`/candidates/election/${electionId}`),
        ]);

        setElection(electionRes.data);
        setCandidates(candidatesRes.data);
      } catch (error) {
        console.error("Error fetching election data:", error);
        let errorMessage = "Failed to load election data";

        if (error.response?.status === 404) {
          errorMessage = "Election not found";
        } else if (error.response?.status === 403) {
          errorMessage = "You don't have access to this election";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchElectionData();
  }, [electionId]);

  const handleVote = async () => {
    if (!selectedCandidate) {
      toast.error("Please select a candidate");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/vote", {
        electionId,
        candidateId: selectedCandidate,
      });

      toast.success("Your vote has been recorded successfully!");
      setHasVoted(true);
    } catch (error) {
      console.error("Error submitting vote:", error);
      let errorMessage = "Failed to submit your vote";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading election details...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon
                className="h-5 w-5 text-red-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => navigate("/elections")}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Elections
          </button>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          {election.title}
        </h1>
        <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span
              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                election.category === "SUG"
                  ? "bg-green-100 text-green-800"
                  : election.category === "Faculty"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {election.category}
            </span>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span>Ends: {formatDate(election.endDate)}</span>
          </div>
        </div>
      </div>

      {hasVoted ? (
        <div className="mt-6 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon
                className="h-5 w-5 text-green-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                You have already cast your vote for this election. Thank you for
                participating!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <p className="text-gray-700">{election.description}</p>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">
              Select a Candidate
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Please review the candidates carefully before casting your vote.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {candidates.map((candidate) => (
                <div
                  key={candidate._id}
                  className={`relative rounded-lg border ${
                    selectedCandidate === candidate._id
                      ? "border-indigo-500 ring-2 ring-indigo-500"
                      : "border-gray-300 hover:border-indigo-400"
                  } bg-white p-6 shadow-sm focus:outline-none cursor-pointer`}
                  onClick={() => setSelectedCandidate(candidate._id)}
                >
                  {selectedCandidate === candidate._id && (
                    <div className="absolute top-4 right-4">
                      <CheckCircleIcon
                        className="h-6 w-6 text-indigo-600"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img
                        className="h-16 w-16 rounded-full object-cover"
                        src={
                          candidate.profileImageUrl ||
                          "/placeholder.svg?height=64&width=64"
                        }
                        alt={`${candidate.firstName} ${candidate.lastName}`}
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {candidate.firstName} {candidate.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {candidate.position}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      {candidate.manifesto.substring(0, 150)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/elections")}
              className="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleVote}
              disabled={!selectedCandidate || submitting}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {submitting ? "Submitting..." : "Cast Vote"}
            </button>
          </div>
        </>
      )}
    </StudentLayout>
  );
};

export default VotingPage;
