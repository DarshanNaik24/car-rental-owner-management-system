package com.carrental.rental.service;

import com.carrental.common.exception.BusinessException;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.customer.dto.CustomerResponse;
import com.carrental.customer.entity.Customer;
import com.carrental.customer.repository.CustomerRepository;
import com.carrental.customer.service.CustomerService;
import com.carrental.payment.entity.Payment;
import com.carrental.payment.repository.PaymentRepository;
import com.carrental.rental.dto.CompleteRentalRequest;
import com.carrental.rental.dto.CreateRentalRequest;
import com.carrental.rental.dto.RentalResponse;
import com.carrental.rental.entity.Rental;
import com.carrental.rental.entity.RentalStatus;
import com.carrental.rental.repository.RentalRepository;
import com.carrental.rental.specification.RentalSpecification;
import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.entity.VehicleStatus;
import com.carrental.vehicle.repository.VehicleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RentalService {

    private final RentalRepository rentalRepository;
    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;
    private final CustomerService customerService;
    private final PaymentRepository paymentRepository;

    public RentalService(RentalRepository rentalRepository,
                         VehicleRepository vehicleRepository,
                         CustomerRepository customerRepository,
                         CustomerService customerService,
                         PaymentRepository paymentRepository) {
        this.rentalRepository = rentalRepository;
        this.vehicleRepository = vehicleRepository;
        this.customerRepository = customerRepository;
        this.customerService = customerService;
        this.paymentRepository = paymentRepository;
    }

    public RentalResponse createRental(CreateRentalRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + request.getVehicleId()));

        if (vehicle.getStatus() == VehicleStatus.RENTED) {
            throw new BusinessException("Car " + vehicle.getRegistrationNumber() + " is currently rented and unavailable.");
        }
        if (vehicle.getStatus() == VehicleStatus.MAINTENANCE) {
            throw new BusinessException("Car " + vehicle.getRegistrationNumber() + " is currently under maintenance.");
        }
        if (rentalRepository.existsByVehicleIdAndStatus(vehicle.getId(), RentalStatus.ACTIVE)) {
            throw new BusinessException("There is already an active rental for this car.");
        }

        Customer customer;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));
        } else if (request.getNewCustomer() != null) {
            CustomerResponse createdCustomer = customerService.createCustomer(request.getNewCustomer());
            customer = customerRepository.findById(createdCustomer.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not created properly"));
        } else {
            throw new BusinessException("Either an existing customerId or newCustomer details must be provided.");
        }

        if (request.getPickupDatetime().isAfter(request.getExpectedReturnDatetime())) {
            throw new BusinessException("Expected return date must be after pickup date.");
        }

        Rental rental = new Rental();
        rental.setVehicle(vehicle);
        rental.setCustomer(customer);
        rental.setPickupDatetime(request.getPickupDatetime());
        rental.setExpectedReturnDatetime(request.getExpectedReturnDatetime());
        rental.setPickupOdometer(request.getPickupOdometer());
        rental.setPickupFuelLevel(request.getPickupFuelLevel());
        rental.setAgreedRentalAmount(request.getAgreedRentalAmount());
        rental.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO);
        rental.setPickupNotes(request.getNotes());
        rental.setStatus(RentalStatus.ACTIVE);
        rental.calculateTotalAmount();

        Rental savedRental = rentalRepository.save(rental);

        // Update vehicle status to RENTED
        vehicle.setStatus(VehicleStatus.RENTED);
        vehicleRepository.save(vehicle);

        // Handle initial payment / advance if provided
        if (request.getInitialPayment() != null && request.getInitialPayment().compareTo(BigDecimal.ZERO) > 0) {
            Payment payment = new Payment();
            payment.setRental(savedRental);
            payment.setAmount(request.getInitialPayment());
            payment.setPaymentDatetime(request.getPickupDatetime() != null ? request.getPickupDatetime() : LocalDateTime.now());
            payment.setPaymentMethod(request.getInitialPaymentMethod() != null ? request.getInitialPaymentMethod() : com.carrental.payment.entity.PaymentMethod.CASH);
            payment.setReferenceNumber(request.getInitialPaymentReference());
            payment.setNotes("Initial advance payment recorded at rental creation");
            paymentRepository.save(payment);
            savedRental.getPayments().add(payment);
        }

        return RentalResponse.fromEntity(savedRental);
    }

    public RentalResponse completeRental(Long id, CompleteRentalRequest request) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with id: " + id));

        if (rental.getStatus() != RentalStatus.ACTIVE) {
            throw new BusinessException("Cannot complete rental. Current status is " + rental.getStatus());
        }

        if (request.getReturnOdometer() < rental.getPickupOdometer()) {
            throw new BusinessException("Return odometer (" + request.getReturnOdometer() + 
                    ") cannot be less than pickup odometer (" + rental.getPickupOdometer() + ")");
        }

        rental.setActualReturnDatetime(request.getActualReturnDatetime() != null ? request.getActualReturnDatetime() : LocalDateTime.now());
        rental.setReturnOdometer(request.getReturnOdometer());
        rental.setReturnFuelLevel(request.getReturnFuelLevel());

        if (request.getAdditionalCharges() != null) {
            rental.setAdditionalCharges(request.getAdditionalCharges());
        }
        if (request.getDiscountAdjustment() != null && request.getDiscountAdjustment().compareTo(BigDecimal.ZERO) > 0) {
            rental.setDiscountAmount(rental.getDiscountAmount().add(request.getDiscountAdjustment()));
        }

        rental.setDamageNotes(request.getDamageNotes());
        rental.setMissingAccessories(request.getMissingAccessories());
        rental.setReturnNotes(request.getReturnNotes());
        rental.setStatus(RentalStatus.COMPLETED);
        rental.calculateTotalAmount();

        // Update Vehicle current odometer and status
        Vehicle vehicle = rental.getVehicle();
        vehicle.setCurrentOdometer(request.getReturnOdometer());
        if (Boolean.TRUE.equals(request.getMarkVehicleMaintenance())) {
            vehicle.setStatus(VehicleStatus.MAINTENANCE);
        } else {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
        }
        vehicleRepository.save(vehicle);

        Rental savedRental = rentalRepository.save(rental);

        // Record payment received during return if present
        if (request.getPaymentReceived() != null && request.getPaymentReceived().compareTo(BigDecimal.ZERO) > 0) {
            Payment payment = new Payment();
            payment.setRental(savedRental);
            payment.setAmount(request.getPaymentReceived());
            payment.setPaymentDatetime(request.getActualReturnDatetime() != null ? request.getActualReturnDatetime() : LocalDateTime.now());
            payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : com.carrental.payment.entity.PaymentMethod.CASH);
            payment.setReferenceNumber(request.getPaymentReference());
            payment.setNotes("Payment received during vehicle return");
            paymentRepository.save(payment);
            savedRental.getPayments().add(payment);
        }

        return RentalResponse.fromEntity(savedRental);
    }

    public RentalResponse cancelRental(Long id, String reason) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with id: " + id));

        if (rental.getStatus() == RentalStatus.COMPLETED) {
            throw new BusinessException("Cannot cancel a completed rental.");
        }

        rental.setStatus(RentalStatus.CANCELLED);
        if (reason != null && !reason.trim().isEmpty()) {
            String note = rental.getReturnNotes() != null ? rental.getReturnNotes() + " | Cancellation Reason: " + reason : "Cancellation Reason: " + reason;
            rental.setReturnNotes(note);
        }

        // Release vehicle back to AVAILABLE
        Vehicle vehicle = rental.getVehicle();
        if (vehicle.getStatus() == VehicleStatus.RENTED) {
            vehicle.setStatus(VehicleStatus.AVAILABLE);
            vehicleRepository.save(vehicle);
        }

        Rental saved = rentalRepository.save(rental);
        return RentalResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public RentalResponse getRentalById(Long id) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with id: " + id));
        return RentalResponse.fromEntity(rental);
    }

    @Transactional(readOnly = true)
    public Rental getRentalEntity(Long id) {
        return rentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Page<RentalResponse> searchRentals(String search,
                                              Long vehicleId,
                                              Long customerId,
                                              RentalStatus status,
                                              LocalDateTime startDate,
                                              LocalDateTime endDate,
                                              Pageable pageable) {
        String searchTerm = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        var spec = RentalSpecification.filter(searchTerm, vehicleId, customerId, status, startDate, endDate);
        return rentalRepository.findAll(spec, pageable)
                .map(RentalResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<RentalResponse> getRentalsByVehicle(Long vehicleId) {
        return rentalRepository.findByVehicleIdOrderByPickupDatetimeDesc(vehicleId)
                .stream()
                .map(RentalResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RentalResponse> getRentalsByCustomer(Long customerId) {
        return rentalRepository.findByCustomerIdOrderByPickupDatetimeDesc(customerId)
                .stream()
                .map(RentalResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public void deleteRental(Long id) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with id: " + id));

        // If the rental was ACTIVE, release the car back to AVAILABLE
        if (rental.getStatus() == RentalStatus.ACTIVE) {
            Vehicle vehicle = rental.getVehicle();
            if (vehicle != null && vehicle.getStatus() == VehicleStatus.RENTED) {
                vehicle.setStatus(VehicleStatus.AVAILABLE);
                vehicleRepository.save(vehicle);
            }
        }

        rentalRepository.delete(rental);
    }
}

