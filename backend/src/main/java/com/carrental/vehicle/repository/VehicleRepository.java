package com.carrental.vehicle.repository;

import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.entity.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    Optional<Vehicle> findByRegistrationNumberIgnoreCase(String registrationNumber);

    boolean existsByRegistrationNumberIgnoreCase(String registrationNumber);

    boolean existsByRegistrationNumberIgnoreCaseAndIdNot(String registrationNumber, Long id);

    List<Vehicle> findByStatus(VehicleStatus status);

    @Query("SELECT v FROM Vehicle v WHERE " +
           "(:search IS NULL OR LOWER(v.registrationNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(v.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(v.manufacturer) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR v.status = :status) " +
           "ORDER BY v.createdAt DESC")
    List<Vehicle> searchVehicles(@Param("search") String search, @Param("status") VehicleStatus status);

    long countByStatus(VehicleStatus status);
}
