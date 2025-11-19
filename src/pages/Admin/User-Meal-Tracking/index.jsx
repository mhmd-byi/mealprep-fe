import React, { useState, useEffect, useRef, useMemo } from "react";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { Button, Input } from "../../../components";
import { useUserMealTracking } from "./useUserMealTracking";

export const UserMealTracking = () => {
  const [searchName, setSearchName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  
  const { 
    activityRecords, 
    isLoading, 
    error, 
    searchUserMealTracking,
    filterUsers,
    allUsers,
    isFetchingUsers,
    resetSearch,
  } = useUserMealTracking();

  // Memoize filtered suggestions with debounce
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  const userSuggestions = useMemo(() => {
    return filterUsers(debouncedSearchTerm);
  }, [debouncedSearchTerm, allUsers]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced search handler
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchName(value);
    setSelectedUser(null);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounce
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(value);
      if (value.trim().length >= 2) {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 300); // 300ms debounce delay
  };

  const handleSuggestionClick = (user) => {
    const fullName = `${user.firstName} ${user.lastName}`;
    setSearchName(fullName);
    setSelectedUser(user);
    setShowSuggestions(false);
    searchUserMealTracking(user._id);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (selectedUser) {
      setShowSuggestions(false);
      searchUserMealTracking(selectedUser._id);
    }
  };

  const handleReset = () => {
    setSearchName("");
    setSelectedUser(null);
    setShowSuggestions(false);
    setDebouncedSearchTerm("");
    resetSearch();
  };

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <DashboardLayoutComponent>
      <div className="flex flex-col p-4 sm:p-6 md:p-8 w-full h-full">
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-white rounded-lg overflow-visible shadow-md">
            <div className="p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">
                User Meal Trackings
              </h2>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1 w-full relative z-[100]">
                    <div ref={inputRef}>
                      <Input
                        type="text"
                        label="User Name"
                        placeholder="Enter user's first name or last name"
                        value={searchName}
                        onChange={handleSearchChange}
                        onFocus={() => {
                          if (searchName.trim().length >= 2 && userSuggestions.length > 0) {
                            setShowSuggestions(true);
                          }
                        }}
                        autoComplete="off"
                      />
                    </div>
                    
                    {/* Suggestions Dropdown */}
                    {showSuggestions && (searchName.trim().length >= 2) && (
                      <div
                        ref={suggestionsRef}
                        className="absolute z-[9999] w-full bg-white border border-gray-300 rounded-md shadow-2xl mt-1 max-h-80 overflow-y-auto"
                        style={{ top: '100%' }}
                      >
                        {isFetchingUsers ? (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            Loading users...
                          </div>
                        ) : userSuggestions.length > 0 ? (
                          <ul>
                            {userSuggestions.map((user) => (
                              <li
                                key={user._id}
                                onClick={() => handleSuggestionClick(user)}
                                className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                              >
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-gray-900">
                                    {user.firstName} {user.lastName}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {user.email}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            No users found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading || !selectedUser}
                    className="w-full sm:w-auto"
                  >
                    {isLoading ? "Searching..." : "Search"}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleReset}
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-gray-500 border-gray-500 hover:bg-white hover:text-gray-500"
                  >
                    Reset
                  </Button>
                </div>
              </form>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Selected User Info */}
              {selectedUser && activityRecords.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">User Information:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-blue-700">Name:</span>{" "}
                      <span className="text-blue-900">{selectedUser.firstName} {selectedUser.lastName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Email:</span>{" "}
                      <span className="text-blue-900">{selectedUser.email}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Results Table */}
              <div className="overflow-x-auto">
                {activityRecords.length > 0 ? (
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {[
                          "Date",
                          "Description",
                        ].map((header) => (
                          <th
                            key={header}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activityRecords.map((record, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-100 border-b md:border-none flex flex-col md:table-row"
                        >
                          {/* Mobile View - Card-like Layout */}
                          <td className="md:hidden p-4">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="font-medium text-gray-500">Date:</span>
                                <span>{formatDate(record.date)}</span>
                              </div>
                              <div className="flex justify-start">
                                <span className="font-medium text-gray-500 mr-2">Activity:</span>
                                <span className="capitalize">
                                  {record.description}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Desktop View */}
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left hidden md:table-cell">
                            {formatDate(record.date)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 capitalize text-left hidden md:table-cell">
                            {record.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                                ) : (
                  !isLoading && !error && (
                    <p className="text-center py-4 text-gray-500">
                      {selectedUser 
                        ? "No meal tracking activity found for this user" 
                        : "Enter a user name and select from suggestions to view meal trackings"}
                    </p>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};
