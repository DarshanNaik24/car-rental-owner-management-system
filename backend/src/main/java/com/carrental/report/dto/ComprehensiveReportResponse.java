package com.carrental.report.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ComprehensiveReportResponse {

    private BigDecimal totalIncome = BigDecimal.ZERO;
    private BigDecimal totalPaymentsReceived = BigDecimal.ZERO;
    private BigDecimal totalOutstanding = BigDecimal.ZERO;
    private long totalRentals;
    private long totalKilometers;

    private List<CarReportItem> carReports = new ArrayList<>();
    private List<CustomerReportItem> customerReports = new ArrayList<>();
    private List<MonthlyReportItem> monthlyReports = new ArrayList<>();

    public ComprehensiveReportResponse() {
    }

    public static class CarReportItem {
        private Long vehicleId;
        private String registrationNumber;
        private String name;
        private String manufacturer;
        private long totalRentals;
        private long completedRentals;
        private BigDecimal totalIncome = BigDecimal.ZERO;
        private BigDecimal paymentsReceived = BigDecimal.ZERO;
        private BigDecimal outstanding = BigDecimal.ZERO;
        private long kilometersDriven;

        public CarReportItem() {
        }

        public Long getVehicleId() {
            return vehicleId;
        }

        public void setVehicleId(Long vehicleId) {
            this.vehicleId = vehicleId;
        }

        public String getRegistrationNumber() {
            return registrationNumber;
        }

        public void setRegistrationNumber(String registrationNumber) {
            this.registrationNumber = registrationNumber;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getManufacturer() {
            return manufacturer;
        }

        public void setManufacturer(String manufacturer) {
            this.manufacturer = manufacturer;
        }

        public long getTotalRentals() {
            return totalRentals;
        }

        public void setTotalRentals(long totalRentals) {
            this.totalRentals = totalRentals;
        }

        public long getCompletedRentals() {
            return completedRentals;
        }

        public void setCompletedRentals(long completedRentals) {
            this.completedRentals = completedRentals;
        }

        public BigDecimal getTotalIncome() {
            return totalIncome;
        }

        public void setTotalIncome(BigDecimal totalIncome) {
            this.totalIncome = totalIncome;
        }

        public BigDecimal getPaymentsReceived() {
            return paymentsReceived;
        }

        public void setPaymentsReceived(BigDecimal paymentsReceived) {
            this.paymentsReceived = paymentsReceived;
        }

        public BigDecimal getOutstanding() {
            return outstanding;
        }

        public void setOutstanding(BigDecimal outstanding) {
            this.outstanding = outstanding;
        }

        public long getKilometersDriven() {
            return kilometersDriven;
        }

        public void setKilometersDriven(long kilometersDriven) {
            this.kilometersDriven = kilometersDriven;
        }
    }

    public static class CustomerReportItem {
        private Long customerId;
        private String fullName;
        private String phone;
        private long totalRentals;
        private BigDecimal totalSpent = BigDecimal.ZERO;
        private BigDecimal totalPaid = BigDecimal.ZERO;
        private BigDecimal outstanding = BigDecimal.ZERO;

        public CustomerReportItem() {
        }

        public Long getCustomerId() {
            return customerId;
        }

        public void setCustomerId(Long customerId) {
            this.customerId = customerId;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public long getTotalRentals() {
            return totalRentals;
        }

        public void setTotalRentals(long totalRentals) {
            this.totalRentals = totalRentals;
        }

        public BigDecimal getTotalSpent() {
            return totalSpent;
        }

        public void setTotalSpent(BigDecimal totalSpent) {
            this.totalSpent = totalSpent;
        }

        public BigDecimal getTotalPaid() {
            return totalPaid;
        }

        public void setTotalPaid(BigDecimal totalPaid) {
            this.totalPaid = totalPaid;
        }

        public BigDecimal getOutstanding() {
            return outstanding;
        }

        public void setOutstanding(BigDecimal outstanding) {
            this.outstanding = outstanding;
        }
    }

    public static class MonthlyReportItem {
        private String month;
        private long rentalCount;
        private BigDecimal income = BigDecimal.ZERO;
        private BigDecimal paymentsReceived = BigDecimal.ZERO;
        private BigDecimal outstanding = BigDecimal.ZERO;
        private long kilometersDriven;

        public MonthlyReportItem() {
        }

        public String getMonth() {
            return month;
        }

        public void setMonth(String month) {
            this.month = month;
        }

        public long getRentalCount() {
            return rentalCount;
        }

        public void setRentalCount(long rentalCount) {
            this.rentalCount = rentalCount;
        }

        public BigDecimal getIncome() {
            return income;
        }

        public void setIncome(BigDecimal income) {
            this.income = income;
        }

        public BigDecimal getPaymentsReceived() {
            return paymentsReceived;
        }

        public void setPaymentsReceived(BigDecimal paymentsReceived) {
            this.paymentsReceived = paymentsReceived;
        }

        public BigDecimal getOutstanding() {
            return outstanding;
        }

        public void setOutstanding(BigDecimal outstanding) {
            this.outstanding = outstanding;
        }

        public long getKilometersDriven() {
            return kilometersDriven;
        }

        public void setKilometersDriven(long kilometersDriven) {
            this.kilometersDriven = kilometersDriven;
        }
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getTotalPaymentsReceived() {
        return totalPaymentsReceived;
    }

    public void setTotalPaymentsReceived(BigDecimal totalPaymentsReceived) {
        this.totalPaymentsReceived = totalPaymentsReceived;
    }

    public BigDecimal getTotalOutstanding() {
        return totalOutstanding;
    }

    public void setTotalOutstanding(BigDecimal totalOutstanding) {
        this.totalOutstanding = totalOutstanding;
    }

    public long getTotalRentals() {
        return totalRentals;
    }

    public void setTotalRentals(long totalRentals) {
        this.totalRentals = totalRentals;
    }

    public long getTotalKilometers() {
        return totalKilometers;
    }

    public void setTotalKilometers(long totalKilometers) {
        this.totalKilometers = totalKilometers;
    }

    public List<CarReportItem> getCarReports() {
        return carReports;
    }

    public void setCarReports(List<CarReportItem> carReports) {
        this.carReports = carReports;
    }

    public List<CustomerReportItem> getCustomerReports() {
        return customerReports;
    }

    public void setCustomerReports(List<CustomerReportItem> customerReports) {
        this.customerReports = customerReports;
    }

    public List<MonthlyReportItem> getMonthlyReports() {
        return monthlyReports;
    }

    public void setMonthlyReports(List<MonthlyReportItem> monthlyReports) {
        this.monthlyReports = monthlyReports;
    }
}
