package com.carrental.report.controller;

import com.carrental.common.response.ApiResponse;
import com.carrental.report.dto.ComprehensiveReportResponse;
import com.carrental.report.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ComprehensiveReportResponse>> getReports(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) Long vehicleId) {
        ComprehensiveReportResponse report = reportService.generateReport(startDate, endDate, vehicleId);
        return ResponseEntity.ok(ApiResponse.ok(report));
    }
}

