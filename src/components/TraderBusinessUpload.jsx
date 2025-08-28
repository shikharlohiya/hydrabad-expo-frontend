import React, { useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle, X } from "lucide-react";
import axiosInstance from "../library/axios";

const TraderBusinessUpload = () => {
  const [campaign, setCampaign] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileSelect = (selectedFile) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please select an Excel (.xlsx, .xls) or CSV file");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  const handleUpload = async () => {
    if (!campaign.trim()) {
      setError("Campaign name is required");
      return;
    }

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("campaign", campaign.trim());

    try {
      const response = await axiosInstance.post(
        "/upload-trader-businesses",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data);
      setCampaign("");
      setFile(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Upload Trader Business Data
      </h2>

      {/* Campaign Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Campaign Name *
        </label>
        <input
          type="text"
          value={campaign}
          onChange={(e) => setCampaign(e.target.value)}
          placeholder="Enter campaign name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload File *
        </label>
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-700 font-medium mb-3">
            Please ensure your Excel/CSV file has the following columns in the
            correct order. Here is an example:
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-xs text-gray-700">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Code
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Trader business Name
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Contact no
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Trader Name
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Region
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Zone
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    SAP ID
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Agent
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Contact
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b">
                  <td className="px-4 py-2">20016178</td>
                  <td className="px-4 py-2">Al Madina Traders</td>
                  <td className="px-4 py-2">923001234567</td>
                  <td className="px-4 py-2">Muhammad Ali</td>
                  <td className="px-4 py-2">CG00</td>
                  <td className="px-4 py-2">North</td>
                  <td className="px-4 py-2">1002003</td>
                  <td className="px-4 py-2">Calling Agent</td>
                  <td className="px-4 py-2">923337654321</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {!file ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-2">Choose a file or drag it here</p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) =>
                e.target.files[0] && handleFileSelect(e.target.files[0])
              }
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700"
            >
              Select File
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Excel (.xlsx, .xls) or CSV files only
            </p>
          </div>
        ) : (
          <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md">
            <FileText className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800 flex-1">{file.name}</span>
            <button
              onClick={() => setFile(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-md font-medium text-white ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Uploading...
          </div>
        ) : (
          "Upload Data"
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
            <div>
              <p className="text-green-800 font-medium mb-2">
                Upload Completed!
              </p>

              <div className="text-sm text-green-700 space-y-1">
                <div>
                  Processed:{" "}
                  <span className="font-medium">{result.processedCount}</span>
                </div>
                {result.createdCount > 0 && (
                  <div>
                    Created:{" "}
                    <span className="font-medium">{result.createdCount}</span>
                  </div>
                )}
                {result.updatedCount > 0 && (
                  <div>
                    Updated:{" "}
                    <span className="font-medium">{result.updatedCount}</span>
                  </div>
                )}
                {result.skippedCount > 0 && (
                  <div>
                    Skipped:{" "}
                    <span className="font-medium">{result.skippedCount}</span>
                  </div>
                )}
              </div>

              {result.skippedRecords && result.skippedRecords.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-green-800 hover:text-green-900">
                    View skipped records ({result.skippedRecords.length})
                  </summary>
                  <div className="mt-2 max-h-32 overflow-y-auto bg-white border rounded p-2">
                    {result.skippedRecords.map((record, index) => (
                      <div
                        key={index}
                        className="text-xs text-gray-600 py-1 border-b last:border-b-0"
                      >
                        <div className="font-medium text-red-600">
                          {record.error}
                        </div>
                        {record.Code && <div>Code: {record.Code}</div>}
                        {record["Trader business Name"] && (
                          <div>Business: {record["Trader business Name"]}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TraderBusinessUpload;
