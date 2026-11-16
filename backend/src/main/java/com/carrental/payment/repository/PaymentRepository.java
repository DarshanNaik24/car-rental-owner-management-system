package com.carrental.payment.repository;

import com.carrental.payment.entity.Payment;
import com.carrental.payment.entity.PaymentMethod;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long>, JpaSpecificationExecutor<Payment> {

    List<Payment> findByRentalIdOrderByPaymentDatetimeDesc(Long rentalId);

    @Query("SELECT p FROM Payment p WHERE " +
           "(:rentalId IS NULL OR p.rental.id = :rentalId) AND " +
           "(:vehicleId IS NULL OR p.rental.vehicle.id = :vehicleId) AND " +
           "(:method IS NULL OR p.paymentMethod = :method) AND " +
           "(:startDate IS NULL OR p.paymentDatetime >= :startDate) AND " +
           "(:endDate IS NULL OR p.paymentDatetime <= :endDate) AND " +
           "(:search IS NULL OR " +
           " LOWER(p.rental.customer.fullName) LIKE LOWER(CAST(CONCAT('%', :search, '%') AS string)) OR " +
           " p.rental.customer.primaryPhone LIKE CAST(CONCAT('%', :search, '%') AS string) OR " +
           " LOWER(p.rental.vehicle.registrationNumber) LIKE LOWER(CAST(CONCAT('%', :search, '%') AS string)) OR " +
           " LOWER(p.referenceNumber) LIKE LOWER(CAST(CONCAT('%', :search, '%') AS string))) " +
           "ORDER BY p.paymentDatetime DESC")
    Page<Payment> searchPayments(
            @Param("search") String search,
            @Param("rentalId") Long rentalId,
            @Param("vehicleId") Long vehicleId,
            @Param("method") PaymentMethod method,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p")
    BigDecimal sumTotalPayments();

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.rental.vehicle.id = :vehicleId")
    BigDecimal sumPaymentsByVehicleId(@Param("vehicleId") Long vehicleId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paymentDatetime >= :startDate AND p.paymentDatetime <= :endDate")
    BigDecimal sumPaymentsBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}

