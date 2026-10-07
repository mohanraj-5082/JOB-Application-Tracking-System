package com.mohanraj.jobtracker.controller;

import com.mohanraj.jobtracker.model.Job;
import com.mohanraj.jobtracker.model.JobStatus;
import com.mohanraj.jobtracker.service.JobService;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import com.mohanraj.jobtracker.dto.JobRequestDTO;
import com.mohanraj.jobtracker.dto.JobResponseDTO;

@RestController
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping("/api/jobs")
    public JobResponseDTO createJob(@Valid @RequestBody JobRequestDTO jobRequestDTO,
                                    @AuthenticationPrincipal UserDetails userDetails) {
        return jobService.createJob(jobRequestDTO, userDetails.getUsername());
    }

    @GetMapping("/api/jobs")
    public List<JobResponseDTO> getAllJobs(
            @RequestParam(name = "status", required = false) JobStatus status,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "fromDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(name = "toDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {
        return jobService.getAllJobs(status, search, fromDate, toDate, pageable, userDetails.getUsername());
    }

    @GetMapping("/api/jobs/{id}")
    public ResponseEntity<JobResponseDTO> getJobById(@PathVariable Long id,
                                                     @AuthenticationPrincipal UserDetails userDetails) {

        Optional<JobResponseDTO> job = jobService.getJobById(id, userDetails.getUsername());

        if (job.isPresent()) {
            return ResponseEntity.ok(job.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/api/jobs/{id}")
    public ResponseEntity<JobResponseDTO> updateJob(
            @PathVariable Long id,
            @Valid @RequestBody JobRequestDTO updatedJob,
            @AuthenticationPrincipal UserDetails userDetails) {

        JobResponseDTO job = jobService.updateJob(id, updatedJob, userDetails.getUsername());

        if (job != null) {
            return ResponseEntity.ok(job);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/api/jobs/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id,
                                          @AuthenticationPrincipal UserDetails userDetails) {

        boolean deleted = jobService.deleteJob(id, userDetails.getUsername());

        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
