package com.carrental.report.service;

import com.carrental.customer.entity.Customer;
import com.carrental.customer.repository.CustomerRepository;
import com.carrental.payment.entity.Payment;
import com.carrental.rental.entity.Rental;
import com.carrental.rental.entity.RentalStatus;
import com.carrental.rental.repository.RentalRepository;
import com.carrental.rental.specification.RentalSpecification;
import com.carrental.report.dto.ComprehensiveReportResponse;
import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class ReportService {

    private final RentalRepository rentalRepository;
    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;

    public ReportService(RentalRepository rentalRepository,
                         VehicleRepository vehicleRepository,
                         CustomerRepository customerRepository) {
        this.rentalRepository = rentalRepository;
        this.vehicleRepository = vehicleRepository;
        this.customerRepository = customerRepository;
    }

    public ComprehensiveReportResponse generateReport(LocalDateTime startDate, LocalDateTime endDate, Long vehicleId) {
        List<Rental> rentals = rentalRepository.findAll(RentalSpecification.filter(null, vehicleId, null, null, startDate, endDate));

        ComprehensiveReportResponse report = new ComprehensiveReportResponse();

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalPayments = BigDecimal.ZERO;
        long totalKm = 0;
        long totalRentalsCount = 0;

        // Groupings
        Map<Long, ComprehensiveReportResponse.CarReportItem> carMap = new LinkedHashMap<>();
        Map<Long, ComprehensiveReportResponse.CustomerReportItem> customerMap = new LinkedHashMap<>();
        Map<String, ComprehensiveReportResponse.MonthlyReportItem> monthlyMap = new TreeMap<>();

        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy");
        DateTimeFormatter sortKeyFormatter = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, String> displayKeyToMonth = new HashMap<>();

        for (Rental r : rentals) {
            if (r.getStatus() == RentalStatus.CANCELLED) continue;

            totalRentalsCount++;
            BigDecimal rAmount = r.getTotalRentalAmount() != null ? r.getTotalRentalAmount() : BigDecimal.ZERO;
            totalIncome = totalIncome.add(rAmount);

            BigDecimal rPaid = BigDecimal.ZERO;
            if (r.getPayments() != null) {
                for (Payment p : r.getPayments()) {
                    if (p.getAmount() != null) {
                        rPaid = rPaid.add(p.getAmount());
                    }
                }
            }
            totalPayments = totalPayments.add(rPaid);

            long rKm = r.getTotalKilometers() != null ? r.getTotalKilometers() : 0L;
            totalKm += rKm;

            // Car Wise
            Vehicle v = r.getVehicle();
            if (v != null) {
                ComprehensiveReportResponse.CarReportItem carItem = carMap.computeIfAbsent(v.getId(), k -> {
                    ComprehensiveReportResponse.CarReportItem item = new ComprehensiveReportResponse.CarReportItem();
                    item.setVehicleId(v.getId());
                    item.setRegistrationNumber(v.getRegistrationNumber());
                    item.setName(v.getName());
                    item.setManufacturer(v.getManufacturer());
                    return item;
                });
                carItem.setTotalRentals(carItem.getTotalRentals() + 1);
                if (r.getStatus() == RentalStatus.COMPLETED) {
                    carItem.setCompletedRentals(carItem.getCompletedRentals() + 1);
                }
                carItem.setTotalIncome(carItem.getTotalIncome().add(rAmount));
                carItem.setPaymentsReceived(carItem.getPaymentsReceived().add(rPaid));
                carItem.setOutstanding(carItem.getTotalIncome().subtract(carItem.getPaymentsReceived()).max(BigDecimal.ZERO));
                carItem.setKilometersDriven(carItem.getKilometersDriven() + rKm);
            }

            // Customer Wise
            Customer c = r.getCustomer();
            if (c != null) {
                ComprehensiveReportResponse.CustomerReportItem custItem = customerMap.computeIfAbsent(c.getId(), k -> {
                    ComprehensiveReportResponse.CustomerReportItem item = new ComprehensiveReportResponse.CustomerReportItem();
                    item.setCustomerId(c.getId());
                    item.setFullName(c.getFullName());
                    item.setPhone(c.getPrimaryPhone());
                    return item;
                });
                custItem.setTotalRentals(custItem.getTotalRentals() + 1);
                custItem.setTotalSpent(custItem.getTotalSpent().add(rAmount));
                custItem.setTotalPaid(custItem.getTotalPaid().add(rPaid));
                custItem.setOutstanding(custItem.getTotalSpent().subtract(custItem.getTotalPaid()).max(BigDecimal.ZERO));
            }

            // Monthly
            LocalDateTime dt = r.getPickupDatetime() != null ? r.getPickupDatetime() : r.getCreatedAt();
            String sortKey = dt.format(sortKeyFormatter);
            String displayMonth = dt.format(monthFormatter);
            displayKeyToMonth.put(sortKey, displayMonth);

            ComprehensiveReportResponse.MonthlyReportItem mItem = monthlyMap.computeIfAbsent(sortKey, k -> {
                ComprehensiveReportResponse.MonthlyReportItem item = new ComprehensiveReportResponse.MonthlyReportItem();
                item.setMonth(displayMonth);
                return item;
            });
            mItem.setRentalCount(mItem.getRentalCount() + 1);
            mItem.setIncome(mItem.getIncome().add(rAmount));
            mItem.setPaymentsReceived(mItem.getPaymentsReceived().add(rPaid));
            mItem.setOutstanding(mItem.getIncome().subtract(mItem.getPaymentsReceived()).max(BigDecimal.ZERO));
            mItem.setKilometersDriven(mItem.getKilometersDriven() + rKm);
        }

        report.setTotalRentals(totalRentalsCount);
        report.setTotalIncome(totalIncome);
        report.setTotalPaymentsReceived(totalPayments);
        report.setTotalOutstanding(totalIncome.subtract(totalPayments).max(BigDecimal.ZERO));
        report.setTotalKilometers(totalKm);

        report.setCarReports(new ArrayList<>(carMap.values()));
        report.setCustomerReports(new ArrayList<>(customerMap.values()));
        report.setMonthlyReports(new ArrayList<>(monthlyMap.values()));

        return report;
    }
}

