package com.mohanraj.jobtracker.repository;

import com.mohanraj.jobtracker.model.Job;
import com.mohanraj.jobtracker.model.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, Long> {

    @Query("""
            SELECT j FROM Job j
            WHERE j.owner.email = :email
              AND (:status IS NULL OR j.status = :status)
              AND (:search IS NULL OR
                   LOWER(j.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(j.jobTitle) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:fromDate IS NULL OR j.applicationDate >= :fromDate)
              AND (:toDate IS NULL OR j.applicationDate <= :toDate)
            """)
    Page<Job> findByFilters(
            @Param("email") String email,
            @Param("status") JobStatus status,
            @Param("search") String search,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            Pageable pageable);

    Optional<Job> findByIdAndOwnerEmail(Long id, String email);

    boolean existsByIdAndOwnerEmail(Long id, String email);
}
