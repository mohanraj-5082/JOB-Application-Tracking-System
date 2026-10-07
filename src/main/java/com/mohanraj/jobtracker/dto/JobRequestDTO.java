package com.mohanraj.jobtracker.dto;

import com.mohanraj.jobtracker.model.JobStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class JobRequestDTO {

    @NotBlank(message = "Company name cannot be empty")
    private String companyName;

    @NotBlank(message = "Job title cannot be empty")
    private String jobTitle;

    @NotNull(message = "Status cannot be empty")
    private JobStatus status;

    @NotNull(message = "Application date cannot be empty")
    private LocalDate applicationDate;

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public JobStatus getStatus() {
        return status;
    }

    public void setStatus(JobStatus status) {
        this.status = status;
    }

    public LocalDate getApplicationDate() {
        return applicationDate;
    }

    public void setApplicationDate(LocalDate applicationDate) {
        this.applicationDate = applicationDate;
    }

}