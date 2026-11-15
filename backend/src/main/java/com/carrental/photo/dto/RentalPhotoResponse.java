package com.carrental.photo.dto;

import com.carrental.photo.entity.PhotoType;
import com.carrental.photo.entity.RentalPhoto;

import java.time.LocalDateTime;

public class RentalPhotoResponse {

    private Long id;
    private Long rentalId;
    private Long vehicleId;
    private Long inspectionId;
    private String photoUrl;
    private String fileName;
    private PhotoType photoType;
    private String notes;
    private LocalDateTime createdAt;

    public RentalPhotoResponse() {
    }

    public static RentalPhotoResponse fromEntity(RentalPhoto photo) {
        if (photo == null) return null;
        RentalPhotoResponse resp = new RentalPhotoResponse();
        resp.setId(photo.getId());
        if (photo.getRental() != null) resp.setRentalId(photo.getRental().getId());
        if (photo.getVehicle() != null) resp.setVehicleId(photo.getVehicle().getId());
        if (photo.getInspection() != null) resp.setInspectionId(photo.getInspection().getId());
        resp.setPhotoUrl(photo.getPhotoUrl());
        resp.setFileName(photo.getFileName());
        resp.setPhotoType(photo.getPhotoType());
        resp.setNotes(photo.getNotes());
        resp.setCreatedAt(photo.getCreatedAt());
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

    public Long getInspectionId() {
        return inspectionId;
    }

    public void setInspectionId(Long inspectionId) {
        this.inspectionId = inspectionId;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public PhotoType getPhotoType() {
        return photoType;
    }

    public void setPhotoType(PhotoType photoType) {
        this.photoType = photoType;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
