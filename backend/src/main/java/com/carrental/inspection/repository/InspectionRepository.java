package com.carrental.inspection.repository;

import com.carrental.inspection.entity.Inspection;
import com.carrental.inspection.entity.InspectionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InspectionRepository extends JpaRepository<Inspection, Long> {

    List<Inspection> findByRentalIdOrderByInspectionDatetimeAsc(Long rentalId);

    List<Inspection> findByVehicleIdOrderByInspectionDatetimeDesc(Long vehicleId);

    Optional<Inspection> findByRentalIdAndType(Long rentalId, InspectionType type);

    boolean existsByRentalIdAndType(Long rentalId, InspectionType type);
}
