package com.carrental.dashboard.dto;

import com.carrental.rental.dto.RentalResponse;
import com.carrental.vehicle.dto.VehicleResponse;
import com.carrental.vehicle.entity.VehicleStatus;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CarStatsResponse {

    private VehicleResponse vehicle;
    private VehicleStatus currentStatus;
    private long totalRentals;
    private RentalResponse activeRental;
    private BigDecimal totalRentalIncome = BigDecimal.ZERO;
    private BigDecimal totalPaymentsReceived = BigDecimal.ZERO;
    private BigDecimal outstandingPayments = BigDecimal.ZERO;
    private long totalKilometersDriven;
    private RentalResponse lastRental;
    private List<RentalResponse> recentRentalHistory = new ArrayList<>();

    public CarStatsResponse() {
    }

    public VehicleResponse getVehicle() {
        return vehicle;
    }

    public void setVehicle(VehicleResponse vehicle) {
        this.vehicle = vehicle;
    }

    public VehicleStatus getCurrentStatus() {
        return currentStatus;
    }

    public void setCurrentStatus(VehicleStatus currentStatus) {
        this.currentStatus = currentStatus;
    }

    public long getTotalRentals() {
        return totalRentals;
    }

    public void setTotalRentals(long totalRentals) {
        this.totalRentals = totalRentals;
    }

    public RentalResponse getActiveRental() {
        return activeRental;
    }

    public void setActiveRental(RentalResponse activeRental) {
        this.activeRental = activeRental;
    }

    public BigDecimal getTotalRentalIncome() {
        return totalRentalIncome;
    }

    public void setTotalRentalIncome(BigDecimal totalRentalIncome) {
        this.totalRentalIncome = totalRentalIncome;
    }

    public BigDecimal getTotalPaymentsReceived() {
        return totalPaymentsReceived;
    }

    public void setTotalPaymentsReceived(BigDecimal totalPaymentsReceived) {
        this.totalPaymentsReceived = totalPaymentsReceived;
    }

    public BigDecimal getOutstandingPayments() {
        return outstandingPayments;
    }

    public void setOutstandingPayments(BigDecimal outstandingPayments) {
        this.outstandingPayments = outstandingPayments;
    }

    public long getTotalKilometersDriven() {
        return totalKilometersDriven;
    }

    public void setTotalKilometersDriven(long totalKilometersDriven) {
        this.totalKilometersDriven = totalKilometersDriven;
    }

    public RentalResponse getLastRental() {
        return lastRental;
    }

    public void setLastRental(RentalResponse lastRental) {
        this.lastRental = lastRental;
    }

    public List<RentalResponse> getRecentRentalHistory() {
        return recentRentalHistory;
    }

    public void setRecentRentalHistory(List<RentalResponse> recentRentalHistory) {
        this.recentRentalHistory = recentRentalHistory;
    }
}
