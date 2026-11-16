package com.carrental.rental.controller;

import com.carrental.common.response.ApiResponse;
import com.carrental.rental.dto.CompleteRentalRequest;
import com.carrental.rental.dto.CreateRentalRequest;
import com.carrental.rental.dto.RentalResponse;
import com.carrental.rental.entity.RentalStatus;
import com.carrental.rental.service.RentalService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/rentals")
public class RentalController {

    private final RentalService rentalService;

    public RentalController(RentalService rentalService) {
        this.rentalService = rentalService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RentalResponse>> createRental(@Valid @RequestBody CreateRentalRequest request) {
        RentalResponse rental = rentalService.createRental(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Rental created successfully", rental));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<RentalResponse>> completeRental(
            @PathVariable Long id,
            @Valid @RequestBody CompleteRentalRequest request) {
        RentalResponse rental = rentalService.completeRental(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Rental completed successfully", rental));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<RentalResponse>> cancelRental(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        RentalResponse rental = rentalService.cancelRental(id, reason);
        return ResponseEntity.ok(ApiResponse.ok("Rental cancelled", rental));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RentalResponse>> getRentalById(@PathVariable Long id) {
        RentalResponse rental = rentalService.getRentalById(id);
        return ResponseEntity.ok(ApiResponse.ok(rental));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<RentalResponse>>> searchRentals(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long vehicleId,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) RentalStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "pickupDatetime") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        Page<RentalResponse> rentals = rentalService.searchRentals(search, vehicleId, customerId, status, startDate, endDate, pageRequest);
        return ResponseEntity.ok(ApiResponse.ok(rentals));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<ApiResponse<List<RentalResponse>>> getRentalsByVehicle(@PathVariable Long vehicleId) {
        List<RentalResponse> rentals = rentalService.getRentalsByVehicle(vehicleId);
        return ResponseEntity.ok(ApiResponse.ok(rentals));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<RentalResponse>>> getRentalsByCustomer(@PathVariable Long customerId) {
        List<RentalResponse> rentals = rentalService.getRentalsByCustomer(customerId);
        return ResponseEntity.ok(ApiResponse.ok(rentals));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRental(@PathVariable Long id) {
        rentalService.deleteRental(id);
        return ResponseEntity.ok(ApiResponse.ok("Rental deleted successfully", null));
    }
}

