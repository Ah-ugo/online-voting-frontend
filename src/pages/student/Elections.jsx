"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StudentLayout from "../../components/layouts/StudentLayout";
import axios from "axios";
import { Tab } from "@headlessui/react";
import {
  ClockIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Elections = () => {
  const [elections, setElections] = useState({
    active: [],
    upcoming: [],
    past: [],
  });
  const [loading, setLoading] = useState(true);
  const API_URL = "https://online-voting-br3j.onrender.com";

  useEffect(() => {
    const fetchElections = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const [activeRes, upcomingRes, pastRes] = await Promise.all([
          axios.get(`${API_URL}/elections/active`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/elections/upcoming`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/elections/past`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        console.log("Active elections:", activeRes.data);
        console.log("Upcoming elections:", upcomingRes.data);
        console.log("Past elections:", pastRes.data);

        setElections({
          active: activeRes.data || [],
          upcoming: upcomingRes.data || [],
          past: pastRes.data || [],
        });
      } catch (error) {
        console.error("Error fetching elections:", error);
        toast.error("Failed to load elections. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, [API_URL]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getCategoryBadgeColor = (category) => {
    const categoryLower = category?.toLowerCase() || "";
    switch (categoryLower) {
      case "sug":
        return "bg-green-100 text-green-800";
      case "faculty":
        return "bg-blue-100 text-blue-800";
      case "department":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading elections...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Elections
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          View and participate in all available elections
        </p>
      </div>

      <div className="mt-6">
        <Tab.Group>
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
              <div className="flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Active Elections ({elections.active.length})
              </div>
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
              <div className="flex items-center justify-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                Upcoming Elections ({elections.upcoming.length})
              </div>
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
              <div className="flex items-center justify-center">
                <ArchiveBoxIcon className="w-5 h-5 mr-2" />
                Past Elections ({elections.past.length})
              </div>
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-2">
            <Tab.Panel className="rounded-xl bg-white p-3">
              {elections.active.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {elections.active.map((election) => (
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
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadgeColor(
                                    election.category
                                  )}`}
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
                <div className="px-4 py-12 text-center">
                  <p className="text-gray-500">
                    No active elections at the moment.
                  </p>
                </div>
              )}
            </Tab.Panel>
            <Tab.Panel className="rounded-xl bg-white p-3">
              {elections.upcoming.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {elections.upcoming.map((election) => (
                    <li key={election._id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {election.title}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadgeColor(
                                  election.category
                                )}`}
                              >
                                {election.category}
                              </p>
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Upcoming
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
                            <p>Starts: {formatDate(election.startDate)}</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-12 text-center">
                  <p className="text-gray-500">
                    No upcoming elections at the moment.
                  </p>
                </div>
              )}
            </Tab.Panel>
            <Tab.Panel className="rounded-xl bg-white p-3">
              {elections.past.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {elections.past.map((election) => (
                    <li key={election._id}>
                      <Link
                        to={`/results?election=${election._id}`}
                        className="block hover:bg-gray-50"
                      >
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {election.title}
                              </p>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadgeColor(
                                    election.category
                                  )}`}
                                >
                                  {election.category}
                                </p>
                              </div>
                            </div>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                Completed
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
                              <p>Ended: {formatDate(election.endDate)}</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-12 text-center">
                  <p className="text-gray-500">No past elections available.</p>
                </div>
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </StudentLayout>
  );
};

export default Elections;
