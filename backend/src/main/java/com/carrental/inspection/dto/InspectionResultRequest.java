package com.carrental.inspection.dto;

import com.carrental.inspection.entity.InspectionResult;
import com.carrental.inspection.entity.InspectionStatus;
import jakarta.validation.constraints.NotNull;

public class InspectionResultRequest {

    @NotNull(message = "Checklist item ID is required")
    private Long checklistItemId;

    private String itemName;

    @NotNull(message = "Inspection status is required")
    private InspectionStatus status = InspectionStatus.OK;

    private String notes;

    private String photoUrl;

    public InspectionResultRequest() {
    }

    public Long getChecklistItemId() {
        return checklistItemId;
    }

    public void setChecklistItemId(Long checklistItemId) {
        this.checklistItemId = checklistItemId;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public InspectionStatus getStatus() {
        return status;
    }

    public void setStatus(InspectionStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }
}
