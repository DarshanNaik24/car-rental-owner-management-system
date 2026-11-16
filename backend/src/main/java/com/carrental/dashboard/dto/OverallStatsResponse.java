package com.carrental.dashboard.dto;

import com.carrental.rental.dto.RentalResponse;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class OverallStatsResponse {

    // Cars
    private long totalCars;
    private long availableCars;
    private long rentedCars;
    private long maintenanceCars;

    // Rentals
    private long totalRentals;
    private long activeRentals;
    private long completedRentals;
    private long cancelledRentals;

    // Financials
    private BigDecimal totalRentalAmount = BigDecimal.ZERO;
    private BigDecimal totalPaymentsReceived = BigDecimal.ZERO;
    private BigDecimal totalOutstanding = BigDecimal.ZERO;

    // Mileage
    private long totalKilometersDriven;

    // Charts
    private List<MonthlyChartPoint> monthlyIncomeChart = new ArrayList<>();
    private List<MonthlyChartPoint> monthlyDistanceChart = new ArrayList<>();

    // Recent rentals
    private List<RentalResponse> recentRentals = new ArrayList<>();

    public OverallStatsResponse() {
    }

    public long getTotalCars() {
        return totalCars;
    }

    public void setTotalCars(long totalCars) {
        this.totalCars = totalCars;
    }

    public long getAvailableCars() {
        return availableCars;
    }

    public void setAvailableCars(long availableCars) {
        this.availableCars = availableCars;
    }

    public long getRentedCars() {
        return rentedCars;
    }

    public void setRentedCars(long rentedCars) {
        this.rentedCars = rentedCars;
    }

    public long getMaintenanceCars() {
        return maintenanceCars;
    }

    public void setMaintenanceCars(long maintenanceCars) {
        this.maintenanceCars = maintenanceCars;
    }

    public long getTotalRentals() {
        return totalRentals;
    }

    public void setTotalRentals(long totalRentals) {
        this.totalRentals = totalRentals;
    }

    public long getActiveRentals() {
        return activeRentals;
    }

    public void setActiveRentals(long activeRentals) {
        this.activeRentals = activeRentals;
    }

    public long getCompletedRentals() {
        return completedRentals;
    }

    public void setCompletedRentals(long completedRentals) {
        this.completedRentals = completedRentals;
    }

    public long getCancelledRentals() {
        return cancelledRentals;
    }

    public void setCancelledRentals(long cancelledRentals) {
        this.cancelledRentals = cancelledRentals;
    }

    public BigDecimal getTotalRentalAmount() {
        return totalRentalAmount;
    }

    public void setTotalRentalAmount(BigDecimal totalRentalAmount) {
        this.totalRentalAmount = totalRentalAmount;
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

    public long getTotalKilometersDriven() {
        return totalKilometersDriven;
    }

    public void setTotalKilometersDriven(long totalKilometersDriven) {
        this.totalKilometersDriven = totalKilometersDriven;
    }

    public List<MonthlyChartPoint> getMonthlyIncomeChart() {
        return monthlyIncomeChart;
    }

    public void setMonthlyIncomeChart(List<MonthlyChartPoint> monthlyIncomeChart) {
        this.monthlyIncomeChart = monthlyIncomeChart;
    }

    public List<MonthlyChartPoint> getMonthlyDistanceChart() {
        return monthlyDistanceChart;
    }

    public void setMonthlyDistanceChart(List<MonthlyChartPoint> monthlyDistanceChart) {
        this.monthlyDistanceChart = monthlyDistanceChart;
    }

    public List<RentalResponse> getRecentRentals() {
        return recentRentals;
    }

    public void setRecentRentals(List<RentalResponse> recentRentals) {
        this.recentRentals = recentRentals;
    }
}

