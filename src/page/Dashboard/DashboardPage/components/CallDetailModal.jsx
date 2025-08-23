import React from "react";
import {
  DocumentTextIcon,
  PlayIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const CallDetailModal = ({ isOpen, onClose, callDetail }) => {
  if (!isOpen || !callDetail) return null;

  const rawData = callDetail.originalCallData || {};
  const formDetails = callDetail.formDetail || rawData.formDetail || {};
  const traderMaster = rawData.trader_master || callDetail.contactData || {};
  const agentDetails = rawData.employee || rawData.agent || {};

  const formatDuration = (seconds) => {
    if (seconds === null || seconds === undefined) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <DocumentTextIcon className="w-6 h-6 mr-2 text-indigo-600" />
              Call Details - {callDetail.callId}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Call Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Call Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Call Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Call ID:</span>
                  <span className="font-medium">{rawData.CallId || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Caller Number:</span>
                  <span className="font-medium">
                    {callDetail.number || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Agent Number:</span>
                  <span className="font-medium">
                    {rawData.agentNumber || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Time:</span>
                  <span className="font-medium">
                    {rawData.startTime
                      ? new Date(rawData.startTime).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End Time:</span>
                  <span className="font-medium">
                    {rawData.endTime
                      ? new Date(rawData.endTime).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {formatDuration(rawData.duration)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      callDetail.status === "Connected"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {callDetail.status || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Trader Master Details */}
            {traderMaster && Object.keys(traderMaster).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Trader Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trader Name:</span>
                    <span className="font-medium">
                      {traderMaster.Trader_Name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Business Name:</span>
                    <span className="font-medium">
                      {traderMaster.Trader_business_Name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact Number:</span>
                    <span className="font-medium">
                      {traderMaster.Contact_no || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Region:</span>
                    <span className="font-medium">
                      {traderMaster.Region || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zone:</span>
                    <span className="font-medium">
                      {traderMaster.Zone || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Agent Details */}
            {agentDetails && Object.keys(agentDetails).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Agent Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employee ID:</span>
                    <span className="font-medium">
                      {agentDetails.EmployeeId || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">
                      {agentDetails.EmployeeName || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">
                      {agentDetails.EmployeePhone || "N/A"}
                    </span>
                  </div>
                  {/* <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">
                      {agentDetails.EmployeeMailId || "N/A"}
                    </span>
                  </div> */}
                </div>
              </div>
            )}

            {/* Form Details */}
            {formDetails && Object.keys(formDetails).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Form Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Call Type:</span>
                    <span className="font-medium">
                      {formDetails.callType || "N/A"}
                    </span>
                  </div>
                  {/* <div className="flex justify-between">
                    <span className="text-gray-600">Support Type:</span>
                    <span className="font-medium">
                      {formDetails.SupportType?.supportName || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Process Type:</span>
                    <span className="font-medium">
                      {formDetails.ProcessType?.processName || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Query Type:</span>
                    <span className="font-medium">
                      {formDetails.QueryType?.queryName || "N/A"}
                    </span>
                  </div> */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inquiry Type:</span>
                    <span className="font-medium">
                      {formDetails.ProblemCategory?.problemName || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inquiry Details:</span>
                    <span className="font-medium">
                      {formDetails.ProblemSubCategory?.subProblemName || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Follow-up Date:</span>
                    <span className="font-medium">
                      {formDetails.followUpDate
                        ? new Date(
                            formDetails.followUpDate
                          ).toLocaleDateString()
                        : "No follow-up"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600 text-sm">Remarks:</span>
                    <div className="mt-1 p-3 bg-white border rounded-lg">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {formDetails.remarks || "No remarks provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Voice Recording */}
          {rawData.voiceRecording !== "No Voice" && (
            <div className="mt-6 bg-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Voice Recording
              </h3>
              <a
                href={rawData.voiceRecording}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <PlayIcon className="w-4 h-4 mr-2" />
                Play Recording
              </a>
            </div>
          )}

          {/* Modal Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallDetailModal;
