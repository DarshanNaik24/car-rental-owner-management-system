package com.carrental.vehicle.service;

import com.carrental.common.exception.BusinessException;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.vehicle.dto.VehicleRequest;
import com.carrental.vehicle.dto.VehicleResponse;
import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.entity.VehicleStatus;
import com.carrental.vehicle.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> getAllVehicles(String search, VehicleStatus status) {
        String searchTerm = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        return vehicleRepository.searchVehicles(searchTerm, status)
                .stream()
                .map(VehicleResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VehicleResponse getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        return VehicleResponse.fromEntity(vehicle);
    }

    @Transactional(readOnly = true)
    public Vehicle getVehicleEntity(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
    }

    public VehicleResponse createVehicle(VehicleRequest request) {
        String reg = request.getRegistrationNumber().trim().toUpperCase();
        if (vehicleRepository.existsByRegistrationNumberIgnoreCase(reg)) {
            throw new BusinessException("A car with registration number " + reg + " already exists.");
        }

        Vehicle vehicle = new Vehicle();
        copyProperties(request, vehicle);
        vehicle.setRegistrationNumber(reg);

        Vehicle saved = vehicleRepository.save(vehicle);
        return VehicleResponse.fromEntity(saved);
    }

    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        Vehicle vehicle = getVehicleEntity(id);

        String reg = request.getRegistrationNumber().trim().toUpperCase();
        if (vehicleRepository.existsByRegistrationNumberIgnoreCaseAndIdNot(reg, id)) {
            throw new BusinessException("Another car already has registration number " + reg);
        }

        copyProperties(request, vehicle);
        vehicle.setRegistrationNumber(reg);

        Vehicle updated = vehicleRepository.save(vehicle);
        return VehicleResponse.fromEntity(updated);
    }

    public VehicleResponse updateStatus(Long id, VehicleStatus status) {
        Vehicle vehicle = getVehicleEntity(id);
        vehicle.setStatus(status);
        Vehicle saved = vehicleRepository.save(vehicle);
        return VehicleResponse.fromEntity(saved);
    }

    public void updateOdometer(Long id, Integer newOdometer) {
        Vehicle vehicle = getVehicleEntity(id);
        if (newOdometer != null && newOdometer > vehicle.getCurrentOdometer()) {
            vehicle.setCurrentOdometer(newOdometer);
            vehicleRepository.save(vehicle);
        }
    }

    public void deleteVehicle(Long id) {
        Vehicle vehicle = getVehicleEntity(id);
        if (vehicle.getStatus() == VehicleStatus.RENTED) {
            throw new BusinessException("Cannot delete vehicle while it is currently rented.");
        }
        vehicleRepository.delete(vehicle);
    }

    private void copyProperties(VehicleRequest src, Vehicle target) {
        target.setName(src.getName().trim());
        target.setManufacturer(src.getManufacturer().trim());
        target.setVariant(src.getVariant() != null ? src.getVariant().trim() : null);
        target.setFuelType(src.getFuelType().trim().toUpperCase());
        target.setTransmission(src.getTransmission().trim().toUpperCase());
        target.setCurrentOdometer(src.getCurrentOdometer());
        target.setManufacturingYear(src.getManufacturingYear());
        target.setNotes(src.getNotes());
        target.setImageUrl(src.getImageUrl());
        if (src.getStatus() != null) {
            target.setStatus(src.getStatus());
        }
    }
}
