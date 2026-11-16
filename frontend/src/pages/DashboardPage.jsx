import React, { useState, useEffect } from 'react';
import { dashboardApi, vehicleApi } from '../api/client';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { LoadingSpinner, EmptyState } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';
import { 
  Car, 
  KeyRound, 
  IndianRupee, 
  Gauge, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const DashboardPage = ({ onNavigateTo, onSelectCar, onSelectRental }) => {
  const { error } = useToast();
  const [loading, setLoading] = useState(true);
  const [overallStats, setOverallStats] = useState(null);
  const [allCars, setAllCars] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState('');
  const [carStats, setCarStats] = useState(null);
  const [loadingCarStats, setLoadingCarStats] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, carsRes] = await Promise.all([
        dashboardApi.getOverallStats(),
        vehicleApi.getAll(null, null),
      ]);
      setOverallStats(statsRes.data);
      setAllCars(carsRes.data || []);
    } catch (err) {
      error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleCarSelect = async (carId) => {
    setSelectedCarId(carId);
    if (!carId) {
      setCarStats(null);
      return;
    }
    try {
      setLoadingCarStats(true);
      const res = await dashboardApi.getCarStats(carId);
      setCarStats(res.data);
    } catch (err) {
      error('Failed to load vehicle statistics');
    } finally {
      setLoadingCarStats(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading business dashboard..." />;
  }

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString()}`;

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-400 block mb-1">
            Owner Command Center
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Fleet & Rental Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Real-time tracking of rental income, active car deployments, vehicle inspections, and outstanding payments.
          </p>
        </div>

        {/* Quick car switcher */}
        <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 shrink-0 w-full md:w-80">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Filter By Specific Car</span>
            {selectedCarId && (
              <button
                onClick={() => handleCarSelect('')}
                className="text-primary-400 hover:text-primary-300 text-[10px] normal-case"
              >
                Clear (Show Overall)
              </button>
            )}
          </label>
          <select
            value={selectedCarId}
            onChange={(e) => handleCarSelect(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">-- All Cars (Overall Business) --</option>
            {allCars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.registrationNumber} — {c.manufacturer} {c.name} ({c.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Individual Car Statistics Section (when a car is selected) */}
      {selectedCarId && (
        <div className="p-6 bg-white rounded-3xl border border-primary-200/80 shadow-md space-y-6 animate-fade-in">
          {loadingCarStats ? (
            <LoadingSpinner size="md" text="Loading car performance..." />
          ) : carStats ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-600 font-bold">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900">
                        {carStats.vehicle?.manufacturer} {carStats.vehicle?.name}
                      </h3>
                      <Badge status={carStats.currentStatus} />
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      {carStats.vehicle?.registrationNumber} • {carStats.vehicle?.fuelType} • {carStats.vehicle?.transmission}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectCar?.(carStats.vehicle?.id)}
                  className="px-4 py-2 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-xl transition inline-flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <span>Open Full Car Details Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Specific Car Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <StatCard
                  title="Current Odometer"
                  value={`${carStats.vehicle?.currentOdometer || 0} km`}
                  icon={Gauge}
                  color="blue"
                />
                <StatCard
                  title="Total Rentals"
                  value={carStats.totalRentals}
                  subtext={`Completed: ${carStats.totalRentals}`}
                  icon={KeyRound}
                  color="purple"
                />
                <StatCard
                  title="Total Earnings"
                  value={formatCurrency(carStats.totalRentalIncome)}
                  icon={IndianRupee}
                  color="emerald"
                />
                <StatCard
                  title="Payments Received"
                  value={formatCurrency(carStats.totalPaymentsReceived)}
                  icon={CheckCircle2}
                  color="emerald"
                />
                <StatCard
                  title="Outstanding Due"
                  value={formatCurrency(carStats.outstandingPayments)}
                  icon={AlertTriangle}
                  color={carStats.outstandingPayments > 0 ? 'rose' : 'slate'}
                />
              </div>

              {/* Active Rental Alert for this car if any */}
              {carStats.activeRental && (
                <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800 bg-sky-200/80 px-2 py-0.5 rounded-full inline-block mb-1">
                      Currently On Active Rental
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      Rented by {carStats.activeRental.customer?.fullName} ({carStats.activeRental.customer?.primaryPhone})
                    </p>
                    <p className="text-xs text-slate-600">
                      Pickup: {new Date(carStats.activeRental.pickupDatetime).toLocaleString()} • Expected Return: {new Date(carStats.activeRental.expectedReturnDatetime).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectRental?.(carStats.activeRental.id)}
                    className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition shadow-sm shrink-0"
                  >
                    Manage Active Rental
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* Overall Fleet Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Fleet Status (Overall)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Total Cars"
            value={overallStats?.totalCars || 0}
            subtext="Registered vehicles"
            icon={Car}
            color="slate"
          />
          <StatCard
            title="Available Cars"
            value={overallStats?.availableCars || 0}
            subtext="Ready for rental"
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Currently Rented"
            value={overallStats?.rentedCars || 0}
            subtext="On trips"
            icon={KeyRound}
            color="blue"
          />
          <StatCard
            title="In Maintenance"
            value={overallStats?.maintenanceCars || 0}
            subtext="Repairs / servicing"
            icon={AlertTriangle}
            color="amber"
          />
        </div>
      </div>

      {/* Overall Financial & Trips Metrics */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Financial & Business Performance
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(overallStats?.totalRentalAmount)}
            subtext="Agreed + additions - discounts"
            icon={IndianRupee}
            color="emerald"
          />
          <StatCard
            title="Payments Received"
            value={formatCurrency(overallStats?.totalPaymentsReceived)}
            subtext="Total collected"
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Outstanding Balance"
            value={formatCurrency(overallStats?.totalOutstanding)}
            subtext="Pending collection"
            icon={AlertTriangle}
            color={overallStats?.totalOutstanding > 0 ? 'rose' : 'slate'}
          />
          <StatCard
            title="Total Km Driven"
            value={`${(overallStats?.totalKilometersDriven || 0).toLocaleString()} km`}
            subtext="Across all completed trips"
            icon={Gauge}
            color="purple"
          />
        </div>
      </div>

      {/* Monthly Charts Section (Section 5 requirement) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Rental Income</h3>
              <p className="text-xs text-slate-500">Rental revenue and collected payments (past 6 months)</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-sky-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Rental Amount
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Payments Received
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overallStats?.monthlyIncomeChart || []}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="paymentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  formatter={(val) => [`₹${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="income" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#incomeGrad)" name="Rental Income" />
                <Area type="monotone" dataKey="payments" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#paymentGrad)" name="Payments" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Distance Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Distance Travelled</h3>
              <p className="text-xs text-slate-500">Kilometres driven across all cars per month</p>
            </div>
            <span className="flex items-center gap-1.5 text-purple-600 font-semibold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Kilometres (km)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overallStats?.monthlyDistanceChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `${val}km`} />
                <Tooltip
                  formatter={(val) => [`${Number(val).toLocaleString()} km`, 'Distance']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                />
                <Bar dataKey="kilometers" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Kilometres" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Rentals Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Rental Activity</h3>
            <p className="text-xs text-slate-500">Latest trips, bookings, and active handovers</p>
          </div>
          <button
            onClick={() => onNavigateTo?.('rentals')}
            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <span>View All Rentals</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {overallStats?.recentRentals?.length === 0 ? (
          <EmptyState
            icon={KeyRound}
            title="No Rentals Yet"
            description="Start by creating your first rental record using the '+ New Rental' button."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="p-4">Rental ID</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Odometer</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Balance</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overallStats?.recentRentals?.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 font-mono font-bold text-slate-900">#{r.id}</td>
                    <td className="p-4 font-medium">
                      <div className="font-bold text-slate-900">{r.vehicle?.name}</div>
                      <div className="font-mono text-slate-500 text-[11px]">{r.vehicle?.registrationNumber}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{r.customer?.fullName}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{r.customer?.primaryPhone}</div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div>{new Date(r.pickupDatetime).toLocaleDateString()}</div>
                      <div className="text-slate-400 text-[11px]">to {new Date(r.expectedReturnDatetime).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4 font-mono">
                      {r.returnOdometer ? (
                        <span>{r.pickupOdometer} → {r.returnOdometer} ({r.totalKilometers} km)</span>
                      ) : (
                        <span>Pickup: {r.pickupOdometer} km</span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-900">
                      ₹{Number(r.totalRentalAmount).toLocaleString()}
                    </td>
                    <td className="p-4 font-mono">
                      {Number(r.outstandingBalance) > 0 ? (
                        <span className="font-bold text-rose-600">₹{Number(r.outstandingBalance).toLocaleString()}</span>
                      ) : (
                        <span className="text-emerald-600 font-bold">Paid</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge status={r.status} />
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onSelectRental?.(r.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 transition"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

