package com.carrental;

import com.carrental.common.exception.BusinessException;
import com.carrental.customer.entity.Customer;
import com.carrental.payment.entity.Payment;
import com.carrental.payment.entity.PaymentMethod;
import com.carrental.rental.entity.Rental;
import com.carrental.rental.entity.RentalStatus;
import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.entity.VehicleStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class RentalServiceTest {

    private Vehicle vehicle;
    private Customer customer;
    private Rental rental;

    @BeforeEach
    void setUp() {
        vehicle = new Vehicle();
        vehicle.setId(1L);
        vehicle.setRegistrationNumber("KA-01-AB-1234");
        vehicle.setName("Swift VXi");
        vehicle.setManufacturer("Maruti Suzuki");
        vehicle.setFuelType("PETROL");
        vehicle.setTransmission("MANUAL");
        vehicle.setCurrentOdometer(10000);
        vehicle.setStatus(VehicleStatus.AVAILABLE);

        customer = new Customer();
        customer.setId(10L);
        customer.setFullName("Ramesh Kumar");
        customer.setPrimaryPhone("9876543210");

        rental = new Rental();
        rental.setId(100L);
        rental.setVehicle(vehicle);
        rental.setCustomer(customer);
        rental.setPickupDatetime(LocalDateTime.now().minusDays(2));
        rental.setExpectedReturnDatetime(LocalDateTime.now().plusDays(1));
        rental.setPickupOdometer(10000);
        rental.setPickupFuelLevel("100%");
        rental.setAgreedRentalAmount(new BigDecimal("3000.00"));
        rental.setDiscountAmount(BigDecimal.ZERO);
        rental.setAdditionalCharges(BigDecimal.ZERO);
        rental.setStatus(RentalStatus.ACTIVE);
        rental.calculateTotalAmount();
    }

    @Test
    void testRentalCalculation_AgreedPlusAdditionalMinusDiscount() {
        rental.setAgreedRentalAmount(new BigDecimal("3500.00"));
        rental.setAdditionalCharges(new BigDecimal("450.00"));
        rental.setDiscountAmount(new BigDecimal("200.00"));
        rental.calculateTotalAmount();

        // 3500 + 450 - 200 = 3750.00
        assertEquals(new BigDecimal("3750.00"), rental.getTotalRentalAmount());
    }

    @Test
    void testRentalCalculation_DistanceDrivenFromOdometers() {
        rental.setPickupOdometer(12500);
        rental.setReturnOdometer(12875);
        rental.calculateTotalAmount();

        // 12875 - 12500 = 375 km
        assertEquals(375, rental.getTotalKilometers());
    }

    @Test
    void testOutstandingBalanceCalculation_WithMultiplePayments() {
        rental.setAgreedRentalAmount(new BigDecimal("5000.00"));
        rental.setAdditionalCharges(new BigDecimal("500.00"));
        rental.setDiscountAmount(BigDecimal.ZERO);
        rental.calculateTotalAmount();

        // Total = 5500.00
        assertEquals(new BigDecimal("5500.00"), rental.getTotalRentalAmount());

        // First payment: Advance 2000
        Payment p1 = new Payment();
        p1.setAmount(new BigDecimal("2000.00"));
        p1.setPaymentMethod(PaymentMethod.UPI);
        rental.getPayments().add(p1);

        // Second payment: Return settlement 3000
        Payment p2 = new Payment();
        p2.setAmount(new BigDecimal("3000.00"));
        p2.setPaymentMethod(PaymentMethod.CASH);
        rental.getPayments().add(p2);

        BigDecimal totalPaid = rental.getPayments().stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        assertEquals(new BigDecimal("5000.00"), totalPaid);

        BigDecimal outstanding = rental.getTotalRentalAmount().subtract(totalPaid);
        assertEquals(new BigDecimal("500.00"), outstanding);
    }

    @Test
    void testVehicleStateTransitions_RentedToAvailableOrMaintenance() {
        // Handover
        vehicle.setStatus(VehicleStatus.RENTED);
        assertEquals(VehicleStatus.RENTED, vehicle.getStatus());

        // Return without issues
        vehicle.setCurrentOdometer(10400);
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        assertEquals(VehicleStatus.AVAILABLE, vehicle.getStatus());
        assertEquals(10400, vehicle.getCurrentOdometer());

        // Mark maintenance if damaged
        vehicle.setStatus(VehicleStatus.MAINTENANCE);
        assertEquals(VehicleStatus.MAINTENANCE, vehicle.getStatus());
    }
}
