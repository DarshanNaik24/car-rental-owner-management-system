package com.carrental.inspection.dto;

import com.carrental.inspection.entity.ChecklistCategory;
import com.carrental.inspection.entity.InspectionResult;
import com.carrental.inspection.entity.InspectionStatus;

public class InspectionResultResponse {

    private Long id;
    private Long checklistItemId;
    private String itemName;
    private ChecklistCategory category;
    private InspectionStatus status;
    private String notes;
    private String photoUrl;

    public InspectionResultResponse() {
    }

    public static InspectionResultResponse fromEntity(InspectionResult result) {
        if (result == null) return null;
        InspectionResultResponse resp = new InspectionResultResponse();
        resp.setId(result.getId());
        if (result.getChecklistItem() != null) {
            resp.setChecklistItemId(result.getChecklistItem().getId());
            resp.setCategory(result.getChecklistItem().getCategory());
        }
        resp.setItemName(result.getItemName());
        resp.setStatus(result.getStatus());
        resp.setNotes(result.getNotes());
        resp.setPhotoUrl(result.getPhotoUrl());
        return resp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public ChecklistCategory getCategory() {
        return category;
    }

    public void setCategory(ChecklistCategory category) {
        this.category = category;
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
