package com.carrental.rental.specification;

import com.carrental.customer.entity.Customer;
import com.carrental.rental.entity.Rental;
import com.carrental.rental.entity.RentalStatus;
import com.carrental.vehicle.entity.Vehicle;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class RentalSpecification {

    public static Specification<Rental> filter(
            String search,
            Long vehicleId,
            Long customerId,
            RentalStatus status,
            LocalDateTime startDate,
            LocalDateTime endDate) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (vehicleId != null) {
                predicates.add(cb.equal(root.get("vehicle").get("id"), vehicleId));
            }
            if (customerId != null) {
                predicates.add(cb.equal(root.get("customer").get("id"), customerId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("pickupDatetime"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("pickupDatetime"), endDate));
            }
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Join<Rental, Customer> customer = root.join("customer", JoinType.LEFT);
                Join<Rental, Vehicle> vehicle = root.join("vehicle", JoinType.LEFT);
                predicates.add(cb.or(
                        cb.like(cb.lower(customer.get("fullName")), pattern),
                        cb.like(customer.get("primaryPhone"), pattern),
                        cb.like(cb.lower(vehicle.get("registrationNumber")), pattern),
                        cb.like(cb.lower(vehicle.get("name")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
