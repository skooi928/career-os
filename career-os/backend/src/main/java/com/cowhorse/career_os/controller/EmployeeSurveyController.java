package com.cowhorse.career_os.controller;

import com.cowhorse.career_os.entity.EmployeeSurvey;
import com.cowhorse.career_os.entity.SurveyAiInsight;
import com.cowhorse.career_os.entity.SurveyQuestion;
import com.cowhorse.career_os.exception.AuthenticationException;
import com.cowhorse.career_os.security.JwtTokenProvider;
import com.cowhorse.career_os.service.EmployeeSurveyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/surveys")
@RequiredArgsConstructor
public class EmployeeSurveyController {

    private final EmployeeSurveyService surveyService;
    private final JwtTokenProvider jwtTokenProvider;

    private String uid(String auth) {
        if (auth == null || !auth.startsWith("Bearer "))
            throw new AuthenticationException("Missing or invalid Authorization header");
        return jwtTokenProvider.getUidFromToken(auth.substring(7));
    }

    // ── Manager endpoints ──────────────────────────────────────────────────────

    /** Create a new survey for an org (pre-populated with 23 default questions). */
    @PostMapping("/org/{orgId}")
    public ResponseEntity<EmployeeSurvey> create(
            @PathVariable UUID orgId,
            @RequestBody EmployeeSurveyService.CreateSurveyRequest req,
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(surveyService.createSurvey(orgId, uid(auth), req));
    }

    /** Get all surveys for an org with response counts (manager view). */
    @GetMapping("/org/{orgId}/manage")
    public ResponseEntity<List<EmployeeSurveyService.SurveyWithCount>> manageSurveys(
            @PathVariable UUID orgId,
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(surveyService.getOrgSurveys(orgId, uid(auth)));
    }

    /** Activate a DRAFT survey so employees can start responding. */
    @PostMapping("/{surveyId}/activate")
    public ResponseEntity<EmployeeSurvey> activate(
            @PathVariable UUID surveyId,
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(surveyService.activateSurvey(surveyId, uid(auth)));
    }

    /** Close an ACTIVE survey. */
    @PostMapping("/{surveyId}/close")
    public ResponseEntity<EmployeeSurvey> close(
            @PathVariable UUID surveyId,
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(surveyService.closeSurvey(surveyId, uid(auth)));
    }

    /** Get aggregated analytics (no individual data). */
    @GetMapping("/{surveyId}/analytics")
    public ResponseEntity<EmployeeSurveyService.SurveyAnalytics> analytics(
            @PathVariable UUID surveyId,
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(surveyService.getAnalytics(surveyId, uid(auth)));
    }

    /** Trigger AI insight generation and save result. */
    @PostMapping("/{surveyId}/insights")
    public ResponseEntity<Map<String, String>> generateInsights(
            @PathVariable UUID surveyId,
            @RequestHeader("Authorization") String auth) {
        String json = surveyService.generateAndSaveInsights(surveyId, uid(auth));
        return ResponseEntity.ok(Map.of("insightJson", json));
    }

    /** Get the latest cached AI insight for a survey. */
    @GetMapping("/{surveyId}/insights")
    public ResponseEntity<?> getLatestInsight(
            @PathVariable UUID surveyId,
            @RequestHeader("Authorization") String auth) {
        return surveyService.getLatestInsight(surveyId, uid(auth))
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    // ── Employee endpoints ─────────────────────────────────────────────────────

    /** Get active surveys the employee has NOT yet completed. */
    @GetMapping("/org/{orgId}/active")
    public ResponseEntity<List<EmployeeSurvey>> activeSurveys(
            @PathVariable UUID orgId,
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(surveyService.getActiveSurveysForEmployee(orgId, uid(auth)));
    }

    /** Get questions for a survey (employee taking it). */
    @GetMapping("/{surveyId}/questions")
    public ResponseEntity<List<SurveyQuestion>> questions(
            @PathVariable UUID surveyId,
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(surveyService.getSurveyQuestions(surveyId, uid(auth)));
    }

    /** Check if the current user has already responded to this survey. */
    @GetMapping("/{surveyId}/my-status")
    public ResponseEntity<Map<String, Boolean>> myStatus(
            @PathVariable UUID surveyId,
            @RequestHeader("Authorization") String auth) {
        boolean done = surveyService.hasParticipated(surveyId, uid(auth));
        return ResponseEntity.ok(Map.of("participated", done));
    }

    /** Submit anonymous response. */
    @PostMapping("/{surveyId}/respond")
    public ResponseEntity<Map<String, String>> respond(
            @PathVariable UUID surveyId,
            @RequestBody EmployeeSurveyService.SubmitResponseRequest req,
            @RequestHeader("Authorization") String auth) {
        surveyService.submitResponse(surveyId, uid(auth), req);
        return ResponseEntity.ok(Map.of("message", "Response submitted anonymously. Thank you!"));
    }
}
