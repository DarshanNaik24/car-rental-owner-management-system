package com.carrental.dashboard.controller;

import com.carrental.common.response.ApiResponse;
import com.carrental.dashboard.dto.CarStatsResponse;
import com.carrental.dashboard.dto.OverallStatsResponse;
import com.carrental.dashboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/overall")
    public ResponseEntity<ApiResponse<OverallStatsResponse>> getOverallStats() {
        OverallStatsResponse stats = dashboardService.getOverallStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/car/{vehicleId}")
    public ResponseEntity<ApiResponse<CarStatsResponse>> getCarStats(@PathVariable Long vehicleId) {
        CarStatsResponse stats = dashboardService.getCarStats(vehicleId);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
