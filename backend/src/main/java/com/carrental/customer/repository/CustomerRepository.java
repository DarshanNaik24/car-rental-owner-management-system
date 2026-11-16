package com.carrental.customer.repository;

import com.carrental.customer.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByPrimaryPhone(String primaryPhone);

    boolean existsByPrimaryPhone(String primaryPhone);

    boolean existsByPrimaryPhoneAndIdNot(String primaryPhone, Long id);

    @Query("SELECT c FROM Customer c WHERE " +
           "(:search IS NULL OR LOWER(c.fullName) LIKE LOWER(CAST(CONCAT('%', :search, '%') AS string)) OR " +
           " c.primaryPhone LIKE CAST(CONCAT('%', :search, '%') AS string) OR " +
           " LOWER(c.email) LIKE LOWER(CAST(CONCAT('%', :search, '%') AS string))) " +
           "ORDER BY c.createdAt DESC")
    List<Customer> searchCustomers(@Param("search") String search);
}

