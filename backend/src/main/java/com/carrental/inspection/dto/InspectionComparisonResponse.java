package com.carrental.inspection.dto;

import com.carrental.inspection.entity.ChecklistCategory;
import com.carrental.inspection.entity.InspectionStatus;

import java.util.ArrayList;
import java.util.List;

public class InspectionComparisonResponse {

    private Long rentalId;
    private Long vehicleId;
    private String vehicleRegistration;
    private Long pickupInspectionId;
    private Long returnInspectionId;
    private boolean hasPickupInspection;
    private boolean hasReturnInspection;
    private int newIssuesCount;
    private List<ComparisonItem> items = new ArrayList<>();

    public InspectionComparisonResponse() {
    }

    public static class ComparisonItem {
        private Long checklistItemId;
        private String itemName;
        private ChecklistCategory category;

        private InspectionStatus pickupStatus;
        private String pickupNotes;
        private String pickupPhotoUrl;

        private InspectionStatus returnStatus;
        private String returnNotes;
        private String returnPhotoUrl;

        private boolean newIssue;

        public ComparisonItem() {
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

        public InspectionStatus getPickupStatus() {
            return pickupStatus;
        }

        public void setPickupStatus(InspectionStatus pickupStatus) {
            this.pickupStatus = pickupStatus;
        }

        public String getPickupNotes() {
            return pickupNotes;
        }

        public void setPickupNotes(String pickupNotes) {
            this.pickupNotes = pickupNotes;
        }

        public String getPickupPhotoUrl() {
            return pickupPhotoUrl;
        }

        public void setPickupPhotoUrl(String pickupPhotoUrl) {
            this.pickupPhotoUrl = pickupPhotoUrl;
        }

        public InspectionStatus getReturnStatus() {
            return returnStatus;
        }

        public void setReturnStatus(InspectionStatus returnStatus) {
            this.returnStatus = returnStatus;
        }

        public String getReturnNotes() {
            return returnNotes;
        }

        public void setReturnNotes(String returnNotes) {
            this.returnNotes = returnNotes;
        }

        public String getReturnPhotoUrl() {
            return returnPhotoUrl;
        }

        public void setReturnPhotoUrl(String returnPhotoUrl) {
            this.returnPhotoUrl = returnPhotoUrl;
        }

        public boolean isNewIssue() {
            return newIssue;
        }

        public void setNewIssue(boolean newIssue) {
            this.newIssue = newIssue;
        }
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

    public Long getPickupInspectionId() {
        return pickupInspectionId;
    }

    public void setPickupInspectionId(Long pickupInspectionId) {
        this.pickupInspectionId = pickupInspectionId;
    }

    public Long getReturnInspectionId() {
        return returnInspectionId;
    }

    public void setReturnInspectionId(Long returnInspectionId) {
        this.returnInspectionId = returnInspectionId;
    }

    public boolean isHasPickupInspection() {
        return hasPickupInspection;
    }

    public void setHasPickupInspection(boolean hasPickupInspection) {
        this.hasPickupInspection = hasPickupInspection;
    }

    public boolean isHasReturnInspection() {
        return hasReturnInspection;
    }

    public void setHasReturnInspection(boolean hasReturnInspection) {
        this.hasReturnInspection = hasReturnInspection;
    }

    public int getNewIssuesCount() {
        return newIssuesCount;
    }

    public void setNewIssuesCount(int newIssuesCount) {
        this.newIssuesCount = newIssuesCount;
    }

    public List<ComparisonItem> getItems() {
        return items;
    }

    public void setItems(List<ComparisonItem> items) {
        this.items = items;
    }
}
