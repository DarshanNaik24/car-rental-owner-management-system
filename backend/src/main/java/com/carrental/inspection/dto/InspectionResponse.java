package com.carrental.inspection.dto;

import com.carrental.inspection.entity.Inspection;
import com.carrental.inspection.entity.InspectionType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class InspectionResponse {

    private Long id;
    private Long rentalId;
    private Long vehicleId;
    private String vehicleRegistration;
    private String vehicleName;
    private InspectionType type;
    private LocalDateTime inspectionDatetime;
    private String inspectorNotes;
    private List<InspectionResultResponse> results = new ArrayList<>();
    private LocalDateTime createdAt;

    public InspectionResponse() {
    }

    public static InspectionResponse fromEntity(Inspection inspection) {
        if (inspection == null) return null;
        InspectionResponse resp = new InspectionResponse();
        resp.setId(inspection.getId());
        if (inspection.getRental() != null) {
            resp.setRentalId(inspection.getRental().getId());
        }
        if (inspection.getVehicle() != null) {
            resp.setVehicleId(inspection.getVehicle().getId());
            resp.setVehicleRegistration(inspection.getVehicle().getRegistrationNumber());
            resp.setVehicleName(inspection.getVehicle().getName());
        }
        resp.setType(inspection.getType());
        resp.setInspectionDatetime(inspection.getInspectionDatetime());
        resp.setInspectorNotes(inspection.getInspectorNotes());
        resp.setCreatedAt(inspection.getCreatedAt());

        if (inspection.getResults() != null) {
            resp.setResults(inspection.getResults().stream()
                    .map(InspectionResultResponse::fromEntity)
                    .collect(Collectors.toList()));
        }
        return resp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRentalId() {
        return rentalId;
    }

    public void setRentalId(Long rentalId) {
        this.rentalId = rentalId;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getVehicleRegistration() {
        return vehicleRegistration;
    }

    public void setVehicleRegistration(String vehicleRegistration) {
        this.vehicleRegistration = vehicleRegistration;
    }

    public String getVehicleName() {
        return vehicleName;
    }

    public void setVehicleName(String vehicleName) {
        this.vehicleName = vehicleName;
    }

    public InspectionType getType() {
        return type;
    }

    public void setType(InspectionType type) {
        this.type = type;
    }

    public LocalDateTime getInspectionDatetime() {
        return inspectionDatetime;
    }

    public void setInspectionDatetime(LocalDateTime inspectionDatetime) {
        this.inspectionDatetime = inspectionDatetime;
    }

    public String getInspectorNotes() {
        return inspectorNotes;
    }

    public void setInspectorNotes(String inspectorNotes) {
        this.inspectorNotes = inspectorNotes;
    }

    public List<InspectionResultResponse> getResults() {
        return results;
    }

    public void setResults(List<InspectionResultResponse> results) {
        this.results = results;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
