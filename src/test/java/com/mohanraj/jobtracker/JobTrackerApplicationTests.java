package com.mohanraj.jobtracker;

import com.mohanraj.jobtracker.model.Job;
import com.mohanraj.jobtracker.model.JobStatus;
import com.mohanraj.jobtracker.model.AppUser;
import com.mohanraj.jobtracker.repository.AppUserRepository;
import com.mohanraj.jobtracker.repository.JobRepository;
import com.mohanraj.jobtracker.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.User;

import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:jobtracker;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false",
        "JWT_SECRET=test-only-secret-for-isolated-tests-1234567890"
})
class JobTrackerApplicationTests {

    @Autowired private MockMvc mockMvc;
    @Autowired private JobRepository jobRepository;
    @Autowired private AppUserRepository appUserRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtService jwtService;

    private String authToken;

    @BeforeEach
    void setUp() {
        jobRepository.deleteAll();
        appUserRepository.deleteAll();
        AppUser user = new AppUser();
        user.setEmail("test@example.com");
        user.setPasswordHash(passwordEncoder.encode("Password123"));
        user = appUserRepository.save(user);
        authToken = jwtService.generateToken(User.withUsername(user.getEmail())
                .password(user.getPasswordHash()).roles("USER").build());
        jobRepository.saveAll(List.of(
                job(user, "Acme Corp", "Backend Engineer", JobStatus.APPLIED, "2026-01-10"),
                job(user, "Beta Systems", "Frontend Developer", JobStatus.OFFER, "2026-02-15"),
                job(user, "Gamma Labs", "Data Engineer", JobStatus.APPLIED, "2026-03-20"),
                job(user, "Acme Corp", "QA Analyst", JobStatus.REJECTED, "2026-04-05"),
                job(user, "Delta Works", "Backend Developer", JobStatus.OFFER, "2026-05-25"),
                job(user, "Echo Tech", "Platform Engineer", JobStatus.INTERVIEW, "2026-06-01")
        ));
    }

    @Test
    void createJobWithValidRequestReturnsCreatedJob() throws Exception {
        mockMvc.perform(authenticated(post("/api/jobs")).contentType(MediaType.APPLICATION_JSON).content(
                        "{\"companyName\":\"New Co\",\"jobTitle\":\"Java Developer\",\"status\":\"APPLIED\",\"applicationDate\":\"2026-07-01\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.companyName").value("New Co"));
    }

    @Test
    void createJobWithMissingRequiredFieldsReturnsValidationErrors() throws Exception {
        mockMvc.perform(authenticated(post("/api/jobs")).contentType(MediaType.APPLICATION_JSON).content(
                        "{\"companyName\":\"\",\"jobTitle\":\" \",\"status\":null,\"applicationDate\":null}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.companyName").value("Company name cannot be empty"))
                .andExpect(jsonPath("$.jobTitle").value("Job title cannot be empty"))
                .andExpect(jsonPath("$.status").value("Status cannot be empty"))
                .andExpect(jsonPath("$.applicationDate").value("Application date cannot be empty"));
    }

    @Test
    void getJobsReturnsAllJobs() throws Exception {
        mockMvc.perform(authenticated(get("/api/jobs"))).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(6)));
    }

    @Test
    void getExistingJobReturnsJobAndMissingJobReturnsNotFound() throws Exception {
        Long id = jobRepository.findAll().get(0).getId();
        mockMvc.perform(authenticated(get("/api/jobs/{id}", id))).andExpect(status().isOk())
                .andExpect(jsonPath("$.companyName").value("Acme Corp"));
        mockMvc.perform(authenticated(get("/api/jobs/999999"))).andExpect(status().isNotFound());
    }

    @Test
    void updateExistingJobReturnsUpdatedJobAndMissingJobReturnsNotFound() throws Exception {
        Long id = jobRepository.findAll().get(0).getId();
        String body = "{\"companyName\":\"Updated Co\",\"jobTitle\":\"Senior Java\",\"status\":\"OFFER\",\"applicationDate\":\"2026-08-01\"}";
        mockMvc.perform(authenticated(put("/api/jobs/{id}", id)).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andExpect(jsonPath("$.companyName").value("Updated Co"));
        mockMvc.perform(authenticated(put("/api/jobs/999999")).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteExistingJobRemovesItAndMissingJobReturnsNotFound() throws Exception {
        Long id = jobRepository.findAll().get(0).getId();
        mockMvc.perform(authenticated(delete("/api/jobs/{id}", id))).andExpect(status().isNoContent());
        mockMvc.perform(authenticated(get("/api/jobs/{id}", id))).andExpect(status().isNotFound());
        mockMvc.perform(authenticated(delete("/api/jobs/999999"))).andExpect(status().isNotFound());
    }

    @Test
    void paginationLimitsResultsAndSortingWorksInBothDirections() throws Exception {
        mockMvc.perform(authenticated(get("/api/jobs?page=1&size=2&sort=applicationDate,asc")))
                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].companyName").value("Gamma Labs"));
        mockMvc.perform(authenticated(get("/api/jobs?size=2&sort=applicationDate,desc")))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].companyName").value("Echo Tech"));
    }

    @Test
    void statusFilteringReturnsOnlyRequestedStatus() throws Exception {
        mockMvc.perform(authenticated(get("/api/jobs?status=APPLIED"))).andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2))).andExpect(jsonPath("$[*].status", hasItem("APPLIED")));
        mockMvc.perform(authenticated(get("/api/jobs?status=OFFER"))).andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2))).andExpect(jsonPath("$[*].status", hasItem("OFFER")));
    }

    @Test
    void searchMatchesCompanyTitleAndIgnoresCase() throws Exception {
        mockMvc.perform(authenticated(get("/api/jobs?search=ACME"))).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(2)));
        mockMvc.perform(authenticated(get("/api/jobs?search=developer"))).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(2)));
        mockMvc.perform(authenticated(get("/api/jobs?search=bAcKeNd"))).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void dateFilteringIsInclusiveAndSupportsEachBoundary() throws Exception {
        mockMvc.perform(authenticated(get("/api/jobs?fromDate=2026-02-15"))).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(5)));
        mockMvc.perform(authenticated(get("/api/jobs?toDate=2026-02-15"))).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(2)));
        mockMvc.perform(authenticated(get("/api/jobs?fromDate=2026-02-15&toDate=2026-03-20")))
                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void combinedFiltersApplySearchStatusDatesPaginationAndSorting() throws Exception {
        mockMvc.perform(authenticated(get("/api/jobs?search=engineer&status=APPLIED&fromDate=2026-01-10&toDate=2026-03-20&page=0&size=1&sort=applicationDate,desc")))
                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].companyName").value("Gamma Labs"));
    }

    @Test
    void invalidQueryParametersReturnUsefulBadRequestErrors() throws Exception {
        mockMvc.perform(authenticated(get("/api/jobs?status=UNKNOWN"))).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("must be one of APPLIED, INTERVIEW, OFFER, REJECTED"));
        mockMvc.perform(authenticated(get("/api/jobs?fromDate=01-01-2026"))).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fromDate").value("must be a valid date in yyyy-MM-dd format"));
        mockMvc.perform(authenticated(get("/api/jobs?fromDate=2026-05-01&toDate=2026-01-01"))).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.dateRange").value("fromDate must be before or equal to toDate"));
    }

    @Test
    void usersCanOnlyReadUpdateDeleteAndFilterTheirOwnJobs() throws Exception {
        AppUser userB = new AppUser();
        userB.setEmail("user-b@example.com");
        userB.setPasswordHash(passwordEncoder.encode("Password123"));
        userB = appUserRepository.save(userB);
        Job userBJob = jobRepository.save(job(userB, "Private Co", "Private Role", JobStatus.APPLIED, "2026-08-10"));
        String userBToken = jwtService.generateToken(User.withUsername(userB.getEmail())
                .password(userB.getPasswordHash()).roles("USER").build());

        mockMvc.perform(get("/api/jobs").header("Authorization", "Bearer " + userBToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].companyName").value("Private Co"));
        mockMvc.perform(authenticated(get("/api/jobs")))
                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(6)))
                .andExpect(jsonPath("$[*].companyName").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.hasItem("Private Co"))));

        String updateBody = "{\"companyName\":\"Stolen Update\",\"jobTitle\":\"Role\",\"status\":\"OFFER\",\"applicationDate\":\"2026-08-11\"}";
        mockMvc.perform(authenticated(get("/api/jobs/{id}", userBJob.getId())))
                .andExpect(status().isNotFound());
        mockMvc.perform(authenticated(put("/api/jobs/{id}", userBJob.getId()))
                        .contentType(MediaType.APPLICATION_JSON).content(updateBody))
                .andExpect(status().isNotFound());
        mockMvc.perform(authenticated(delete("/api/jobs/{id}", userBJob.getId())))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/jobs/{id}", userBJob.getId()).header("Authorization", "Bearer " + userBToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.companyName").value("Private Co"));
    }

    @Test
    void registrationLoginAuthenticatedRequestAndLogoutFlowWorks() throws Exception {
        String credentials = "{\"email\":\"lifecycle@example.com\",\"password\":\"Password123\"}";
        MvcResult registration = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(credentials))
                .andExpect(status().isCreated()).andReturn();
        String lifecycleToken = registration.getResponse().getContentAsString()
                .replaceFirst(".*\\\"token\\\":\\\"([^\\\"]+)\\\".*", "$1");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(credentials))
                .andExpect(status().isOk()).andExpect(jsonPath("$.tokenType").value("Bearer"));
        mockMvc.perform(get("/api/jobs").header("Authorization", "Bearer " + lifecycleToken))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/jobs")).andExpect(status().isUnauthorized());
    }

    @Test
    void jwtSecretMustNotBeBlank() {
        org.junit.jupiter.api.Assertions.assertThrows(IllegalArgumentException.class,
                () -> new JwtService("   ", 3600000L));
    }

    @Test
    void healthEndpointIsPublicAndReportsApplicationStatus() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    private MockHttpServletRequestBuilder authenticated(MockHttpServletRequestBuilder request) {
        return request.header("Authorization", "Bearer " + authToken);
    }

    private static Job job(AppUser owner, String company, String title, JobStatus status, String date) {
        Job job = new Job();
        job.setOwner(owner);
        job.setCompanyName(company);
        job.setJobTitle(title);
        job.setStatus(status);
        job.setApplicationDate(LocalDate.parse(date));
        return job;
    }
}
