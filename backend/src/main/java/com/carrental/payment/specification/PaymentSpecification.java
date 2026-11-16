package com.carrental.payment.specification;

import com.carrental.customer.entity.Customer;
import com.carrental.payment.entity.Payment;
import com.carrental.payment.entity.PaymentMethod;
import com.carrental.rental.entity.Rental;
import com.carrental.vehicle.entity.Vehicle;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class PaymentSpecification {

    public static Specification<Payment> filter(
            String search,
            Long rentalId,
            Long vehicleId,
            PaymentMethod method,
            LocalDateTime startDate,
            LocalDateTime endDate) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (rentalId != null) {
                predicates.add(cb.equal(root.get("rental").get("id"), rentalId));
            }
            if (vehicleId != null) {
                predicates.add(cb.equal(root.get("rental").get("vehicle").get("id"), vehicleId));
            }
            if (method != null) {
                predicates.add(cb.equal(root.get("paymentMethod"), method));
            }
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("paymentDatetime"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("paymentDatetime"), endDate));
            }
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Join<Payment, Rental> rental = root.join("rental", JoinType.LEFT);
                Join<Rental, Customer> customer = rental.join("customer", JoinType.LEFT);
                Join<Rental, Vehicle> vehicle = rental.join("vehicle", JoinType.LEFT);
                predicates.add(cb.or(
                        cb.like(cb.lower(customer.get("fullName")), pattern),
                        cb.like(customer.get("primaryPhone"), pattern),
                        cb.like(cb.lower(vehicle.get("registrationNumber")), pattern),
                        cb.like(cb.lower(root.get("referenceNumber")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
