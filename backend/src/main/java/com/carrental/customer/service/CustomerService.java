package com.carrental.customer.service;

import com.carrental.common.exception.BusinessException;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.customer.dto.CustomerRequest;
import com.carrental.customer.dto.CustomerResponse;
import com.carrental.customer.entity.Customer;
import com.carrental.customer.repository.CustomerRepository;
import com.carrental.rental.entity.Rental;
import com.carrental.rental.entity.RentalStatus;
import com.carrental.rental.repository.RentalRepository;
import com.carrental.vehicle.entity.Vehicle;
import com.carrental.vehicle.entity.VehicleStatus;
import com.carrental.vehicle.repository.VehicleRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final RentalRepository rentalRepository;
    private final VehicleRepository vehicleRepository;

    public CustomerService(CustomerRepository customerRepository,
                           @Lazy RentalRepository rentalRepository,
                           @Lazy VehicleRepository vehicleRepository) {
        this.customerRepository = customerRepository;
        this.rentalRepository = rentalRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomers(String search) {
        String searchTerm = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        List<Customer> customers = customerRepository.searchCustomers(searchTerm);
        return customers.stream()
                .map(this::mapWithStats)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        Customer customer = getCustomerEntity(id);
        return mapWithStats(customer);
    }

    @Transactional(readOnly = true)
    public Customer getCustomerEntity(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
    }

    public CustomerResponse createCustomer(CustomerRequest request) {
        String phone = request.getPrimaryPhone().trim();
        if (customerRepository.existsByPrimaryPhone(phone)) {
            throw new BusinessException("A customer with primary phone number " + phone + " already exists.");
        }

        Customer customer = new Customer();
        copyProperties(request, customer);
        Customer saved = customerRepository.save(customer);
        return mapWithStats(saved);
    }

    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = getCustomerEntity(id);

        String phone = request.getPrimaryPhone().trim();
        if (customerRepository.existsByPrimaryPhoneAndIdNot(phone, id)) {
            throw new BusinessException("Another customer already has primary phone " + phone);
        }

        copyProperties(request, customer);
        Customer updated = customerRepository.save(customer);
        return mapWithStats(updated);
    }

    public void deleteCustomer(Long id) {
        Customer customer = getCustomerEntity(id);
        List<Rental> rentals = rentalRepository.findByCustomerIdOrderByPickupDatetimeDesc(id);
        for (Rental rental : rentals) {
            if (rental.getStatus() == RentalStatus.ACTIVE) {
                Vehicle v = rental.getVehicle();
                if (v != null && v.getStatus() == VehicleStatus.RENTED) {
                    v.setStatus(VehicleStatus.AVAILABLE);
                    vehicleRepository.save(v);
                }
            }
            rentalRepository.delete(rental);
        }
        customerRepository.delete(customer);
    }

    private CustomerResponse mapWithStats(Customer c) {
        CustomerResponse resp = CustomerResponse.fromEntity(c);
        if (rentalRepository != null) {
            List<Rental> rentals = rentalRepository.findByCustomerIdOrderByPickupDatetimeDesc(c.getId());
            resp.setTotalRentals(rentals.size());

            BigDecimal totalSpent = BigDecimal.ZERO;
            BigDecimal totalPaid = BigDecimal.ZERO;

            for (Rental r : rentals) {
                if (r.getTotalRentalAmount() != null) {
                    totalSpent = totalSpent.add(r.getTotalRentalAmount());
                }
                if (r.getPayments() != null) {
                    for (var p : r.getPayments()) {
                        if (p.getAmount() != null) {
                            totalPaid = totalPaid.add(p.getAmount());
                        }
                    }
                }
            }
            resp.setTotalSpent(totalSpent);
            resp.setOutstandingBalance(totalSpent.subtract(totalPaid).max(BigDecimal.ZERO));
        }
        return resp;
    }

    private void copyProperties(CustomerRequest src, Customer target) {
        target.setFullName(src.getFullName().trim());
        target.setPrimaryPhone(src.getPrimaryPhone().trim());
        target.setAlternatePhone(src.getAlternatePhone() != null ? src.getAlternatePhone().trim() : null);
        target.setEmail(src.getEmail() != null ? src.getEmail().trim() : null);
        target.setAddress(src.getAddress() != null ? src.getAddress().trim() : null);
        target.setNotes(src.getNotes());
    }
}

