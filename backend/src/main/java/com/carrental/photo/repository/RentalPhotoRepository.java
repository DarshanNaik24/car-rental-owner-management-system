package com.carrental.photo.repository;

import com.carrental.photo.entity.PhotoType;
import com.carrental.photo.entity.RentalPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentalPhotoRepository extends JpaRepository<RentalPhoto, Long> {

    List<RentalPhoto> findByRentalIdOrderByCreatedAtDesc(Long rentalId);

    List<RentalPhoto> findByVehicleIdOrderByCreatedAtDesc(Long vehicleId);

    List<RentalPhoto> findByInspectionIdOrderByCreatedAtDesc(Long inspectionId);

    List<RentalPhoto> findByRentalIdAndPhotoType(Long rentalId, PhotoType photoType);
}

