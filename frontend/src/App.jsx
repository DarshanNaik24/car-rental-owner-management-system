import React, { useState } from 'react';
import { ToastProvider } from './components/Toast';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { CarsPage } from './pages/CarsPage';
import { CarDetailPage } from './pages/CarDetailPage';
import { CustomersPage } from './pages/CustomersPage';
import { RentalsPage } from './pages/RentalsPage';
import { RentalDetailPage } from './pages/RentalDetailPage';
import { InspectionsPage } from './pages/InspectionsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { CreateRentalModal } from './components/CreateRentalModal';
import { AddCarModal } from './components/AddCarModal';

function MainApp() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Deep view selections
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [selectedRentalId, setSelectedRentalId] = useState(null);

  // Global modals
  const [isNewRentalOpen, setIsNewRentalOpen] = useState(false);
  const [rentalInitialCarId, setRentalInitialCarId] = useState(null);
  const [isNewCarOpen, setIsNewCarOpen] = useState(false);

  const handleSelectCar = (carId) => {
    setSelectedCarId(carId);
    setSelectedRentalId(null);
  };

  const handleSelectRental = (rentalId) => {
    setSelectedRentalId(rentalId);
    setSelectedCarId(null);
  };

  const handleStartRentalForCar = (carId) => {
    setRentalInitialCarId(carId);
    setIsNewRentalOpen(true);
  };

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    setSelectedCarId(null);
    setSelectedRentalId(null);
  };

  const getPageTitle = () => {
    if (selectedRentalId) return `Rental #${selectedRentalId} Details`;
    if (selectedCarId) return 'Car Details & History';
    switch (currentTab) {
      case 'dashboard':
        return 'Business Dashboard';
      case 'cars':
        return 'My Cars';
      case 'customers':
        return 'Customer Records';
      case 'rentals':
        return 'Rentals & Trips';
      case 'inspections':
        return 'Vehicle Inspections';
      case 'payments':
        return 'Payment Ledger';
      case 'reports':
        return 'Reports & Analytics';
      case 'settings':
        return 'Settings';
      default:
        return 'Car Rental Management';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          onOpenMobileMenu={() => setMobileOpen(true)}
          onNewRental={() => {
            setRentalInitialCarId(null);
            setIsNewRentalOpen(true);
          }}
          onNewCar={() => setIsNewCarOpen(true)}
          title={getPageTitle()}
          subtitle="Personal Fleet & Rental Income Management System"
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {selectedRentalId ? (
            <RentalDetailPage
              rentalId={selectedRentalId}
              onBack={() => setSelectedRentalId(null)}
              onSelectCar={handleSelectCar}
            />
          ) : selectedCarId ? (
            <CarDetailPage
              carId={selectedCarId}
              onBack={() => setSelectedCarId(null)}
              onSelectRental={handleSelectRental}
              onStartRental={handleStartRentalForCar}
            />
          ) : currentTab === 'dashboard' ? (
            <DashboardPage
              onNavigateTo={handleTabChange}
              onSelectCar={handleSelectCar}
              onSelectRental={handleSelectRental}
            />
          ) : currentTab === 'cars' ? (
            <CarsPage
              onSelectCar={handleSelectCar}
              onStartRentalForCar={handleStartRentalForCar}
            />
          ) : currentTab === 'customers' ? (
            <CustomersPage onSelectRental={handleSelectRental} />
          ) : currentTab === 'rentals' ? (
            <RentalsPage
              onSelectRental={handleSelectRental}
              onNewRental={() => {
                setRentalInitialCarId(null);
                setIsNewRentalOpen(true);
              }}
            />
          ) : currentTab === 'inspections' ? (
            <InspectionsPage onSelectRental={handleSelectRental} />
          ) : currentTab === 'payments' ? (
            <PaymentsPage onSelectRental={handleSelectRental} />
          ) : currentTab === 'reports' ? (
            <ReportsPage onSelectCar={handleSelectCar} />
          ) : currentTab === 'settings' ? (
            <SettingsPage />
          ) : null}
        </main>
      </div>

      {/* Global Quick Create Rental Modal */}
      {isNewRentalOpen && (
        <CreateRentalModal
          isOpen={isNewRentalOpen}
          onClose={() => {
            setIsNewRentalOpen(false);
            setRentalInitialCarId(null);
          }}
          onSuccess={(newRental) => {
            if (newRental?.id) {
              handleSelectRental(newRental.id);
            }
          }}
          initialVehicleId={rentalInitialCarId}
        />
      )}

      {/* Global Add Car Modal */}
      {isNewCarOpen && (
        <AddCarModal
          isOpen={isNewCarOpen}
          onClose={() => setIsNewCarOpen(false)}
          onSuccess={() => {
            if (currentTab === 'cars') {
              // Trigger reload or keep on cars
            } else {
              handleTabChange('cars');
            }
          }}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}

export default App;

