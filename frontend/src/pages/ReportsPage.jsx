import React, { useState, useEffect } from 'react';
import { reportApi, vehicleApi } from '../api/client';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner, EmptyState } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';
import { 
  BarChart3, 
  IndianRupee, 
  CheckCircle2, 
  AlertTriangle, 
  Gauge, 
  Calendar, 
  Download, 
  Filter, 
  Car, 
  Users 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const ReportsPage = ({ onSelectCar }) => {
  const { error } = useToast();
  const [reportData, setReportData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [vehicleId, setVehicleId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeReportTab, setActiveReportTab] = useState('cars'); // 'cars', 'monthly', 'customers'

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    loadReport();
  }, [vehicleId]);

  const loadVehicles = async () => {
    try {
      const res = await vehicleApi.getAll(null, null);
      setVehicles(res.data || []);
    } catch {
      // Ignore
    }
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      const params = {
        vehicleId: vehicleId || null,
        startDate: startDate ? `${startDate}T00:00:00` : null,
        endDate: endDate ? `${endDate}T23:59:59` : null,
      };
      const res = await reportApi.getReports(params);
      setReportData(res.data);
    } catch (err) {
      error('Failed to generate business report');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadReport();
  };

  const exportCSV = () => {
    if (!reportData) return;
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeReportTab === 'cars') {
      csvContent += 'Registration,Car Name,Manufacturer,Total Rentals,Completed,Total Income,Payments Received,Outstanding,Km Driven\n';
      reportData.carReports.forEach((c) => {
        csvContent += `"${c.registrationNumber}","${c.name}","${c.manufacturer}",${c.totalRentals},${c.completedRentals},${c.totalIncome},${c.paymentsReceived},${c.outstanding},${c.kilometersDriven}\n`;
      });
    } else if (activeReportTab === 'monthly') {
      csvContent += 'Month,Trip Count,Total Income,Payments Received,Outstanding,Km Driven\n';
      reportData.monthlyReports.forEach((m) => {
        csvContent += `"${m.month}",${m.rentalCount},${m.income},${m.paymentsReceived},${m.outstanding},${m.kilometersDriven}\n`;
      });
    } else {
      csvContent += 'Customer Name,Phone,Total Trips,Total Spent,Total Paid,Outstanding\n';
      reportData.customerReports.forEach((cust) => {
        csvContent += `"${cust.fullName}","${cust.phone}",${cust.totalRentals},${cust.totalSpent},${cust.totalPaid},${cust.outstanding}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `car_rental_report_${activeReportTab}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Business Reports & Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed performance breakdown by vehicle, month, and customer records
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={!reportData}
          className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition disabled:opacity-50 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-primary-600" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Date & Car Filter Bar */}
      <form onSubmit={handleFilterSubmit} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2">
          <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Filter Car:</label>
          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Vehicles</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.registrationNumber} ({v.name})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">From:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">To:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-1.5 font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition shadow-sm ml-auto"
        >
          Apply Filters
        </button>

        {(startDate || endDate || vehicleId) && (
          <button
            type="button"
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setVehicleId('');
              setTimeout(loadReport, 50);
            }}
            className="text-xs text-rose-600 hover:underline font-medium"
          >
            Reset
          </button>
        )}
      </form>

      {/* Aggregate Report Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Period Income"
          value={formatCurrency(reportData?.totalIncome)}
          subtext={`From ${reportData?.totalRentals || 0} rental(s)`}
          icon={IndianRupee}
          color="emerald"
        />
        <StatCard
          title="Payments Received"
          value={formatCurrency(reportData?.totalPaymentsReceived)}
          subtext="Total collected in period"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Outstanding Due"
          value={formatCurrency(reportData?.totalOutstanding)}
          subtext="Pending payment balance"
          icon={AlertTriangle}
          color={Number(reportData?.totalOutstanding || 0) > 0 ? 'rose' : 'slate'}
        />
        <StatCard
          title="Period Distance"
          value={`${(reportData?.totalKilometers || 0).toLocaleString()} km`}
          subtext="Kilometres travelled"
          icon={Gauge}
          color="purple"
        />
      </div>

      {/* Report Section Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex items-center gap-6 px-6 pt-4 border-b border-slate-100">
          <button
            onClick={() => setActiveReportTab('cars')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeReportTab === 'cars'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Car-Wise Performance ({reportData?.carReports?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveReportTab('monthly')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeReportTab === 'monthly'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Monthly Statistics ({reportData?.monthlyReports?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveReportTab('customers')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeReportTab === 'customers'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customer Spending ({reportData?.customerReports?.length || 0})</span>
          </button>
        </div>

        {loading ? (
          <LoadingSpinner text="Generating report table..." />
        ) : (
          <div>
            {/* Tab 1: Car-wise Report */}
            {activeReportTab === 'cars' && (
              <div>
                {reportData?.carReports?.length === 0 ? (
                  <EmptyState title="No Car Data In Period" description="No rental records match the selected dates." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                          <th className="p-4">Car Registration</th>
                          <th className="p-4">Model & Make</th>
                          <th className="p-4">Rentals (Done)</th>
                          <th className="p-4">Distance Driven</th>
                          <th className="p-4">Total Income</th>
                          <th className="p-4">Payments Received</th>
                          <th className="p-4">Outstanding Due</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reportData?.carReports?.map((c) => (
                          <tr key={c.vehicleId} className="hover:bg-slate-50/60 transition">
                            <td className="p-4 font-mono font-bold text-slate-900">{c.registrationNumber}</td>
                            <td className="p-4 font-semibold text-slate-800">
                              {c.manufacturer} {c.name}
                            </td>
                            <td className="p-4 font-mono font-medium">
                              {c.totalRentals} ({c.completedRentals} completed)
                            </td>
                            <td className="p-4 font-mono font-bold text-purple-600">
                              {c.kilometersDriven.toLocaleString()} km
                            </td>
                            <td className="p-4 font-mono font-bold text-slate-900">
                              ₹{Number(c.totalIncome).toLocaleString()}
                            </td>
                            <td className="p-4 font-mono font-bold text-emerald-600">
                              ₹{Number(c.paymentsReceived).toLocaleString()}
                            </td>
                            <td className="p-4 font-mono">
                              {Number(c.outstanding) > 0 ? (
                                <span className="font-bold text-rose-600">₹{Number(c.outstanding).toLocaleString()}</span>
                              ) : (
                                <span className="text-emerald-600 font-bold">Clear</span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => onSelectCar?.(c.vehicleId)}
                                className="px-3 py-1 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition"
                              >
                                View Car
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Monthly Report */}
            {activeReportTab === 'monthly' && (
              <div>
                {reportData?.monthlyReports?.length === 0 ? (
                  <EmptyState title="No Monthly Data In Period" description="No trips found for selected criteria." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                          <th className="p-4">Month</th>
                          <th className="p-4">Rentals Count</th>
                          <th className="p-4">Total Revenue</th>
                          <th className="p-4">Payments Collected</th>
                          <th className="p-4">Outstanding Due</th>
                          <th className="p-4">Distance Driven</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reportData?.monthlyReports?.map((m) => (
                          <tr key={m.month} className="hover:bg-slate-50/60 transition font-medium">
                            <td className="p-4 font-bold text-slate-900">{m.month}</td>
                            <td className="p-4 font-mono font-bold text-primary-700">{m.rentalCount} trips</td>
                            <td className="p-4 font-mono font-black text-slate-900">₹{Number(m.income).toLocaleString()}</td>
                            <td className="p-4 font-mono font-black text-emerald-600">₹{Number(m.paymentsReceived).toLocaleString()}</td>
                            <td className="p-4 font-mono">
                              {Number(m.outstanding) > 0 ? (
                                <span className="font-bold text-rose-600">₹{Number(m.outstanding).toLocaleString()}</span>
                              ) : (
                                <span className="text-emerald-600 font-bold">Clear</span>
                              )}
                            </td>
                            <td className="p-4 font-mono font-bold text-purple-600">{m.kilometersDriven.toLocaleString()} km</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Customer Report */}
            {activeReportTab === 'customers' && (
              <div>
                {reportData?.customerReports?.length === 0 ? (
                  <EmptyState title="No Customer Records In Period" description="No customer rentals recorded." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                          <th className="p-4">Customer Name</th>
                          <th className="p-4">Phone Number</th>
                          <th className="p-4">Total Trips</th>
                          <th className="p-4">Total Spent</th>
                          <th className="p-4">Total Paid</th>
                          <th className="p-4">Outstanding Due</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reportData?.customerReports?.map((cust) => (
                          <tr key={cust.customerId} className="hover:bg-slate-50/60 transition font-medium">
                            <td className="p-4 font-bold text-slate-900">{cust.fullName}</td>
                            <td className="p-4 font-mono text-slate-600">{cust.phone}</td>
                            <td className="p-4 font-mono font-bold text-primary-700">{cust.totalRentals} trips</td>
                            <td className="p-4 font-mono font-bold text-slate-900">₹{Number(cust.totalSpent).toLocaleString()}</td>
                            <td className="p-4 font-mono font-bold text-emerald-600">₹{Number(cust.totalPaid).toLocaleString()}</td>
                            <td className="p-4 font-mono">
                              {Number(cust.outstanding) > 0 ? (
                                <span className="font-bold text-rose-600">₹{Number(cust.outstanding).toLocaleString()}</span>
                              ) : (
                                <span className="text-emerald-600 font-bold">Clear</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

