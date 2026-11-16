package com.carrental.rental.entity;

import com.carrental.customer.entity.Customer;
import com.carrental.inspection.entity.Inspection;
import com.carrental.payment.entity.Payment;
import com.carrental.photo.entity.RentalPhoto;
import com.carrental.vehicle.entity.Vehicle;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rentals")
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "pickup_datetime", nullable = false)
    private LocalDateTime pickupDatetime;

    @Column(name = "expected_return_datetime", nullable = false)
    private LocalDateTime expectedReturnDatetime;

    @Column(name = "actual_return_datetime")
    private LocalDateTime actualReturnDatetime;

    @Column(name = "pickup_odometer", nullable = false)
    private Integer pickupOdometer;

    @Column(name = "return_odometer")
    private Integer returnOdometer;

    @Column(name = "pickup_fuel_level", nullable = false, length = 50)
    private String pickupFuelLevel;

    @Column(name = "return_fuel_level", length = 50)
    private String returnFuelLevel;

    @Column(name = "agreed_rental_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal agreedRentalAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "additional_charges", nullable = false, precision = 12, scale = 2)
    private BigDecimal additionalCharges = BigDecimal.ZERO;

    @Column(name = "total_rental_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalRentalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private RentalStatus status = RentalStatus.ACTIVE;

    @Column(name = "pickup_notes", columnDefinition = "TEXT")
    private String pickupNotes;

    @Column(name = "return_notes", columnDefinition = "TEXT")
    private String returnNotes;

    @Column(name = "damage_notes", columnDefinition = "TEXT")
    private String damageNotes;

    @Column(name = "missing_accessories", columnDefinition = "TEXT")
    private String missingAccessories;

    @Column(name = "total_kilometers")
    private Integer totalKilometers;

    @OneToMany(mappedBy = "rental", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Inspection> inspections = new ArrayList<>();

    @OneToMany(mappedBy = "rental", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Payment> payments = new ArrayList<>();

    @OneToMany(mappedBy = "rental", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<RentalPhoto> photos = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        calculateTotalAmount();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        calculateTotalAmount();
    }

    public void calculateTotalAmount() {
        BigDecimal agreed = agreedRentalAmount != null ? agreedRentalAmount : BigDecimal.ZERO;
        BigDecimal add = additionalCharges != null ? additionalCharges : BigDecimal.ZERO;
        BigDecimal disc = discountAmount != null ? discountAmount : BigDecimal.ZERO;
        this.totalRentalAmount = agreed.add(add).subtract(disc).max(BigDecimal.ZERO);

        if (this.returnOdometer != null && this.pickupOdometer != null) {
            this.totalKilometers = Math.max(0, this.returnOdometer - this.pickupOdometer);
        }
    }

    public Rental() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public LocalDateTime getPickupDatetime() {
        return pickupDatetime;
    }

    public void setPickupDatetime(LocalDateTime pickupDatetime) {
        this.pickupDatetime = pickupDatetime;
    }

    public LocalDateTime getExpectedReturnDatetime() {
        return expectedReturnDatetime;
    }

    public void setExpectedReturnDatetime(LocalDateTime expectedReturnDatetime) {
        this.expectedReturnDatetime = expectedReturnDatetime;
    }

    public LocalDateTime getActualReturnDatetime() {
        return actualReturnDatetime;
    }

    public void setActualReturnDatetime(LocalDateTime actualReturnDatetime) {
        this.actualReturnDatetime = actualReturnDatetime;
    }

    public Integer getPickupOdometer() {
        return pickupOdometer;
    }

    public void setPickupOdometer(Integer pickupOdometer) {
        this.pickupOdometer = pickupOdometer;
    }

    public Integer getReturnOdometer() {
        return returnOdometer;
    }

    public void setReturnOdometer(Integer returnOdometer) {
        this.returnOdometer = returnOdometer;
    }

    public String getPickupFuelLevel() {
        return pickupFuelLevel;
    }

    public void setPickupFuelLevel(String pickupFuelLevel) {
        this.pickupFuelLevel = pickupFuelLevel;
    }

    public String getReturnFuelLevel() {
        return returnFuelLevel;
    }

    public void setReturnFuelLevel(String returnFuelLevel) {
        this.returnFuelLevel = returnFuelLevel;
    }

    public BigDecimal getAgreedRentalAmount() {
        return agreedRentalAmount;
    }

    public void setAgreedRentalAmount(BigDecimal agreedRentalAmount) {
        this.agreedRentalAmount = agreedRentalAmount;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getAdditionalCharges() {
        return additionalCharges;
    }

    public void setAdditionalCharges(BigDecimal additionalCharges) {
        this.additionalCharges = additionalCharges;
    }

    public BigDecimal getTotalRentalAmount() {
        return totalRentalAmount;
    }

    public void setTotalRentalAmount(BigDecimal totalRentalAmount) {
        this.totalRentalAmount = totalRentalAmount;
    }

    public RentalStatus getStatus() {
        return status;
    }

    public void setStatus(RentalStatus status) {
        this.status = status;
    }

    public String getPickupNotes() {
        return pickupNotes;
    }

    public void setPickupNotes(String pickupNotes) {
        this.pickupNotes = pickupNotes;
    }

    public String getReturnNotes() {
        return returnNotes;
    }

    public void setReturnNotes(String returnNotes) {
        this.returnNotes = returnNotes;
    }

    public String getDamageNotes() {
        return damageNotes;
    }

    public void setDamageNotes(String damageNotes) {
        this.damageNotes = damageNotes;
    }

    public String getMissingAccessories() {
        return missingAccessories;
    }

    public void setMissingAccessories(String missingAccessories) {
        this.missingAccessories = missingAccessories;
    }

    public Integer getTotalKilometers() {
        return totalKilometers;
    }

    public void setTotalKilometers(Integer totalKilometers) {
        this.totalKilometers = totalKilometers;
    }

    public List<Inspection> getInspections() {
        return inspections;
    }

    public void setInspections(List<Inspection> inspections) {
        this.inspections = inspections;
    }

    public List<Payment> getPayments() {
        return payments;
    }

    public void setPayments(List<Payment> payments) {
        this.payments = payments;
    }

    public List<RentalPhoto> getPhotos() {
        return photos;
    }

    public void setPhotos(List<RentalPhoto> photos) {
        this.photos = photos;
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

