package com.carrental.payment.controller;

import com.carrental.common.response.ApiResponse;
import com.carrental.payment.dto.PaymentRequest;
import com.carrental.payment.dto.PaymentResponse;
import com.carrental.payment.dto.PaymentSummaryResponse;
import com.carrental.payment.entity.PaymentMethod;
import com.carrental.payment.service.PaymentService;
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
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> recordPayment(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.recordPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Payment recorded successfully", response));
    }

    @GetMapping("/rental/{rentalId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByRental(@PathVariable Long rentalId) {
        List<PaymentResponse> payments = paymentService.getPaymentsByRental(rentalId);
        return ResponseEntity.ok(ApiResponse.ok(payments));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> searchPayments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long rentalId,
            @RequestParam(required = false) Long vehicleId,
            @RequestParam(required = false) PaymentMethod method,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "paymentDatetime") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);
        Page<PaymentResponse> payments = paymentService.searchPayments(search, rentalId, vehicleId, method, startDate, endDate, pageRequest);
        return ResponseEntity.ok(ApiResponse.ok(payments));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<PaymentSummaryResponse>> getPaymentSummary() {
        PaymentSummaryResponse summary = paymentService.getPaymentSummary();
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.ok(ApiResponse.ok("Payment deleted successfully", null));
    }
}
