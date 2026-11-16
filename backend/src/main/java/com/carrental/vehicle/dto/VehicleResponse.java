package com.carrental.vehicle.dto;

import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.entity.VehicleStatus;

import java.time.LocalDateTime;

public class VehicleResponse {

    private Long id;
    private String registrationNumber;
    private String name;
    private String manufacturer;
    private String variant;
    private String fuelType;
    private String transmission;
    private Integer currentOdometer;
    private Integer manufacturingYear;
    private String notes;
    private String imageUrl;
    private VehicleStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public VehicleResponse() {
    }

    public static VehicleResponse fromEntity(Vehicle v) {
        if (v == null) return null;
        VehicleResponse resp = new VehicleResponse();
        resp.setId(v.getId());
        resp.setRegistrationNumber(v.getRegistrationNumber());
        resp.setName(v.getName());
        resp.setManufacturer(v.getManufacturer());
        resp.setVariant(v.getVariant());
        resp.setFuelType(v.getFuelType());
        resp.setTransmission(v.getTransmission());
        resp.setCurrentOdometer(v.getCurrentOdometer());
        resp.setManufacturingYear(v.getManufacturingYear());
        resp.setNotes(v.getNotes());
        resp.setImageUrl(v.getImageUrl());
        resp.setStatus(v.getStatus());
        resp.setCreatedAt(v.getCreatedAt());
        resp.setUpdatedAt(v.getUpdatedAt());
        return resp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getVariant() {
        return variant;
    }

    public void setVariant(String variant) {
        this.variant = variant;
    }

    public String getFuelType() {
        return fuelType;
    }

    public void setFuelType(String fuelType) {
        this.fuelType = fuelType;
    }

    public String getTransmission() {
        return transmission;
    }

    public void setTransmission(String transmission) {
        this.transmission = transmission;
    }

    public Integer getCurrentOdometer() {
        return currentOdometer;
    }

    public void setCurrentOdometer(Integer currentOdometer) {
        this.currentOdometer = currentOdometer;
    }

    public Integer getManufacturingYear() {
        return manufacturingYear;
    }

    public void setManufacturingYear(Integer manufacturingYear) {
        this.manufacturingYear = manufacturingYear;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public VehicleStatus getStatus() {
        return status;
    }

    public void setStatus(VehicleStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

