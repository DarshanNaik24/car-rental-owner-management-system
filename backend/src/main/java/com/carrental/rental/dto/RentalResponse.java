package com.carrental.rental.dto;

import com.carrental.customer.dto.CustomerResponse;
import com.carrental.rental.entity.Rental;
import com.carrental.rental.entity.RentalStatus;
import com.carrental.vehicle.dto.VehicleResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RentalResponse {

    private Long id;
    private VehicleResponse vehicle;
    private CustomerResponse customer;
    private LocalDateTime pickupDatetime;
    private LocalDateTime expectedReturnDatetime;
    private LocalDateTime actualReturnDatetime;
    private Integer pickupOdometer;
    private Integer returnOdometer;
    private String pickupFuelLevel;
    private String returnFuelLevel;
    private BigDecimal agreedRentalAmount;
    private BigDecimal discountAmount;
    private BigDecimal additionalCharges;
    private BigDecimal totalRentalAmount;
    private BigDecimal totalPaid;
    private BigDecimal outstandingBalance;
    private RentalStatus status;
    private String pickupNotes;
    private String returnNotes;
    private String damageNotes;
    private String missingAccessories;
    private Integer totalKilometers;
    private long paymentCount;
    private long inspectionCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RentalResponse() {
    }

    public static RentalResponse fromEntity(Rental r) {
        if (r == null) return null;
        RentalResponse resp = new RentalResponse();
        resp.setId(r.getId());
        resp.setVehicle(VehicleResponse.fromEntity(r.getVehicle()));
        resp.setCustomer(CustomerResponse.fromEntity(r.getCustomer()));
        resp.setPickupDatetime(r.getPickupDatetime());
        resp.setExpectedReturnDatetime(r.getExpectedReturnDatetime());
        resp.setActualReturnDatetime(r.getActualReturnDatetime());
        resp.setPickupOdometer(r.getPickupOdometer());
        resp.setReturnOdometer(r.getReturnOdometer());
        resp.setPickupFuelLevel(r.getPickupFuelLevel());
        resp.setReturnFuelLevel(r.getReturnFuelLevel());
        resp.setAgreedRentalAmount(r.getAgreedRentalAmount());
        resp.setDiscountAmount(r.getDiscountAmount());
        resp.setAdditionalCharges(r.getAdditionalCharges());
        resp.setTotalRentalAmount(r.getTotalRentalAmount());
        resp.setStatus(r.getStatus());
        resp.setPickupNotes(r.getPickupNotes());
        resp.setReturnNotes(r.getReturnNotes());
        resp.setDamageNotes(r.getDamageNotes());
        resp.setMissingAccessories(r.getMissingAccessories());
        resp.setTotalKilometers(r.getTotalKilometers());
        resp.setCreatedAt(r.getCreatedAt());
        resp.setUpdatedAt(r.getUpdatedAt());

        BigDecimal totalPaid = BigDecimal.ZERO;
        if (r.getPayments() != null) {
            for (var p : r.getPayments()) {
                if (p.getAmount() != null) {
                    totalPaid = totalPaid.add(p.getAmount());
                }
            }
            resp.setPaymentCount(r.getPayments().size());
        }
        resp.setTotalPaid(totalPaid);

        BigDecimal total = r.getTotalRentalAmount() != null ? r.getTotalRentalAmount() : BigDecimal.ZERO;
        resp.setOutstandingBalance(total.subtract(totalPaid).max(BigDecimal.ZERO));

        if (r.getInspections() != null) {
            resp.setInspectionCount(r.getInspections().size());
        }

        return resp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public VehicleResponse getVehicle() {
        return vehicle;
    }

    public void setVehicle(VehicleResponse vehicle) {
        this.vehicle = vehicle;
    }

    public CustomerResponse getCustomer() {
        return customer;
    }

    public void setCustomer(CustomerResponse customer) {
        this.customer = customer;
    }

    public LocalDateTime getPickupDatetime() {
        return pickupDatetime;
    }

    public void setPickupDatetime(LocalDateTime pickupDatetime) {
        this.pickupDatetime = pickupDatetime;
    }

    public LocalDateTime getExpectedReturnDatetime() {
        return expectedReturnDatetime;
    }

    public void setExpectedReturnDatetime(LocalDateTime expectedReturnDatetime) {
        this.expectedReturnDatetime = expectedReturnDatetime;
    }

    public LocalDateTime getActualReturnDatetime() {
        return actualReturnDatetime;
    }

    public void setActualReturnDatetime(LocalDateTime actualReturnDatetime) {
        this.actualReturnDatetime = actualReturnDatetime;
    }

    public Integer getPickupOdometer() {
        return pickupOdometer;
    }

    public void setPickupOdometer(Integer pickupOdometer) {
        this.pickupOdometer = pickupOdometer;
    }

    public Integer getReturnOdometer() {
        return returnOdometer;
    }

    public void setReturnOdometer(Integer returnOdometer) {
        this.returnOdometer = returnOdometer;
    }

    public String getPickupFuelLevel() {
        return pickupFuelLevel;
    }

    public void setPickupFuelLevel(String pickupFuelLevel) {
        this.pickupFuelLevel = pickupFuelLevel;
    }

    public String getReturnFuelLevel() {
        return returnFuelLevel;
    }

    public void setReturnFuelLevel(String returnFuelLevel) {
        this.returnFuelLevel = returnFuelLevel;
    }

    public BigDecimal getAgreedRentalAmount() {
        return agreedRentalAmount;
    }

    public void setAgreedRentalAmount(BigDecimal agreedRentalAmount) {
        this.agreedRentalAmount = agreedRentalAmount;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getAdditionalCharges() {
        return additionalCharges;
    }

    public void setAdditionalCharges(BigDecimal additionalCharges) {
        this.additionalCharges = additionalCharges;
    }

    public BigDecimal getTotalRentalAmount() {
        return totalRentalAmount;
    }

    public void setTotalRentalAmount(BigDecimal totalRentalAmount) {
        this.totalRentalAmount = totalRentalAmount;
    }

    public BigDecimal getTotalPaid() {
        return totalPaid;
    }

    public void setTotalPaid(BigDecimal totalPaid) {
        this.totalPaid = totalPaid;
    }

    public BigDecimal getOutstandingBalance() {
        return outstandingBalance;
    }

    public void setOutstandingBalance(BigDecimal outstandingBalance) {
        this.outstandingBalance = outstandingBalance;
    }

    public RentalStatus getStatus() {
        return status;
    }

    public void setStatus(RentalStatus status) {
        this.status = status;
    }

    public String getPickupNotes() {
        return pickupNotes;
    }

    public void setPickupNotes(String pickupNotes) {
        this.pickupNotes = pickupNotes;
    }

    public String getReturnNotes() {
        return returnNotes;
    }

    public void setReturnNotes(String returnNotes) {
        this.returnNotes = returnNotes;
    }

    public String getDamageNotes() {
        return damageNotes;
    }

    public void setDamageNotes(String damageNotes) {
        this.damageNotes = damageNotes;
    }

    public String getMissingAccessories() {
        return missingAccessories;
    }

    public void setMissingAccessories(String missingAccessories) {
        this.missingAccessories = missingAccessories;
    }

    public Integer getTotalKilometers() {
        return totalKilometers;
    }

    public void setTotalKilometers(Integer totalKilometers) {
        this.totalKilometers = totalKilometers;
    }

    public long getPaymentCount() {
        return paymentCount;
    }

    public void setPaymentCount(long paymentCount) {
        this.paymentCount = paymentCount;
    }

    public long getInspectionCount() {
        return inspectionCount;
    }

    public void setInspectionCount(long inspectionCount) {
        this.inspectionCount = inspectionCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
