package com.carrental.payment.dto;

import java.math.BigDecimal;

public class PaymentSummaryResponse {

    private BigDecimal totalRentalAmount = BigDecimal.ZERO;
    private BigDecimal totalPaymentsReceived = BigDecimal.ZERO;
    private BigDecimal totalOutstanding = BigDecimal.ZERO;
    private long totalRentalsCount;
    private long fullyPaidRentalsCount;
    private long partiallyPaidRentalsCount;
    private long unpaidRentalsCount;

    public PaymentSummaryResponse() {
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

    public long getTotalRentalsCount() {
        return totalRentalsCount;
    }

    public void setTotalRentalsCount(long totalRentalsCount) {
        this.totalRentalsCount = totalRentalsCount;
    }

    public long getFullyPaidRentalsCount() {
        return fullyPaidRentalsCount;
    }

    public void setFullyPaidRentalsCount(long fullyPaidRentalsCount) {
        this.fullyPaidRentalsCount = fullyPaidRentalsCount;
    }

    public long getPartiallyPaidRentalsCount() {
        return partiallyPaidRentalsCount;
    }

    public void setPartiallyPaidRentalsCount(long partiallyPaidRentalsCount) {
        this.partiallyPaidRentalsCount = partiallyPaidRentalsCount;
    }

    public long getUnpaidRentalsCount() {
        return unpaidRentalsCount;
    }

    public void setUnpaidRentalsCount(long unpaidRentalsCount) {
        this.unpaidRentalsCount = unpaidRentalsCount;
    }
}

