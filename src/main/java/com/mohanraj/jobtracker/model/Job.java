package com.mohanraj.jobtracker.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "jobs")
@Getter
@Setter
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser owner;

    @NotBlank(message = "Company name cannot be empty")
    private String companyName;

    @NotBlank(message = "Job title cannot be empty")
    private String jobTitle;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Status cannot be empty")
    private JobStatus status;

    @NotNull(message = "ApplicationDate cannot be empty")
    private LocalDate applicationDate;
}
