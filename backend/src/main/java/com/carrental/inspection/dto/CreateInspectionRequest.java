package com.carrental.inspection.dto;

import com.carrental.inspection.entity.InspectionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class CreateInspectionRequest {

    @NotNull(message = "Rental ID is required")
    private Long rentalId;

    @NotNull(message = "Inspection type is required")
    private InspectionType type;

    private LocalDateTime inspectionDatetime;

    private String inspectorNotes;

    @Valid
    private List<InspectionResultRequest> results = new ArrayList<>();

    public CreateInspectionRequest() {
    }

    public Long getRentalId() {
        return rentalId;
    }

    public void setRentalId(Long rentalId) {
        this.rentalId = rentalId;
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

    public List<InspectionResultRequest> getResults() {
        return results;
    }

    public void setResults(List<InspectionResultRequest> results) {
        this.results = results;
    }
}
