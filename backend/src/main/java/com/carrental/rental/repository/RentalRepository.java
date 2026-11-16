package com.carrental.rental.repository;

import com.carrental.rental.entity.Rental;
import com.carrental.rental.entity.RentalStatus;
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
import java.util.Optional;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Long>, JpaSpecificationExecutor<Rental> {

    List<Rental> findByVehicleIdOrderByPickupDatetimeDesc(Long vehicleId);

    List<Rental> findByCustomerIdOrderByPickupDatetimeDesc(Long customerId);

    long countByCustomerId(Long customerId);

    long countByVehicleId(Long vehicleId);

    boolean existsByVehicleIdAndStatus(Long vehicleId, RentalStatus status);

    Optional<Rental> findFirstByVehicleIdAndStatus(Long vehicleId, RentalStatus status);

    @Query("SELECT r FROM Rental r WHERE " +
           "(:vehicleId IS NULL OR r.vehicle.id = :vehicleId) AND " +
           "(:customerId IS NULL OR r.customer.id = :customerId) AND " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:startDate IS NULL OR r.pickupDatetime >= :startDate) AND " +
           "(:endDate IS NULL OR r.pickupDatetime <= :endDate) AND " +
           "(:search IS NULL OR " +
           " LOWER(r.customer.fullName) LIKE LOWER(CAST(CONCAT('%', :search, '%') AS string)) OR " +
           " r.customer.primaryPhone LIKE CAST(CONCAT('%', :search, '%') AS string) OR " +
           " LOWER(r.vehicle.registrationNumber) LIKE LOWER(CAST(CONCAT('%', :search, '%') AS string)) OR " +
           " LOWER(r.vehicle.name) LIKE LOWER(CAST(CONCAT('%', :search, '%') AS string))) " +
           "ORDER BY r.pickupDatetime DESC")
    Page<Rental> searchRentals(
            @Param("search") String search,
            @Param("vehicleId") Long vehicleId,
            @Param("customerId") Long customerId,
            @Param("status") RentalStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    @Query("SELECT r FROM Rental r WHERE " +
           "(:vehicleId IS NULL OR r.vehicle.id = :vehicleId) AND " +
           "(:customerId IS NULL OR r.customer.id = :customerId) AND " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:startDate IS NULL OR r.pickupDatetime >= :startDate) AND " +
           "(:endDate IS NULL OR r.pickupDatetime <= :endDate) AND " +
           "(:search IS NULL OR " +
           " LOWER(r.customer.fullName) LIKE LOWER(CAST(CONCAT('%', :search, '%') AS string)) OR " +
           " r.customer.primaryPhone LIKE CAST(CONCAT('%', :search, '%') AS string) OR " +
           " LOWER(r.vehicle.registrationNumber) LIKE LOWER(CAST(CONCAT('%', :search, '%') AS string)) OR " +
           " LOWER(r.vehicle.name) LIKE LOWER(CAST(CONCAT('%', :search, '%') AS string))) " +
           "ORDER BY r.pickupDatetime DESC")
    List<Rental> filterRentalsList(
            @Param("search") String search,
            @Param("vehicleId") Long vehicleId,
            @Param("customerId") Long customerId,
            @Param("status") RentalStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    long countByStatus(RentalStatus status);

    @Query("SELECT COALESCE(SUM(r.totalRentalAmount), 0) FROM Rental r WHERE r.status != 'CANCELLED'")
    BigDecimal sumTotalRentalAmount();

    @Query("SELECT COALESCE(SUM(r.totalKilometers), 0) FROM Rental r WHERE r.status = 'COMPLETED'")
    Long sumTotalKilometers();

    @Query("SELECT r FROM Rental r ORDER BY r.createdAt DESC")
    List<Rental> findRecentRentals(Pageable pageable);
}

