"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "../../components/layouts/StudentLayout";
import axios from "axios";
import toast from "react-hot-toast";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import {
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

const VotingPage = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidatesByPosition, setCandidatesByPosition] = useState({});
  const [selectedCandidates, setSelectedCandidates] = useState({});
  const [votedPositions, setVotedPositions] = useState([]);
  const [availablePositions, setAvailablePositions] = useState([]);
  const [currentPosition, setCurrentPosition] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [voteStatus, setVoteStatus] = useState({
    hasVoted: false,
    allPositionsVoted: false,
  });
  const API_URL = "https://online-voting-br3j.onrender.com";

  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Check if user has already voted
        const voteCheckRes = await axios.get(
          `${API_URL}/votes/check/${electionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const {
          hasVoted,
          votedPositions,
          availablePositions,
          remainingPositions,
        } = voteCheckRes.data;

        setVotedPositions(votedPositions || []);
        setAvailablePositions(availablePositions || []);

        // Set the current position to the first remaining position
        if (remainingPositions && remainingPositions.length > 0) {
          setCurrentPosition(remainingPositions[0]);
        }

        setVoteStatus({
          hasVoted: hasVoted,
          allPositionsVoted: remainingPositions
            ? remainingPositions.length === 0
            : false,
        });

        // Fetch election details
        const electionRes = await axios.get(
          `${API_URL}/elections/${electionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch candidates for this election
        const candidatesRes = await axios.get(
          `${API_URL}/candidates/election/${electionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setElection(electionRes.data);

        // Group candidates by position
        const candidatesByPos = {};
        if (Array.isArray(candidatesRes.data)) {
          candidatesRes.data.forEach((candidate) => {
            if (!candidatesByPos[candidate.position]) {
              candidatesByPos[candidate.position] = [];
            }
            candidatesByPos[candidate.position].push(candidate);
          });
        }

        setCandidatesByPosition(candidatesByPos);
      } catch (error) {
        console.error("Error fetching election data:", error);
        setError(
          error.response?.data?.message || "Failed to load election data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchElectionData();
  }, [electionId, API_URL]);

  const handleVote = async () => {
    if (!selectedCandidates[currentPosition]) {
      toast.error(`Please select a candidate for ${currentPosition}`);
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/votes`,
        {
          electionId,
          candidateId: selectedCandidates[currentPosition],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        `Your vote for ${currentPosition} has been recorded successfully!`
      );

      // Update voted positions
      const updatedVotedPositions = [...votedPositions, currentPosition];
      setVotedPositions(updatedVotedPositions);

      // Update remaining positions
      const updatedRemainingPositions = availablePositions.filter(
        (pos) => !updatedVotedPositions.includes(pos)
      );

      // Check if all positions have been voted for
      if (updatedRemainingPositions.length === 0) {
        setVoteStatus({
          hasVoted: true,
          allPositionsVoted: true,
        });
        toast.success(
          "You have successfully voted for all positions in this election!"
        );
      } else {
        // Move to the next position
        setCurrentPosition(updatedRemainingPositions[0]);
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit your vote"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePositionChange = (position) => {
    setCurrentPosition(position);
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
                election.category.toLowerCase() === "sug"
                  ? "bg-green-100 text-green-800"
                  : election.category.toLowerCase() === "faculty"
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

      {voteStatus.allPositionsVoted ? (
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
                You have successfully voted for all positions in this election.
                Thank you for participating!
              </p>
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
        </div>
      ) : (
        <>
          <div className="mt-6">
            <p className="text-gray-700">{election.description}</p>
          </div>

          {/* Position Navigation */}
          <div className="mt-8 border-b border-gray-200">
            <div className="flex overflow-x-auto py-2 space-x-4">
              {availablePositions.map((position) => (
                <button
                  key={position}
                  onClick={() => handlePositionChange(position)}
                  className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                    currentPosition === position
                      ? "bg-indigo-100 text-indigo-700"
                      : votedPositions.includes(position)
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {position}
                  {votedPositions.includes(position) && (
                    <CheckCircleIcon className="ml-1 inline-block h-4 w-4 text-green-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Current Position Voting */}
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">
              Select a Candidate for {currentPosition}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Please review the candidates carefully before casting your vote.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {candidatesByPosition[currentPosition]?.map((candidate) => (
                <div
                  key={candidate._id}
                  className={`relative rounded-lg border ${
                    selectedCandidates[currentPosition] === candidate._id
                      ? "border-indigo-500 ring-2 ring-indigo-500"
                      : "border-gray-300 hover:border-indigo-400"
                  } bg-white p-6 shadow-sm focus:outline-none cursor-pointer`}
                  onClick={() =>
                    setSelectedCandidates({
                      ...selectedCandidates,
                      [currentPosition]: candidate._id,
                    })
                  }
                >
                  {selectedCandidates[currentPosition] === candidate._id && (
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

          {/* Voting Progress */}
          <div className="mt-8 bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-700">
              Voting Progress
            </h3>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{
                  width: `${
                    (votedPositions.length / availablePositions.length) * 100
                  }%`,
                }}
              ></div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {votedPositions.length} of {availablePositions.length} positions
              voted
            </p>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => navigate("/elections")}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeftIcon
                className="-ml-1 mr-2 h-5 w-5"
                aria-hidden="true"
              />
              Back to Elections
            </button>
            <button
              type="button"
              onClick={handleVote}
              disabled={!selectedCandidates[currentPosition] || submitting}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {submitting ? "Submitting..." : "Cast Vote"}
              {!submitting && (
                <ArrowRightIcon
                  className="ml-2 -mr-1 h-5 w-5"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>
        </>
      )}
    </StudentLayout>
  );
};

export default VotingPage;
