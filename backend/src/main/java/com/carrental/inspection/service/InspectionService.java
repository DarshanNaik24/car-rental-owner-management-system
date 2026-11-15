package com.carrental.inspection.service;

import com.carrental.common.exception.BusinessException;
import com.carrental.common.exception.ResourceNotFoundException;
import com.carrental.inspection.dto.*;
import com.carrental.inspection.entity.*;
import com.carrental.inspection.repository.ChecklistItemRepository;
import com.carrental.inspection.repository.InspectionRepository;
import com.carrental.inspection.repository.InspectionResultRepository;
import com.carrental.rental.entity.Rental;
import com.carrental.rental.repository.RentalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class InspectionService {

    private final InspectionRepository inspectionRepository;
    private final InspectionResultRepository inspectionResultRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final RentalRepository rentalRepository;

    public InspectionService(InspectionRepository inspectionRepository,
                             InspectionResultRepository inspectionResultRepository,
                             ChecklistItemRepository checklistItemRepository,
                             RentalRepository rentalRepository) {
        this.inspectionRepository = inspectionRepository;
        this.inspectionResultRepository = inspectionResultRepository;
        this.checklistItemRepository = checklistItemRepository;
        this.rentalRepository = rentalRepository;
    }

    @Transactional(readOnly = true)
    public List<ChecklistItemResponse> getActiveChecklistItems() {
        return checklistItemRepository.findByIsActiveTrueOrderByCategoryAscIdAsc()
                .stream()
                .map(ChecklistItemResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ChecklistItemResponse createCustomChecklistItem(ChecklistItemRequest request) {
        String name = request.getItemName().trim();
        if (checklistItemRepository.existsByItemNameIgnoreCase(name)) {
            throw new BusinessException("Checklist item '" + name + "' already exists.");
        }

        ChecklistItem item = new ChecklistItem();
        item.setItemName(name);
        item.setCategory(request.getCategory() != null ? request.getCategory() : ChecklistCategory.OTHER);
        item.setIsDefault(false);
        item.setIsActive(true);

        ChecklistItem saved = checklistItemRepository.save(item);
        return ChecklistItemResponse.fromEntity(saved);
    }

    public void deleteChecklistItem(Long id) {
        ChecklistItem item = checklistItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist item not found with id: " + id));
        item.setIsActive(false);
        checklistItemRepository.save(item);
    }

    public InspectionResponse createOrUpdateInspection(CreateInspectionRequest request) {
        Rental rental = rentalRepository.findById(request.getRentalId())
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with id: " + request.getRentalId()));

        Optional<Inspection> existingOpt = inspectionRepository.findByRentalIdAndType(rental.getId(), request.getType());
        Inspection inspection = existingOpt.orElseGet(Inspection::new);

        inspection.setRental(rental);
        inspection.setVehicle(rental.getVehicle());
        inspection.setType(request.getType());
        inspection.setInspectionDatetime(request.getInspectionDatetime() != null ? request.getInspectionDatetime() : LocalDateTime.now());
        inspection.setInspectorNotes(request.getInspectorNotes());

        Inspection savedInspection = inspectionRepository.save(inspection);

        // If updating, clear previous results
        if (existingOpt.isPresent()) {
            inspectionResultRepository.deleteAll(savedInspection.getResults());
            savedInspection.getResults().clear();
        }

        List<InspectionResult> resultsToSave = new ArrayList<>();
        if (request.getResults() != null) {
            for (InspectionResultRequest resultReq : request.getResults()) {
                ChecklistItem item = checklistItemRepository.findById(resultReq.getChecklistItemId())
                        .orElseThrow(() -> new ResourceNotFoundException("Checklist item not found: " + resultReq.getChecklistItemId()));

                InspectionResult result = new InspectionResult();
                result.setInspection(savedInspection);
                result.setChecklistItem(item);
                result.setItemName(resultReq.getItemName() != null ? resultReq.getItemName() : item.getItemName());
                result.setStatus(resultReq.getStatus() != null ? resultReq.getStatus() : InspectionStatus.OK);
                result.setNotes(resultReq.getNotes());
                result.setPhotoUrl(resultReq.getPhotoUrl());

                resultsToSave.add(result);
            }
            List<InspectionResult> savedResults = inspectionResultRepository.saveAll(resultsToSave);
            savedInspection.setResults(savedResults);
        }

        return InspectionResponse.fromEntity(savedInspection);
    }

    @Transactional(readOnly = true)
    public InspectionResponse getInspectionById(Long id) {
        Inspection inspection = inspectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inspection not found with id: " + id));
        return InspectionResponse.fromEntity(inspection);
    }

    @Transactional(readOnly = true)
    public List<InspectionResponse> getInspectionsByRental(Long rentalId) {
        return inspectionRepository.findByRentalIdOrderByInspectionDatetimeAsc(rentalId)
                .stream()
                .map(InspectionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InspectionResponse> getInspectionsByVehicle(Long vehicleId) {
        return inspectionRepository.findByVehicleIdOrderByInspectionDatetimeDesc(vehicleId)
                .stream()
                .map(InspectionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InspectionComparisonResponse compareInspections(Long rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new ResourceNotFoundException("Rental not found with id: " + rentalId));

        Optional<Inspection> pickupOpt = inspectionRepository.findByRentalIdAndType(rentalId, InspectionType.PICKUP);
        Optional<Inspection> returnOpt = inspectionRepository.findByRentalIdAndType(rentalId, InspectionType.RETURN);

        InspectionComparisonResponse comparison = new InspectionComparisonResponse();
        comparison.setRentalId(rental.getId());
        comparison.setVehicleId(rental.getVehicle().getId());
        comparison.setVehicleRegistration(rental.getVehicle().getRegistrationNumber());
        comparison.setHasPickupInspection(pickupOpt.isPresent());
        comparison.setHasReturnInspection(returnOpt.isPresent());

        Map<Long, InspectionResult> pickupMap = new HashMap<>();
        if (pickupOpt.isPresent()) {
            comparison.setPickupInspectionId(pickupOpt.get().getId());
            for (InspectionResult r : pickupOpt.get().getResults()) {
                pickupMap.put(r.getChecklistItem().getId(), r);
            }
        }

        Map<Long, InspectionResult> returnMap = new HashMap<>();
        if (returnOpt.isPresent()) {
            comparison.setReturnInspectionId(returnOpt.get().getId());
            for (InspectionResult r : returnOpt.get().getResults()) {
                returnMap.put(r.getChecklistItem().getId(), r);
            }
        }

        List<ChecklistItem> allItems = checklistItemRepository.findByIsActiveTrueOrderByCategoryAscIdAsc();
        int newIssuesCount = 0;

        for (ChecklistItem item : allItems) {
            InspectionComparisonResponse.ComparisonItem compItem = new InspectionComparisonResponse.ComparisonItem();
            compItem.setChecklistItemId(item.getId());
            compItem.setItemName(item.getItemName());
            compItem.setCategory(item.getCategory());

            InspectionResult pRes = pickupMap.get(item.getId());
            if (pRes != null) {
                compItem.setPickupStatus(pRes.getStatus());
                compItem.setPickupNotes(pRes.getNotes());
                compItem.setPickupPhotoUrl(pRes.getPhotoUrl());
            }

            InspectionResult rRes = returnMap.get(item.getId());
            if (rRes != null) {
                compItem.setReturnStatus(rRes.getStatus());
                compItem.setReturnNotes(rRes.getNotes());
                compItem.setReturnPhotoUrl(rRes.getPhotoUrl());
            }

            // A new issue is when return condition is NOT_OK and pickup was NOT NOT_OK (e.g. was OK or NA)
            if (rRes != null && rRes.getStatus() == InspectionStatus.NOT_OK) {
                if (pRes == null || pRes.getStatus() != InspectionStatus.NOT_OK) {
                    compItem.setNewIssue(true);
                    newIssuesCount++;
                }
            }

            comparison.getItems().add(compItem);
        }

        comparison.setNewIssuesCount(newIssuesCount);
        return comparison;
    }
}
