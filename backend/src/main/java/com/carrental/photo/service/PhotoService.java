package com.carrental.photo.service;

import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.common.service.FileStorageService;
import com.carrental.inspection.entity.Inspection;
import com.carrental.inspection.repository.InspectionRepository;
import com.carrental.photo.dto.RentalPhotoResponse;
import com.carrental.photo.entity.PhotoType;
import com.carrental.photo.entity.RentalPhoto;
import com.carrental.photo.repository.RentalPhotoRepository;
import com.carrental.rental.entity.Rental;
import com.carrental.rental.repository.RentalRepository;
import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PhotoService {

    private final RentalPhotoRepository rentalPhotoRepository;
    private final FileStorageService fileStorageService;
    private final RentalRepository rentalRepository;
    private final VehicleRepository vehicleRepository;
    private final InspectionRepository inspectionRepository;

    public PhotoService(RentalPhotoRepository rentalPhotoRepository,
                        FileStorageService fileStorageService,
                        RentalRepository rentalRepository,
                        VehicleRepository vehicleRepository,
                        InspectionRepository inspectionRepository) {
        this.rentalPhotoRepository = rentalPhotoRepository;
        this.fileStorageService = fileStorageService;
        this.rentalRepository = rentalRepository;
        this.vehicleRepository = vehicleRepository;
        this.inspectionRepository = inspectionRepository;
    }

    public RentalPhotoResponse uploadAndSavePhoto(MultipartFile file,
                                                  Long rentalId,
                                                  Long vehicleId,
                                                  Long inspectionId,
                                                  PhotoType photoType,
                                                  String notes) {
        String subFolder = (photoType != null) ? photoType.name().toLowerCase() : "general";
        String fileUrl = fileStorageService.storeFile(file, subFolder);

        RentalPhoto photo = new RentalPhoto();
        photo.setPhotoUrl(fileUrl);
        photo.setFileName(file.getOriginalFilename());
        photo.setPhotoType(photoType != null ? photoType : PhotoType.OTHER);
        photo.setNotes(notes);

        if (rentalId != null) {
            Rental rental = rentalRepository.findById(rentalId)
                    .orElseThrow(() -> new ResourceNotFoundException("Rental not found with id: " + rentalId));
            photo.setRental(rental);
            if (vehicleId == null && rental.getVehicle() != null) {
                photo.setVehicle(rental.getVehicle());
            }
        }

        if (vehicleId != null) {
            Vehicle vehicle = vehicleRepository.findById(vehicleId)
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));
            photo.setVehicle(vehicle);
        }

        if (inspectionId != null) {
            Inspection inspection = inspectionRepository.findById(inspectionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Inspection not found with id: " + inspectionId));
            photo.setInspection(inspection);
        }

        RentalPhoto saved = rentalPhotoRepository.save(photo);
        return RentalPhotoResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<RentalPhotoResponse> getPhotosByRental(Long rentalId) {
        return rentalPhotoRepository.findByRentalIdOrderByCreatedAtDesc(rentalId)
                .stream()
                .map(RentalPhotoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RentalPhotoResponse> getPhotosByVehicle(Long vehicleId) {
        return rentalPhotoRepository.findByVehicleIdOrderByCreatedAtDesc(vehicleId)
                .stream()
                .map(RentalPhotoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public void deletePhoto(Long id) {
        RentalPhoto photo = rentalPhotoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Photo not found with id: " + id));
        rentalPhotoRepository.delete(photo);
    }
}

