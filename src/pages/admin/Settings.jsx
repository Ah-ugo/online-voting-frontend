"use client";

import { useState, useEffect } from "react";
import AdminLayout from "../../components/layouts/AdminLayout";
import axios from "axios";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { Tab } from "@headlessui/react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Settings = () => {
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [modalType, setModalType] = useState("create"); // 'create' or 'edit'
  const [facultyFormData, setFacultyFormData] = useState({ name: "" });
  const [departmentFormData, setDepartmentFormData] = useState({
    name: "",
    faculty: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const API_URL = "https://online-voting-br3j.onrender.com";

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/faculties`);
      setFaculties(response.data);
    } catch (error) {
      console.error("Error fetching faculties:", error);
      toast.error("Failed to load faculties");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async (facultyId = null) => {
    try {
      setLoading(true);
      const url = facultyId
        ? `${API_URL}/departments?faculty=${facultyId}`
        : `${API_URL}/departments`;
      const response = await axios.get(url);
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyTabChange = (index) => {
    if (index === 0) {
      fetchFaculties();
    } else {
      fetchDepartments();
    }
  };

  // Faculty Modal Handlers
  const handleOpenCreateFacultyModal = () => {
    setModalType("create");
    setFacultyFormData({ name: "" });
    setShowFacultyModal(true);
  };

  const handleOpenEditFacultyModal = (faculty) => {
    setModalType("edit");
    setSelectedFaculty(faculty);
    setFacultyFormData({ name: faculty.name });
    setShowFacultyModal(true);
  };

  const handleFacultyChange = (e) => {
    const { name, value } = e.target;
    setFacultyFormData({ ...facultyFormData, [name]: value });
  };

  const handleFacultySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      if (modalType === "create") {
        await axios.post(`${API_URL}/admin/faculties`, facultyFormData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Faculty created successfully");
      } else {
        await axios.put(
          `${API_URL}/admin/faculties/${selectedFaculty._id}`,
          facultyFormData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Faculty updated successfully");
      }

      setShowFacultyModal(false);
      fetchFaculties();
    } catch (error) {
      console.error("Error submitting faculty:", error);
      toast.error(error.response?.data?.message || "Failed to save faculty");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFaculty = async (facultyId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this faculty? This will also delete all associated departments."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/admin/faculties/${facultyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Faculty deleted successfully");
      fetchFaculties();
    } catch (error) {
      console.error("Error deleting faculty:", error);
      toast.error(error.response?.data?.message || "Failed to delete faculty");
    }
  };

  // Department Modal Handlers
  const handleOpenCreateDepartmentModal = () => {
    setModalType("create");
    setDepartmentFormData({ name: "", faculty: "" });
    setShowDepartmentModal(true);
  };

  const handleOpenEditDepartmentModal = (department) => {
    setModalType("edit");
    setSelectedFaculty(department);
    setDepartmentFormData({
      name: department.name,
      faculty: department.faculty._id || department.faculty,
    });
    setShowDepartmentModal(true);
  };

  const handleDepartmentChange = (e) => {
    const { name, value } = e.target;
    setDepartmentFormData({ ...departmentFormData, [name]: value });
  };

  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      if (modalType === "create") {
        await axios.post(`${API_URL}/admin/departments`, departmentFormData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Department created successfully");
      } else {
        await axios.put(
          `${API_URL}/admin/departments/${selectedFaculty._id}`,
          departmentFormData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Department updated successfully");
      }

      setShowDepartmentModal(false);
      fetchDepartments();
    } catch (error) {
      console.error("Error submitting department:", error);
      toast.error(error.response?.data?.message || "Failed to save department");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (!window.confirm("Are you sure you want to delete this department?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/admin/departments/${departmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Department deleted successfully");
      fetchDepartments();
    } catch (error) {
      console.error("Error deleting department:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete department"
      );
    }
  };

  if (loading && faculties.length === 0 && departments.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Settings
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage faculties, departments, and other system settings
        </p>
      </div>

      <div className="mt-6">
        <Tab.Group onChange={handleFacultyTabChange}>
          <Tab.List className="flex space-x-1 rounded-xl bg-indigo-50 p-1">
            <Tab
              className={({ selected }) =>
                classNames(
                  "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                  "ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2",
                  selected
                    ? "bg-white text-indigo-700 shadow"
                    : "text-indigo-500 hover:bg-white/[0.12] hover:text-indigo-600"
                )
              }
            >
              Faculties
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                  "ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2",
                  selected
                    ? "bg-white text-indigo-700 shadow"
                    : "text-indigo-500 hover:bg-white/[0.12] hover:text-indigo-600"
                )
              }
            >
              Departments
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-2">
            <Tab.Panel className="rounded-xl bg-white p-3">
              <div className="sm:flex sm:items-center mb-4">
                <div className="sm:flex-auto">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Faculties
                  </h2>
                  <p className="mt-2 text-sm text-gray-700">
                    A list of all faculties in the university.
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                  <button
                    type="button"
                    onClick={handleOpenCreateFacultyModal}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                  >
                    <PlusIcon
                      className="-ml-1 mr-2 h-5 w-5"
                      aria-hidden="true"
                    />
                    Add Faculty
                  </button>
                </div>
              </div>
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Departments
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {faculties.length > 0 ? (
                      faculties.map((faculty) => (
                        <tr key={faculty._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {faculty.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {faculty.departmentCount || 0} departments
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() =>
                                  handleOpenEditFacultyModal(faculty)
                                }
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                <PencilIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </button>
                              <button
                                onClick={() => handleDeleteFaculty(faculty._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No faculties found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Tab.Panel>
            <Tab.Panel className="rounded-xl bg-white p-3">
              <div className="sm:flex sm:items-center mb-4">
                <div className="sm:flex-auto">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Departments
                  </h2>
                  <p className="mt-2 text-sm text-gray-700">
                    A list of all departments in the university.
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                  <button
                    type="button"
                    onClick={handleOpenCreateDepartmentModal}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                  >
                    <PlusIcon
                      className="-ml-1 mr-2 h-5 w-5"
                      aria-hidden="true"
                    />
                    Add Department
                  </button>
                </div>
              </div>
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Faculty
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {departments.length > 0 ? (
                      departments.map((department) => (
                        <tr key={department._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {department.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {department.faculty?.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() =>
                                  handleOpenEditDepartmentModal(department)
                                }
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                <PencilIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteDepartment(department._id)
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No departments found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* Faculty Modal */}
      {showFacultyModal && (
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
              <form onSubmit={handleFacultySubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {modalType === "create"
                          ? "Add New Faculty"
                          : "Edit Faculty"}
                      </h3>
                      <div className="mt-4">
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Faculty Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          required
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={facultyFormData.name}
                          onChange={handleFacultyChange}
                        />
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
                      ? "Add Faculty"
                      : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFacultyModal(false)}
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

      {/* Department Modal */}
      {showDepartmentModal && (
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
              <form onSubmit={handleDepartmentSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {modalType === "create"
                          ? "Add New Department"
                          : "Edit Department"}
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Department Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            value={departmentFormData.name}
                            onChange={handleDepartmentChange}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="faculty"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Faculty
                          </label>
                          <select
                            id="faculty"
                            name="faculty"
                            required
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            value={departmentFormData.faculty}
                            onChange={handleDepartmentChange}
                          >
                            <option value="">Select Faculty</option>
                            {faculties.map((faculty) => (
                              <option key={faculty._id} value={faculty._id}>
                                {faculty.name}
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
                      ? "Add Department"
                      : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDepartmentModal(false)}
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

export default Settings;
