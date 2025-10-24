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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-h-[600px] flex flex-col">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              {userData?.EmployeeRole === 2
                ? "Team Pending Follow-ups"
                : "Pending Follow-ups"}
            </h3>
            <button
              onClick={() => navigate("/dashboard/follow-up")}
              className="text-sm text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-5">
          {followUps.length > 0 ? (
            <div className="space-y-3">
              {followUps.slice(0, 5).map((followUp, index) => {
                const followUpInfo = formatFollowUpDate(followUp.followUpDate);

                return (
                  <div
                    key={`${followUp.id}-${index}`}
                    className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-sm transition-all"
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
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleViewFollowUpDetails(followUp)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <EyeIcon className="w-3.5 h-3.5 mr-1" />
                        View
                      </button>

                      <button
                        onClick={() =>
                          handleCallFromFollowUp(
                            followUp.phoneNumber || followUp.traderContact,
                            followUp.customerName || followUp.traderName
                          )
                        }
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={
                          !followUp.phoneNumber && !followUp.traderContact
                        }
                      >
                        <PhoneIcon className="w-3.5 h-3.5 mr-1" />
                        Call
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 text-sm font-medium mb-2">No pending follow-ups</p>
              <p className="text-gray-500 text-xs mb-4">All caught up!</p>
              <button
                onClick={() => navigate("/dashboard/follow-up")}
                className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
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
