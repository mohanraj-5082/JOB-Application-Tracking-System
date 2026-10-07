package com.mohanraj.jobtracker.service;

import com.mohanraj.jobtracker.dto.JobRequestDTO;
import com.mohanraj.jobtracker.dto.JobResponseDTO;
import com.mohanraj.jobtracker.model.Job;
import com.mohanraj.jobtracker.model.JobStatus;
import com.mohanraj.jobtracker.model.AppUser;
import com.mohanraj.jobtracker.repository.AppUserRepository;
import com.mohanraj.jobtracker.repository.JobRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class JobService {

    private final JobRepository jobRepository;
    private final AppUserRepository appUserRepository;

    public JobService(JobRepository jobRepository, AppUserRepository appUserRepository) {
        this.jobRepository = jobRepository;
        this.appUserRepository = appUserRepository;
    }

    public JobResponseDTO createJob(JobRequestDTO jobRequestDTO, String email) {

        Job job = new Job();
        job.setOwner(findUser(email));

        job.setCompanyName(jobRequestDTO.getCompanyName());
        job.setJobTitle(jobRequestDTO.getJobTitle());
        job.setStatus(jobRequestDTO.getStatus());
        job.setApplicationDate(jobRequestDTO.getApplicationDate());

        Job savedJob = jobRepository.save(job);

        return convertToResponseDTO(savedJob);
    }

    public List<JobResponseDTO> getAllJobs(
            JobStatus status,
            String search,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable,
            String email) {

        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException("fromDate must be before or equal to toDate");
        }

        String searchText = search == null ? "" : search.trim();

        Page<Job> jobs = jobRepository.findByFilters(
                email,
                status,
                searchText.isEmpty() ? null : searchText,
                fromDate,
                toDate,
                pageable);

        return jobs
                .getContent()
                .stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    public Optional<JobResponseDTO> getJobById(Long id, String email) {

        return jobRepository.findByIdAndOwnerEmail(id, email)
                .map(this::convertToResponseDTO);
    }

    public JobResponseDTO updateJob(Long id, JobRequestDTO updatedJob, String email) {

        Optional<Job> existingJob = jobRepository.findByIdAndOwnerEmail(id, email);

        if (existingJob.isPresent()) {

            Job job = existingJob.get();

            job.setCompanyName(updatedJob.getCompanyName());
            job.setJobTitle(updatedJob.getJobTitle());
            job.setStatus(updatedJob.getStatus());
            job.setApplicationDate(updatedJob.getApplicationDate());

            Job savedJob = jobRepository.save(job);

            return convertToResponseDTO(savedJob);
        }

        return null;
    }

    public boolean deleteJob(Long id, String email) {

        if (jobRepository.existsByIdAndOwnerEmail(id, email)) {
            jobRepository.deleteById(id);
            return true;
        }

        return false;
    }

    private AppUser findUser(String email) {
        return appUserRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new IllegalStateException("Authenticated user was not found"));
    }

    // Entity → Response DTO conversion
    private JobResponseDTO convertToResponseDTO(Job job) {

        JobResponseDTO responseDTO = new JobResponseDTO();

        responseDTO.setId(job.getId());
        responseDTO.setCompanyName(job.getCompanyName());
        responseDTO.setJobTitle(job.getJobTitle());
        responseDTO.setStatus(job.getStatus());
        responseDTO.setApplicationDate(job.getApplicationDate());

        return responseDTO;
    }
}
