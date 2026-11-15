package com.carrental.inspection.repository;

import com.carrental.inspection.entity.ChecklistCategory;
import com.carrental.inspection.entity.ChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, Long> {

    List<ChecklistItem> findByIsActiveTrueOrderByCategoryAscIdAsc();

    List<ChecklistItem> findByCategoryAndIsActiveTrue(ChecklistCategory category);

    boolean existsByItemNameIgnoreCase(String itemName);
}
