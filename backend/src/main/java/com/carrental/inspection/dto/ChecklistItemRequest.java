package com.carrental.inspection.dto;

import com.carrental.inspection.entity.ChecklistCategory;
import com.carrental.inspection.entity.ChecklistItem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChecklistItemRequest {

    @NotBlank(message = "Item name is required")
    @Size(max = 150, message = "Item name must not exceed 150 characters")
    private String itemName;

    private ChecklistCategory category = ChecklistCategory.OTHER;

    public ChecklistItemRequest() {
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
}
