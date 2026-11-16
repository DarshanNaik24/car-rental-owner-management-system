package com.carrental.inspection.controller;

import com.carrental.common.response.ApiResponse;
import com.carrental.common.service.FileStorageService;
import com.carrental.inspection.dto.*;
import com.carrental.inspection.service.InspectionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/inspections")
public class InspectionController {

    private final InspectionService inspectionService;
    private final FileStorageService fileStorageService;

    public InspectionController(InspectionService inspectionService, FileStorageService fileStorageService) {
        this.inspectionService = inspectionService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/checklist-items")
    public ResponseEntity<ApiResponse<List<ChecklistItemResponse>>> getChecklistItems() {
        List<ChecklistItemResponse> items = inspectionService.getActiveChecklistItems();
        return ResponseEntity.ok(ApiResponse.ok(items));
    }

    @PostMapping("/checklist-items")
    public ResponseEntity<ApiResponse<ChecklistItemResponse>> createChecklistItem(
            @Valid @RequestBody ChecklistItemRequest request) {
        ChecklistItemResponse created = inspectionService.createCustomChecklistItem(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Checklist item created", created));
    }

    @DeleteMapping("/checklist-items/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteChecklistItem(@PathVariable Long id) {
        inspectionService.deleteChecklistItem(id);
        return ResponseEntity.ok(ApiResponse.ok("Checklist item removed", null));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InspectionResponse>> saveInspection(
            @Valid @RequestBody CreateInspectionRequest request) {
        InspectionResponse response = inspectionService.createOrUpdateInspection(request);
        return ResponseEntity.ok(ApiResponse.ok("Inspection saved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InspectionResponse>> getInspectionById(@PathVariable Long id) {
        InspectionResponse response = inspectionService.getInspectionById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/rental/{rentalId}")
    public ResponseEntity<ApiResponse<List<InspectionResponse>>> getInspectionsByRental(@PathVariable Long rentalId) {
        List<InspectionResponse> responses = inspectionService.getInspectionsByRental(rentalId);
        return ResponseEntity.ok(ApiResponse.ok(responses));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<ApiResponse<List<InspectionResponse>>> getInspectionsByVehicle(@PathVariable Long vehicleId) {
        List<InspectionResponse> responses = inspectionService.getInspectionsByVehicle(vehicleId);
        return ResponseEntity.ok(ApiResponse.ok(responses));
    }

    @GetMapping("/compare/{rentalId}")
    public ResponseEntity<ApiResponse<InspectionComparisonResponse>> compareInspections(@PathVariable Long rentalId) {
        InspectionComparisonResponse comparison = inspectionService.compareInspections(rentalId);
        return ResponseEntity.ok(ApiResponse.ok(comparison));
    }

    @PostMapping("/upload-photo")
    public ResponseEntity<ApiResponse<String>> uploadInspectionPhoto(@RequestParam("file") MultipartFile file) {
        String fileUrl = fileStorageService.storeFile(file, "inspections");
        return ResponseEntity.ok(ApiResponse.ok("Photo uploaded successfully", fileUrl));
    }
}

