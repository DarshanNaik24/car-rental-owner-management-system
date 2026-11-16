package com.carrental.payment.dto;

import com.carrental.payment.entity.Payment;
import com.carrental.payment.entity.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentResponse {

    private Long id;
    private Long rentalId;
    private Long vehicleId;
    private String vehicleRegistration;
    private String vehicleName;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private BigDecimal amount;
    private LocalDateTime paymentDatetime;
    private PaymentMethod paymentMethod;
    private String referenceNumber;
    private String notes;
    private BigDecimal rentalTotalAmount;
    private BigDecimal remainingRentalBalance;
    private LocalDateTime createdAt;

    public PaymentResponse() {
    }

    public static PaymentResponse fromEntity(Payment p) {
        if (p == null) return null;
        PaymentResponse resp = new PaymentResponse();
        resp.setId(p.getId());
        resp.setAmount(p.getAmount());
        resp.setPaymentDatetime(p.getPaymentDatetime());
        resp.setPaymentMethod(p.getPaymentMethod());
        resp.setReferenceNumber(p.getReferenceNumber());
        resp.setNotes(p.getNotes());
        resp.setCreatedAt(p.getCreatedAt());

        if (p.getRental() != null) {
            resp.setRentalId(p.getRental().getId());
            resp.setRentalTotalAmount(p.getRental().getTotalRentalAmount());

            if (p.getRental().getVehicle() != null) {
                resp.setVehicleId(p.getRental().getVehicle().getId());
                resp.setVehicleRegistration(p.getRental().getVehicle().getRegistrationNumber());
                resp.setVehicleName(p.getRental().getVehicle().getName());
            }

            if (p.getRental().getCustomer() != null) {
                resp.setCustomerId(p.getRental().getCustomer().getId());
                resp.setCustomerName(p.getRental().getCustomer().getFullName());
                resp.setCustomerPhone(p.getRental().getCustomer().getPrimaryPhone());
            }

            BigDecimal totalPaid = BigDecimal.ZERO;
            if (p.getRental().getPayments() != null) {
                for (var pay : p.getRental().getPayments()) {
                    if (pay.getAmount() != null) {
                        totalPaid = totalPaid.add(pay.getAmount());
                    }
                }
            }
            BigDecimal total = p.getRental().getTotalRentalAmount() != null ? p.getRental().getTotalRentalAmount() : BigDecimal.ZERO;
            resp.setRemainingRentalBalance(total.subtract(totalPaid).max(BigDecimal.ZERO));
        }

        return resp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRentalId() {
        return rentalId;
    }

    public void setRentalId(Long rentalId) {
        this.rentalId = rentalId;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getVehicleRegistration() {
        return vehicleRegistration;
    }

    public void setVehicleRegistration(String vehicleRegistration) {
        this.vehicleRegistration = vehicleRegistration;
    }

    public String getVehicleName() {
        return vehicleName;
    }

    public void setVehicleName(String vehicleName) {
        this.vehicleName = vehicleName;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDateTime getPaymentDatetime() {
        return paymentDatetime;
    }

    public void setPaymentDatetime(LocalDateTime paymentDatetime) {
        this.paymentDatetime = paymentDatetime;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public BigDecimal getRentalTotalAmount() {
        return rentalTotalAmount;
    }

    public void setRentalTotalAmount(BigDecimal rentalTotalAmount) {
        this.rentalTotalAmount = rentalTotalAmount;
    }

    public BigDecimal getRemainingRentalBalance() {
        return remainingRentalBalance;
    }

    public void setRemainingRentalBalance(BigDecimal remainingRentalBalance) {
        this.remainingRentalBalance = remainingRentalBalance;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

