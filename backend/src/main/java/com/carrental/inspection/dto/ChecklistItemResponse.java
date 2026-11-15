package com.carrental.inspection.dto;

import com.carrental.inspection.entity.ChecklistCategory;
import com.carrental.inspection.entity.ChecklistItem;

public class ChecklistItemResponse {

    private Long id;
    private String itemName;
    private ChecklistCategory category;
    private Boolean isDefault;
    private Boolean isActive;

    public ChecklistItemResponse() {
    }

    public static ChecklistItemResponse fromEntity(ChecklistItem item) {
        if (item == null) return null;
        ChecklistItemResponse resp = new ChecklistItemResponse();
        resp.setId(item.getId());
        resp.setItemName(item.getItemName());
        resp.setCategory(item.getCategory());
        resp.setIsDefault(item.getIsDefault());
        resp.setIsActive(item.getIsActive());
        return resp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
