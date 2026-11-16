package com.carrental.inspection.repository;

import com.carrental.inspection.entity.InspectionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InspectionResultRepository extends JpaRepository<InspectionResult, Long> {

    List<InspectionResult> findByInspectionId(Long inspectionId);
}

