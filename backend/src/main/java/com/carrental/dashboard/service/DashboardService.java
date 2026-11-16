package com.carrental.dashboard.service;

import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.dashboard.dto.CarStatsResponse;
import com.carrental.dashboard.dto.MonthlyChartPoint;
import com.carrental.dashboard.dto.OverallStatsResponse;
import com.carrental.payment.entity.Payment;
import com.carrental.payment.repository.PaymentRepository;
import com.carrental.rental.dto.RentalResponse;
import com.carrental.rental.entity.Rental;
import com.carrental.rental.entity.RentalStatus;
import com.carrental.rental.repository.RentalRepository;
import com.carrental.vehicle.dto.VehicleResponse;
import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.entity.VehicleStatus;
import com.carrental.vehicle.repository.VehicleRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final VehicleRepository vehicleRepository;
    private final RentalRepository rentalRepository;
    private final PaymentRepository paymentRepository;

    public DashboardService(VehicleRepository vehicleRepository,
                            RentalRepository rentalRepository,
                            PaymentRepository paymentRepository) {
        this.vehicleRepository = vehicleRepository;
        this.rentalRepository = rentalRepository;
        this.paymentRepository = paymentRepository;
    }

    public OverallStatsResponse getOverallStats() {
        OverallStatsResponse stats = new OverallStatsResponse();

        // Car stats
        stats.setTotalCars(vehicleRepository.count());
        stats.setAvailableCars(vehicleRepository.countByStatus(VehicleStatus.AVAILABLE));
        stats.setRentedCars(vehicleRepository.countByStatus(VehicleStatus.RENTED));
        stats.setMaintenanceCars(vehicleRepository.countByStatus(VehicleStatus.MAINTENANCE));

        // Rental stats
        stats.setTotalRentals(rentalRepository.count());
        stats.setActiveRentals(rentalRepository.countByStatus(RentalStatus.ACTIVE));
        stats.setCompletedRentals(rentalRepository.countByStatus(RentalStatus.COMPLETED));
        stats.setCancelledRentals(rentalRepository.countByStatus(RentalStatus.CANCELLED));

        // Financial stats
        BigDecimal totalRentalAmount = rentalRepository.sumTotalRentalAmount();
        BigDecimal totalPaymentsReceived = paymentRepository.sumTotalPayments();
        stats.setTotalRentalAmount(totalRentalAmount != null ? totalRentalAmount : BigDecimal.ZERO);
        stats.setTotalPaymentsReceived(totalPaymentsReceived != null ? totalPaymentsReceived : BigDecimal.ZERO);
        stats.setTotalOutstanding(stats.getTotalRentalAmount().subtract(stats.getTotalPaymentsReceived()).max(BigDecimal.ZERO));

        // Mileage
        Long totalKm = rentalRepository.sumTotalKilometers();
        stats.setTotalKilometersDriven(totalKm != null ? totalKm : 0L);

        // Recent rentals
        List<Rental> recentRentalsList = rentalRepository.findRecentRentals(PageRequest.of(0, 5, Sort.by("createdAt").descending()));
        stats.setRecentRentals(recentRentalsList.stream().map(RentalResponse::fromEntity).collect(Collectors.toList()));

        // Build monthly charts (past 6 months)
        buildMonthlyCharts(stats);

        return stats;
    }

    public CarStatsResponse getCarStats(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));

        CarStatsResponse stats = new CarStatsResponse();
        stats.setVehicle(VehicleResponse.fromEntity(vehicle));
        stats.setCurrentStatus(vehicle.getStatus());

        List<Rental> rentals = rentalRepository.findByVehicleIdOrderByPickupDatetimeDesc(vehicleId);
        stats.setTotalRentals(rentals.size());

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalPayments = BigDecimal.ZERO;
        long totalKm = 0;
        Rental activeRental = null;
        Rental lastRental = null;

        for (Rental r : rentals) {
            if (r.getStatus() != RentalStatus.CANCELLED) {
                if (r.getTotalRentalAmount() != null) {
                    totalIncome = totalIncome.add(r.getTotalRentalAmount());
                }
                if (r.getPayments() != null) {
                    for (Payment p : r.getPayments()) {
                        if (p.getAmount() != null) {
                            totalPayments = totalPayments.add(p.getAmount());
                        }
                    }
                }
            }

            if (r.getStatus() == RentalStatus.ACTIVE && activeRental == null) {
                activeRental = r;
            }

            if (r.getStatus() == RentalStatus.COMPLETED) {
                if (r.getTotalKilometers() != null) {
                    totalKm += r.getTotalKilometers();
                }
                if (lastRental == null) {
                    lastRental = r;
                }
            }
        }

        stats.setTotalRentalIncome(totalIncome);
        stats.setTotalPaymentsReceived(totalPayments);
        stats.setOutstandingPayments(totalIncome.subtract(totalPayments).max(BigDecimal.ZERO));
        stats.setTotalKilometersDriven(totalKm);

        if (activeRental != null) {
            stats.setActiveRental(RentalResponse.fromEntity(activeRental));
        }
        if (lastRental != null) {
            stats.setLastRental(RentalResponse.fromEntity(lastRental));
        }

        stats.setRecentRentalHistory(rentals.stream()
                .limit(10)
                .map(RentalResponse::fromEntity)
                .collect(Collectors.toList()));

        return stats;
    }

    private void buildMonthlyCharts(OverallStatsResponse stats) {
        DateTimeFormatter monthKeyFormatter = DateTimeFormatter.ofPattern("yyyy-MM");
        DateTimeFormatter monthDisplayFormatter = DateTimeFormatter.ofPattern("MMM yyyy");

        // Map of monthKey -> MonthlyChartPoint
        Map<String, MonthlyChartPoint> chartMap = new LinkedHashMap<>();
        LocalDateTime now = LocalDateTime.now();

        // Initialize last 6 months in chronological order
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthDate = now.minusMonths(i);
            String key = monthDate.format(monthKeyFormatter);
            String display = monthDate.format(monthDisplayFormatter);
            chartMap.put(key, new MonthlyChartPoint(display, BigDecimal.ZERO, BigDecimal.ZERO, 0L, 0L));
        }

        List<Rental> allRentals = rentalRepository.findAll();
        for (Rental r : allRentals) {
            if (r.getStatus() == RentalStatus.CANCELLED) continue;
            LocalDateTime dt = r.getPickupDatetime() != null ? r.getPickupDatetime() : r.getCreatedAt();
            String key = dt.format(monthKeyFormatter);

            if (chartMap.containsKey(key)) {
                MonthlyChartPoint point = chartMap.get(key);
                if (r.getTotalRentalAmount() != null) {
                    point.setIncome(point.getIncome().add(r.getTotalRentalAmount()));
                }
                if (r.getTotalKilometers() != null) {
                    point.setKilometers(point.getKilometers() + r.getTotalKilometers());
                }
                point.setRentalCount(point.getRentalCount() + 1);
            }
        }

        List<Payment> allPayments = paymentRepository.findAll();
        for (Payment p : allPayments) {
            LocalDateTime dt = p.getPaymentDatetime() != null ? p.getPaymentDatetime() : p.getCreatedAt();
            String key = dt.format(monthKeyFormatter);
            if (chartMap.containsKey(key)) {
                MonthlyChartPoint point = chartMap.get(key);
                if (p.getAmount() != null) {
                    point.setPayments(point.getPayments().add(p.getAmount()));
                }
            }
        }

        List<MonthlyChartPoint> points = new ArrayList<>(chartMap.values());
        stats.setMonthlyIncomeChart(points);
        stats.setMonthlyDistanceChart(points);
    }
}

