import React from "react";
import { CalendarIcon, EyeIcon, PhoneIcon } from "@heroicons/react/24/outline";

const FollowUps = ({
  userData,
  followUps,
  formatFollowUpDate,
  getPriorityColor,
  handleViewFollowUpDetails,
  handleCallFromFollowUp,
  navigate,
}) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow border border-gray-200 max-h-[600px] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {userData?.EmployeeRole === 2
                ? "Team Pending Follow-ups"
                : "Pending Follow-ups"}
            </h3>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <button
                onClick={() => navigate("/dashboard/follow-up")}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                View All
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          {followUps.length > 0 ? (
            <div className="space-y-4">
              {followUps.slice(0, 5).map((followUp) => {
                const followUpInfo = formatFollowUpDate(followUp.followUpDate);

                return (
                  <div
                    key={followUp.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Trader Name */}
                        <h4 className="text-sm font-medium text-gray-900">
                          {followUp.customerName ||
                            followUp.traderName ||
                            "Unknown Trader"}
                        </h4>

                        {/* Phone Number */}
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <PhoneIcon className="w-3 h-3 mr-1" />
                          {followUp.phoneNumber ||
                            followUp.traderContact ||
                            "N/A"}
                        </p>

                        {/* Remarks */}
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Remark:</span>{" "}
                          {followUp.issue || followUp.remarks || "No remarks"}
                        </p>

                        {/* Follow-up Date */}
                        <p className="text-xs text-gray-500 mt-2">
                          Due:{" "}
                          <span
                            className={
                              followUpInfo.isOverdue
                                ? "text-red-600 font-medium"
                                : ""
                            }
                          >
                            {followUpInfo.text}
                          </span>
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="flex flex-col items-end space-y-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            followUp.status === "open"
                              ? "bg-green-100 text-green-800"
                              : followUp.status === "closed"
                              ? "bg-gray-100 text-gray-800"
                              : getPriorityColor(followUp.priority)
                          }`}
                        >
                          {followUp.status
                            ? followUp.status.toUpperCase()
                            : followUp.priority}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleViewFollowUpDetails(followUp)}
                        className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <EyeIcon className="w-3 h-3 mr-1" />
                        View Details
                      </button>

                      <button
                        onClick={() =>
                          handleCallFromFollowUp(
                            followUp.phoneNumber || followUp.traderContact,
                            followUp.customerName || followUp.traderName
                          )
                        }
                        className="inline-flex items-center text-xs text-green-600 hover:text-green-800 font-medium"
                        disabled={
                          !followUp.phoneNumber && !followUp.traderContact
                        }
                      >
                        <PhoneIcon className="w-3 h-3 mr-1" />
                        Call
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No pending follow-ups</p>
              <button
                onClick={() => navigate("/dashboard/follow-up")}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium mt-2"
              >
                View All Follow-ups
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowUps;
