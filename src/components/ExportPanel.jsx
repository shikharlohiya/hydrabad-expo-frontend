import React, { useState, useContext } from 'react';
import axiosInstance from '../library/axios';
import UserContext from '../context/UserContext';

const ExportPanel = ({ onClose }) => {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const { userData } = useContext(UserContext);

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      const { EmployeeRole, EmployeeId, EmployeePhone } = userData;
      let url = '';
      const params = new URLSearchParams();
      params.append('startDate', startDate);
      params.append('endDate', endDate);

      if (EmployeeRole === 1) {
        url = '/reports/all/download';
        params.append('agentNumber', EmployeePhone);
      } else if (EmployeeRole === 3) {
        url = '/reports/all/download';
      } else if (EmployeeRole === 2) {
        url = `/reports/manager-all-calls/${EmployeeId}/download`;
      } else {
        setExportError('You do not have permission to export data.');
        setIsExporting(false);
        return;
      }

      const response = await axiosInstance.get(url, {
        params,
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      link.download = `report-${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      onClose();
    } catch (error) {
      console.error('Excel export failed:', error);
      setExportError('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="absolute top-16 right-4 bg-white p-4 rounded-lg shadow-lg border z-50">
      <h3 className="text-lg font-semibold mb-4">Export Data</h3>
      {exportError && <p className="text-red-500 text-sm mb-4">{exportError}</p>}
      <div className="flex flex-col space-y-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex justify-end space-x-2">
            <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
                Cancel
            </button>
            <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
                {isExporting ? 'Exporting...' : 'Export'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPanel;