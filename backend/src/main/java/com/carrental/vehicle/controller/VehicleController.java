package com.carrental.vehicle.controller;

import com.carrental.common.response.ApiResponse;
import com.carrental.common.service.FileStorageService;
import com.carrental.vehicle.dto.VehicleRequest;
import com.carrental.vehicle.dto.VehicleResponse;
import com.carrental.vehicle.entity.VehicleStatus;
import com.carrental.vehicle.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;
    private final FileStorageService fileStorageService;

    public VehicleController(VehicleService vehicleService, FileStorageService fileStorageService) {
        this.vehicleService = vehicleService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getAllVehicles(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) VehicleStatus status) {
        List<VehicleResponse> vehicles = vehicleService.getAllVehicles(search, status);
        return ResponseEntity.ok(ApiResponse.ok(vehicles));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleById(@PathVariable Long id) {
        VehicleResponse vehicle = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(ApiResponse.ok(vehicle));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VehicleResponse>> createVehicle(@Valid @RequestBody VehicleRequest request) {
        VehicleResponse created = vehicleService.createVehicle(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Vehicle added successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleRequest request) {
        VehicleResponse updated = vehicleService.updateVehicle(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Vehicle updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam VehicleStatus status) {
        VehicleResponse updated = vehicleService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Vehicle status updated to " + status, updated));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<ApiResponse<String>> uploadCarImage(@RequestParam("file") MultipartFile file) {
        String fileUrl = fileStorageService.storeFile(file, "vehicles");
        return ResponseEntity.ok(ApiResponse.ok("Image uploaded successfully", fileUrl));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok(ApiResponse.ok("Vehicle deleted successfully", null));
    }
}
