package com.carrental.rental.dto;

import com.carrental.customer.dto.CustomerRequest;
import com.carrental.payment.entity.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CreateRentalRequest {

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    private Long customerId;

    @Valid
    private CustomerRequest newCustomer;

    @NotNull(message = "Pickup date and time is required")
    private LocalDateTime pickupDatetime;

    @NotNull(message = "Expected return date and time is required")
    private LocalDateTime expectedReturnDatetime;

    @NotNull(message = "Pickup odometer reading is required")
    @Min(value = 0, message = "Pickup odometer must be non-negative")
    private Integer pickupOdometer;

    @NotBlank(message = "Pickup fuel level is required")
    private String pickupFuelLevel;

    @NotNull(message = "Agreed rental amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Agreed rental amount must be non-negative")
    private BigDecimal agreedRentalAmount;

    private BigDecimal discountAmount = BigDecimal.ZERO;

    private String notes;

    // Optional advance payment at booking/pickup
    private BigDecimal initialPayment;
    private PaymentMethod initialPaymentMethod;
    private String initialPaymentReference;

    public CreateRentalRequest() {
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public CustomerRequest getNewCustomer() {
        return newCustomer;
    }

    public void setNewCustomer(CustomerRequest newCustomer) {
        this.newCustomer = newCustomer;
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

    public Integer getPickupOdometer() {
        return pickupOdometer;
    }

    public void setPickupOdometer(Integer pickupOdometer) {
        this.pickupOdometer = pickupOdometer;
    }

    public String getPickupFuelLevel() {
        return pickupFuelLevel;
    }

    public void setPickupFuelLevel(String pickupFuelLevel) {
        this.pickupFuelLevel = pickupFuelLevel;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public BigDecimal getInitialPayment() {
        return initialPayment;
    }

    public void setInitialPayment(BigDecimal initialPayment) {
        this.initialPayment = initialPayment;
    }

    public PaymentMethod getInitialPaymentMethod() {
        return initialPaymentMethod;
    }

    public void setInitialPaymentMethod(PaymentMethod initialPaymentMethod) {
        this.initialPaymentMethod = initialPaymentMethod;
    }

    public String getInitialPaymentReference() {
        return initialPaymentReference;
    }

    public void setInitialPaymentReference(String initialPaymentReference) {
        this.initialPaymentReference = initialPaymentReference;
    }
}

