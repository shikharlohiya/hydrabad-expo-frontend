import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ChartBarIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";

const AdminCharts = ({ adminData }) => {
  // Colors for charts
  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#F97316",
  ];

  // Prepare chart data
  const prepareRegionChartData = () => {
    if (!adminData.callsPerRegion?.regions) return [];

    return adminData.callsPerRegion.regions
      .filter((region) => region.totalCalls > 0)
      .map((region) => ({
        name: region.region,
        inbound: region.inboundCalls,
        outbound: region.outboundCalls,
        total: region.totalCalls,
        employees: region.employeeCount,
        callsPerEmployee:
          region.employeeCount > 0
            ? Math.round(region.totalCalls / region.employeeCount)
            : 0,
      }))
      .sort((a, b) => b.total - a.total);
  };

  const prepareRegionPieData = () => {
    if (!adminData.callsPerRegion?.regions) return [];

    return adminData.callsPerRegion.regions
      .filter((region) => region.totalCalls > 0)
      .map((region) => ({
        name: region.region,
        value: region.totalCalls,
        percentage:
          adminData.callsPerRegion.summary.grandTotalCalls > 0
            ? Math.round(
                (region.totalCalls /
                  adminData.callsPerRegion.summary.grandTotalCalls) *
                  100
              )
            : 0,
      }))
      .sort((a, b) => b.value - a.value);
  };

  const regionChartData = prepareRegionChartData();
  const regionPieData = prepareRegionPieData();

  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{`Region: ${label}`}</p>
          <p className="text-blue-600">{`Inbound: ${data.inbound}`}</p>
          <p className="text-green-600">{`Outbound: ${data.outbound}`}</p>
          <p className="text-purple-600">{`Total: ${data.total}`}</p>
          <p className="text-gray-600">{`Employees: ${data.employees}`}</p>
          <p className="text-orange-600">{`Calls/Employee: ${data.callsPerEmployee}`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{`Region: ${data.name}`}</p>
          <p className="text-blue-600">{`Calls: ${data.value}`}</p>
          <p className="text-green-600">{`Share: ${data.percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  if (!adminData.callsPerRegion) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Calls by Region
            </h3>
          </div>
          <div className="flex items-center justify-center h-64 text-gray-500">
            No region data available
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <BuildingOfficeIcon className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Region Distribution
            </h3>
          </div>
          <div className="flex items-center justify-center h-64 text-gray-500">
            No region data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Bar Chart - Calls by Region */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ChartBarIcon className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Calls by Region
            </h3>
          </div>
          <div className="text-sm text-gray-600">
            Total: {adminData.callsPerRegion.summary.grandTotalCalls} calls
          </div>
        </div>

        {regionChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={regionChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="inbound"
                stackId="a"
                fill="#3B82F6"
                name="Inbound"
              />
              <Bar
                dataKey="outbound"
                stackId="a"
                fill="#10B981"
                name="Outbound"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No call data available for selected period
          </div>
        )}
      </div>

      {/* Pie Chart - Region Distribution */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BuildingOfficeIcon className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">
              Region Distribution
            </h3>
          </div>
          <div className="text-sm text-gray-600">
            {adminData.callsPerRegion.summary.totalRegions} regions
          </div>
        </div>

        {regionPieData.length > 0 ? (
          <div className="flex flex-col lg:flex-row items-center">
            <div className="w-full lg:w-2/3">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={regionPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {regionPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="w-full lg:w-1/3 lg:pl-4">
              <div className="space-y-2">
                {regionPieData.slice(0, 6).map((entry, index) => (
                  <div key={entry.name} className="flex items-center text-sm">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="flex-1">{entry.name}</span>
                    <span className="font-medium">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            No call data available for selected period
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCharts;
