"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../components/layouts/AdminLayout";
import axios from "axios";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create"); // 'create' or 'edit'
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    matricNumber: "",
    position: "",
    manifesto: "",
    electionId: "",
    profileImage: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const API_URL = "https://online-voting-br3j.onrender.com";

  useEffect(() => {
    fetchElections();
  }, []);

  // Fetch candidates when an election is selected
  useEffect(() => {
    if (selectedElection) {
      fetchCandidatesForElection(selectedElection);
    } else {
      setCandidates([]);
    }
  }, [selectedElection]);

  const fetchCandidatesForElection = async (electionId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/candidates/election/${electionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCandidates(response.data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const fetchElections = async () => {
    try {
      const token = localStorage.getItem("token");

      // Try the admin/elections endpoint instead
      const response = await axios.get(`${API_URL}/admin/elections`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setElections(response.data);

      // If there's at least one election, select it by default
      if (response.data.length > 0) {
        setSelectedElection(response.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching elections:", error);

      // Fallback to try another endpoint if the first one fails
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/admin/all-elections`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setElections(response.data);

        if (response.data.length > 0) {
          setSelectedElection(response.data[0]._id);
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        toast.error("Failed to load elections");
      }
    }
  };

  const handleOpenCreateModal = () => {
    setModalType("create");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      matricNumber: "",
      position: "",
      manifesto: "",
      electionId: selectedElection, // Pre-select the current election
      profileImage: null,
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (candidate) => {
    setModalType("edit");
    setSelectedCandidate(candidate);

    setFormData({
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      matricNumber: candidate.matricNumber,
      position: candidate.position,
      manifesto: candidate.manifesto,
      electionId: candidate.electionId,
      profileImage: null,
    });

    setImagePreview(candidate.profileImageUrl);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profileImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      // Add all form data to FormData
      Object.keys(formData).forEach((key) => {
        if (key === "profileImage" && formData[key] instanceof File) {
          formDataToSend.append(key, formData[key]);
        } else if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (modalType === "create") {
        await axios.post(`${API_URL}/admin/candidates`, formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Candidate created successfully");
      } else {
        await axios.put(
          `${API_URL}/admin/candidates/${selectedCandidate._id}`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Candidate updated successfully");
      }

      setShowModal(false);
      fetchCandidatesForElection(selectedElection);
    } catch (error) {
      console.error("Error submitting candidate:", error);
      toast.error(error.response?.data?.message || "Failed to save candidate");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (candidateId) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/admin/candidates/${candidateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Candidate deleted successfully");
      fetchCandidatesForElection(selectedElection);
    } catch (error) {
      console.error("Error deleting candidate:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete candidate"
      );
    }
  };

  const handleElectionChange = (e) => {
    setSelectedElection(e.target.value);
  };

  if (loading && candidates.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading candidates...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Candidates
        </h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Candidate
          </button>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Select Election:</label>
          <select
            value={selectedElection}
            onChange={handleElectionChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select an election</option>
            {elections.map((election) => (
              <option key={election._id} value={election._id}>
                {election.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  Position
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Election
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Category
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates.length > 0 ? (
                candidates.map((candidate) => (
                  <tr key={candidate._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={
                              candidate.profileImageUrl ||
                              "/placeholder.svg?height=40&width=40" ||
                              "/placeholder.svg"
                            }
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {candidate.firstName} {candidate.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {candidate.matricNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {candidate.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {candidate.election?.title || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          candidate.election?.category === "SUG"
                            ? "bg-green-100 text-green-800"
                            : candidate.election?.category === "Faculty"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {candidate.election?.category || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(candidate)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          <PencilIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleDelete(candidate._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No candidates found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Candidate Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {modalType === "create"
                          ? "Add New Candidate"
                          : "Edit Candidate"}
                      </h3>
                      <div className="mt-4 space-y-4">
                        {/* Profile Image */}
                        <div className="flex flex-col items-center">
                          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 mb-4 flex items-center justify-center border-2 border-dashed border-gray-300">
                            {imagePreview ? (
                              <img
                                src={imagePreview || "/placeholder.svg"}
                                alt="Profile Preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            )}
                          </div>
                          <label
                            htmlFor="profile-image"
                            className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            Upload Profile Picture
                            <input
                              id="profile-image"
                              name="profileImage"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleImageChange}
                            />
                          </label>
                        </div>

                        {/* Personal Information */}
                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="firstName"
                              className="block text-sm font-medium text-gray-700"
                            >
                              First Name
                            </label>
                            <input
                              type="text"
                              name="firstName"
                              id="firstName"
                              required
                              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={formData.firstName}
                              onChange={handleChange}
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="lastName"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Last Name
                            </label>
                            <input
                              type="text"
                              name="lastName"
                              id="lastName"
                              required
                              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={formData.lastName}
                              onChange={handleChange}
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="matricNumber"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Matric Number
                          </label>
                          <input
                            type="text"
                            name="matricNumber"
                            id="matricNumber"
                            required
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={formData.matricNumber}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="position"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Position
                          </label>
                          <input
                            type="text"
                            name="position"
                            id="position"
                            required
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={formData.position}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="manifesto"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Manifesto
                          </label>
                          <textarea
                            id="manifesto"
                            name="manifesto"
                            rows={3}
                            required
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={formData.manifesto}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="electionId"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Election
                          </label>
                          <select
                            id="electionId"
                            name="electionId"
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            value={formData.electionId}
                            onChange={handleChange}
                          >
                            <option value="">Select Election</option>
                            {elections.map((election) => (
                              <option key={election._id} value={election._id}>
                                {election.title} ({election.category})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-indigo-400"
                  >
                    {submitting
                      ? "Saving..."
                      : modalType === "create"
                      ? "Add Candidate"
                      : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Candidates;
