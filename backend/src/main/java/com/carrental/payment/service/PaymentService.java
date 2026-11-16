package com.carrental.payment.service;

import com.carrental.common.exception.BusinessException;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.payment.dto.PaymentRequest;
import com.carrental.payment.dto.PaymentResponse;
import com.carrental.payment.dto.PaymentSummaryResponse;
import com.carrental.payment.entity.Payment;
import com.carrental.payment.entity.PaymentMethod;
import com.carrental.payment.repository.PaymentRepository;
import com.carrental.payment.specification.PaymentSpecification;
import com.carrental.rental.entity.Rental;
import com.carrental.rental.entity.RentalStatus;
import com.carrental.rental.repository.RentalRepository;
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
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RentalRepository rentalRepository;

    public PaymentService(PaymentRepository paymentRepository, RentalRepository rentalRepository) {
        this.paymentRepository = paymentRepository;
        this.rentalRepository = rentalRepository;
    }

    public PaymentResponse recordPayment(PaymentRequest request) {
        Rental rental = rentalRepository.findById(request.getRentalId())
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with id: " + request.getRentalId()));

        if (rental.getStatus() == RentalStatus.CANCELLED) {
            throw new BusinessException("Cannot record payment for a cancelled rental.");
        }

        Payment payment = new Payment();
        payment.setRental(rental);
        payment.setAmount(request.getAmount());
        payment.setPaymentDatetime(request.getPaymentDatetime() != null ? request.getPaymentDatetime() : LocalDateTime.now());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setReferenceNumber(request.getReferenceNumber() != null ? request.getReferenceNumber().trim() : null);
        payment.setNotes(request.getNotes());

        Payment saved = paymentRepository.save(payment);
        return PaymentResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByRental(Long rentalId) {
        return paymentRepository.findByRentalIdOrderByPaymentDatetimeDesc(rentalId)
                .stream()
                .map(PaymentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<PaymentResponse> searchPayments(String search,
                                                Long rentalId,
                                                Long vehicleId,
                                                PaymentMethod method,
                                                LocalDateTime startDate,
                                                LocalDateTime endDate,
                                                Pageable pageable) {
        String searchTerm = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        var spec = PaymentSpecification.filter(searchTerm, rentalId, vehicleId, method, startDate, endDate);
        return paymentRepository.findAll(spec, pageable)
                .map(PaymentResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public PaymentSummaryResponse getPaymentSummary() {
        PaymentSummaryResponse summary = new PaymentSummaryResponse();
        List<Rental> allRentals = rentalRepository.findAll();

        BigDecimal totalRentalAmount = BigDecimal.ZERO;
        BigDecimal totalPaymentsReceived = BigDecimal.ZERO;

        long fullyPaid = 0;
        long partiallyPaid = 0;
        long unpaid = 0;

        for (Rental r : allRentals) {
            if (r.getStatus() == RentalStatus.CANCELLED) continue;

            BigDecimal rTotal = r.getTotalRentalAmount() != null ? r.getTotalRentalAmount() : BigDecimal.ZERO;
            totalRentalAmount = totalRentalAmount.add(rTotal);

            BigDecimal rPaid = BigDecimal.ZERO;
            if (r.getPayments() != null) {
                for (Payment p : r.getPayments()) {
                    if (p.getAmount() != null) {
                        rPaid = rPaid.add(p.getAmount());
                    }
                }
            }
            totalPaymentsReceived = totalPaymentsReceived.add(rPaid);

            if (rPaid.compareTo(BigDecimal.ZERO) == 0) {
                unpaid++;
            } else if (rPaid.compareTo(rTotal) >= 0) {
                fullyPaid++;
            } else {
                partiallyPaid++;
            }
        }

        summary.setTotalRentalsCount(allRentals.size());
        summary.setTotalRentalAmount(totalRentalAmount);
        summary.setTotalPaymentsReceived(totalPaymentsReceived);
        summary.setTotalOutstanding(totalRentalAmount.subtract(totalPaymentsReceived).max(BigDecimal.ZERO));
        summary.setFullyPaidRentalsCount(fullyPaid);
        summary.setPartiallyPaidRentalsCount(partiallyPaid);
        summary.setUnpaidRentalsCount(unpaid);

        return summary;
    }

    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        paymentRepository.delete(payment);
    }
}

