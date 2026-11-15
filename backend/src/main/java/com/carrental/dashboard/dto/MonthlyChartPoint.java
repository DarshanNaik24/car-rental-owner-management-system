package com.carrental.dashboard.dto;

import java.math.BigDecimal;

public class MonthlyChartPoint {

    private String month; // e.g. "2026-06", "Jun 2026"
    private BigDecimal income = BigDecimal.ZERO;
    private BigDecimal payments = BigDecimal.ZERO;
    private Long kilometers = 0L;
    private Long rentalCount = 0L;

    public MonthlyChartPoint() {
    }

    public MonthlyChartPoint(String month, BigDecimal income, BigDecimal payments, Long kilometers, Long rentalCount) {
        this.month = month;
        this.income = income != null ? income : BigDecimal.ZERO;
        this.payments = payments != null ? payments : BigDecimal.ZERO;
        this.kilometers = kilometers != null ? kilometers : 0L;
        this.rentalCount = rentalCount != null ? rentalCount : 0L;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public BigDecimal getIncome() {
        return income;
    }

    public void setIncome(BigDecimal income) {
        this.income = income;
    }

    public BigDecimal getPayments() {
        return payments;
    }

    public void setPayments(BigDecimal payments) {
        this.payments = payments;
    }

    public Long getKilometers() {
        return kilometers;
    }

    public void setKilometers(Long kilometers) {
        this.kilometers = kilometers;
    }

    public Long getRentalCount() {
        return rentalCount;
    }

    public void setRentalCount(Long rentalCount) {
        this.rentalCount = rentalCount;
    }
}
