package com.carrental.rental.dto;

import com.carrental.payment.entity.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CompleteRentalRequest {

    @NotNull(message = "Actual return date and time is required")
    private LocalDateTime actualReturnDatetime;

    @NotNull(message = "Return odometer is required")
    @Min(value = 0, message = "Return odometer must be non-negative")
    private Integer returnOdometer;

    @NotBlank(message = "Return fuel level is required")
    private String returnFuelLevel;

    private BigDecimal additionalCharges = BigDecimal.ZERO;

    private BigDecimal discountAdjustment = BigDecimal.ZERO;

    private String damageNotes;

    private String missingAccessories;

    private String returnNotes;

    private Boolean markVehicleMaintenance = false;

    // Optional payment received during return
    private BigDecimal paymentReceived;
    private PaymentMethod paymentMethod;
    private String paymentReference;

    public CompleteRentalRequest() {
    }

    public LocalDateTime getActualReturnDatetime() {
        return actualReturnDatetime;
    }

    public void setActualReturnDatetime(LocalDateTime actualReturnDatetime) {
        this.actualReturnDatetime = actualReturnDatetime;
    }

    public Integer getReturnOdometer() {
        return returnOdometer;
    }

    public void setReturnOdometer(Integer returnOdometer) {
        this.returnOdometer = returnOdometer;
    }

    public String getReturnFuelLevel() {
        return returnFuelLevel;
    }

    public void setReturnFuelLevel(String returnFuelLevel) {
        this.returnFuelLevel = returnFuelLevel;
    }

    public BigDecimal getAdditionalCharges() {
        return additionalCharges;
    }

    public void setAdditionalCharges(BigDecimal additionalCharges) {
        this.additionalCharges = additionalCharges;
    }

    public BigDecimal getDiscountAdjustment() {
        return discountAdjustment;
    }

    public void setDiscountAdjustment(BigDecimal discountAdjustment) {
        this.discountAdjustment = discountAdjustment;
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

    public String getReturnNotes() {
        return returnNotes;
    }

    public void setReturnNotes(String returnNotes) {
        this.returnNotes = returnNotes;
    }

    public Boolean getMarkVehicleMaintenance() {
        return markVehicleMaintenance;
    }

    public void setMarkVehicleMaintenance(Boolean markVehicleMaintenance) {
        this.markVehicleMaintenance = markVehicleMaintenance;
    }

    public BigDecimal getPaymentReceived() {
        return paymentReceived;
    }

    public void setPaymentReceived(BigDecimal paymentReceived) {
        this.paymentReceived = paymentReceived;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }
}

