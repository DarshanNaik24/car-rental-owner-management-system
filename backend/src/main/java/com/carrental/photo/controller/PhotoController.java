package com.carrental.photo.controller;

import com.carrental.common.response.ApiResponse;
import com.carrental.photo.dto.RentalPhotoResponse;
import com.carrental.photo.entity.PhotoType;
import com.carrental.photo.service.PhotoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/photos")
public class PhotoController {

    private final PhotoService photoService;

    public PhotoController(PhotoService photoService) {
        this.photoService = photoService;
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<RentalPhotoResponse>> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Long rentalId,
            @RequestParam(required = false) Long vehicleId,
            @RequestParam(required = false) Long inspectionId,
            @RequestParam(defaultValue = "OTHER") PhotoType photoType,
            @RequestParam(required = false) String notes) {
        RentalPhotoResponse response = photoService.uploadAndSavePhoto(file, rentalId, vehicleId, inspectionId, photoType, notes);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Photo uploaded and recorded successfully", response));
    }

    @GetMapping("/rental/{rentalId}")
    public ResponseEntity<ApiResponse<List<RentalPhotoResponse>>> getPhotosByRental(@PathVariable Long rentalId) {
        List<RentalPhotoResponse> photos = photoService.getPhotosByRental(rentalId);
        return ResponseEntity.ok(ApiResponse.ok(photos));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<ApiResponse<List<RentalPhotoResponse>>> getPhotosByVehicle(@PathVariable Long vehicleId) {
        List<RentalPhotoResponse> photos = photoService.getPhotosByVehicle(vehicleId);
        return ResponseEntity.ok(ApiResponse.ok(photos));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePhoto(@PathVariable Long id) {
        photoService.deletePhoto(id);
        return ResponseEntity.ok(ApiResponse.ok("Photo deleted successfully", null));
    }
}
