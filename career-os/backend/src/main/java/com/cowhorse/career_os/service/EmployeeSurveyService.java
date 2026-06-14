package com.cowhorse.career_os.service;

import com.cowhorse.career_os.entity.*;
import com.cowhorse.career_os.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeSurveyService {

    private final EmployeeSurveyRepository surveyRepo;
    private final SurveyQuestionRepository questionRepo;
    private final SurveyResponseRepository responseRepo;
    private final SurveyQuestionAnswerRepository answerRepo;
    private final SurveyParticipationRepository participationRepo;
    private final SurveyAiInsightRepository insightRepo;
    private final OrganisationMemberRepository memberRepo;
    private final RestTemplate restTemplate;

    @Value("${ai.service.url:http://127.0.0.1:8000}")
    private String aiServiceUrl;

    // ── Default question bank seeded when a new survey is created ─────────────

    private static final List<QuestionTemplate> DEFAULT_QUESTIONS = List.of(
        new QuestionTemplate("Overall, how satisfied are you with your current job?",                         QuestionCategory.JOB_SATISFACTION,    QuestionType.RATING, 1),
        new QuestionTemplate("How meaningful and impactful do you find your day-to-day work?",               QuestionCategory.JOB_SATISFACTION,    QuestionType.RATING, 2),
        new QuestionTemplate("What do you enjoy most about your role, and what would you change?",           QuestionCategory.JOB_SATISFACTION,    QuestionType.TEXT,   3),
        new QuestionTemplate("How would you rate your physical or remote work environment?",                 QuestionCategory.WORK_ENVIRONMENT,    QuestionType.RATING, 4),
        new QuestionTemplate("Do you have the tools and resources needed to do your job effectively?",       QuestionCategory.WORK_ENVIRONMENT,    QuestionType.RATING, 5),
        new QuestionTemplate("How well does your work schedule allow you to maintain a healthy personal life?", QuestionCategory.WORK_LIFE_BALANCE, QuestionType.RATING, 6),
        new QuestionTemplate("How often do you feel pressured to work beyond your normal hours? (1=Never, 5=Always)", QuestionCategory.WORK_LIFE_BALANCE, QuestionType.SCALE, 7),
        new QuestionTemplate("How effectively does your team collaborate and work together?",                QuestionCategory.TEAM_COLLABORATION,  QuestionType.RATING, 8),
        new QuestionTemplate("How supported do you feel by your colleagues on a daily basis?",              QuestionCategory.TEAM_COLLABORATION,  QuestionType.RATING, 9),
        new QuestionTemplate("How clearly are company goals, priorities, and changes communicated to you?", QuestionCategory.COMMUNICATION,       QuestionType.RATING, 10),
        new QuestionTemplate("How comfortable do you feel sharing ideas or concerns with your team?",       QuestionCategory.COMMUNICATION,       QuestionType.RATING, 11),
        new QuestionTemplate("How would you rate the effectiveness of your direct manager or leadership?",  QuestionCategory.LEADERSHIP,          QuestionType.RATING, 12),
        new QuestionTemplate("Does your manager genuinely support your professional growth and well-being?",QuestionCategory.LEADERSHIP,          QuestionType.RATING, 13),
        new QuestionTemplate("How satisfied are you with career growth and advancement opportunities here?",QuestionCategory.CAREER_GROWTH,       QuestionType.RATING, 14),
        new QuestionTemplate("Do you have access to learning and development resources that help you grow?",QuestionCategory.CAREER_GROWTH,       QuestionType.RATING, 15),
        new QuestionTemplate("How satisfied are you with your total compensation (salary + benefits)?",     QuestionCategory.COMPENSATION,        QuestionType.RATING, 16),
        new QuestionTemplate("Does your compensation fairly reflect your contributions and the market?",    QuestionCategory.COMPENSATION,        QuestionType.RATING, 17),
        new QuestionTemplate("How would you rate your current stress level at work? (1=Very Low, 5=Very High)", QuestionCategory.MENTAL_WELLBEING,QuestionType.SCALE,  18),
        new QuestionTemplate("How well does this organisation support employee mental health and well-being?",  QuestionCategory.MENTAL_WELLBEING, QuestionType.RATING, 19),
        new QuestionTemplate("How motivated and engaged do you feel in your role?",                         QuestionCategory.EMPLOYEE_ENGAGEMENT, QuestionType.RATING, 20),
        new QuestionTemplate("Would you recommend this company as a great place to work to a friend?",      QuestionCategory.EMPLOYEE_ENGAGEMENT, QuestionType.RATING, 21),
        new QuestionTemplate("How likely are you to still be working here in the next 12 months?",         QuestionCategory.RETENTION_LIKELIHOOD, QuestionType.RATING, 22),
        new QuestionTemplate("What would most improve your experience and make you more likely to stay?",   QuestionCategory.RETENTION_LIKELIHOOD, QuestionType.TEXT,   23)
    );

    record QuestionTemplate(String text, QuestionCategory category, QuestionType type, int order) {}

    // ── Manager operations ─────────────────────────────────────────────────────

    @Transactional
    public EmployeeSurvey createSurvey(UUID orgId, String userId, CreateSurveyRequest req) {
        assertManager(orgId, userId);
        EmployeeSurvey survey = EmployeeSurvey.builder()
                .organisationId(orgId)
                .title(req.title())
                .description(req.description())
                .createdByUserId(UUID.fromString(userId))
                .build();
        survey = surveyRepo.save(survey);

        // Seed default questions
        UUID surveyId = survey.getId();
        List<SurveyQuestion> questions = DEFAULT_QUESTIONS.stream().map(t ->
                SurveyQuestion.builder()
                        .surveyId(surveyId)
                        .questionText(t.text())
                        .category(t.category())
                        .questionType(t.type())
                        .orderIndex(t.order())
                        .build()
        ).collect(Collectors.toList());
        questionRepo.saveAll(questions);
        return survey;
    }

    @Transactional
    public EmployeeSurvey activateSurvey(UUID surveyId, String userId) {
        EmployeeSurvey survey = getSurveyOrThrow(surveyId);
        assertManager(survey.getOrganisationId(), userId);
        survey.setStatus(SurveyStatus.ACTIVE);
        survey.setStartDate(Instant.now());
        survey.setUpdatedAt(Instant.now());
        return surveyRepo.save(survey);
    }

    @Transactional
    public EmployeeSurvey closeSurvey(UUID surveyId, String userId) {
        EmployeeSurvey survey = getSurveyOrThrow(surveyId);
        assertManager(survey.getOrganisationId(), userId);
        survey.setStatus(SurveyStatus.CLOSED);
        survey.setEndDate(Instant.now());
        survey.setUpdatedAt(Instant.now());
        return surveyRepo.save(survey);
    }

    public List<SurveyWithCount> getOrgSurveys(UUID orgId, String userId) {
        assertManager(orgId, userId);
        return surveyRepo.findByOrganisationId(orgId).stream()
                .map(s -> new SurveyWithCount(s, responseRepo.countBySurveyId(s.getId())))
                .collect(Collectors.toList());
    }

    public SurveyAnalytics getAnalytics(UUID surveyId, String userId) {
        EmployeeSurvey survey = getSurveyOrThrow(surveyId);
        assertManager(survey.getOrganisationId(), userId);
        return computeAnalytics(surveyId, survey.getOrganisationId());
    }

    @Transactional
    public String generateAndSaveInsights(UUID surveyId, String userId) {
        EmployeeSurvey survey = getSurveyOrThrow(surveyId);
        assertManager(survey.getOrganisationId(), userId);
        SurveyAnalytics analytics = computeAnalytics(surveyId, survey.getOrganisationId());

        String insightJson = callAiInsights(survey.getTitle(), analytics);
        SurveyAiInsight insight = SurveyAiInsight.builder()
                .surveyId(surveyId)
                .insightJson(insightJson)
                .build();
        insightRepo.save(insight);
        return insightJson;
    }

    public Optional<SurveyAiInsight> getLatestInsight(UUID surveyId, String userId) {
        EmployeeSurvey survey = getSurveyOrThrow(surveyId);
        assertManager(survey.getOrganisationId(), userId);
        return insightRepo.findTopBySurveyIdOrderByGeneratedAtDesc(surveyId);
    }

    // ── Employee operations ────────────────────────────────────────────────────

    public List<EmployeeSurvey> getActiveSurveysForEmployee(UUID orgId, String userId) {
        assertMember(orgId, userId);
        UUID uid = UUID.fromString(userId);
        return surveyRepo.findByOrganisationIdAndStatus(orgId, SurveyStatus.ACTIVE)
                .stream()
                .filter(s -> !participationRepo.existsBySurveyIdAndUserId(s.getId(), uid))
                .collect(Collectors.toList());
    }

    public List<SurveyQuestion> getSurveyQuestions(UUID surveyId, String userId) {
        EmployeeSurvey survey = getSurveyOrThrow(surveyId);
        assertMember(survey.getOrganisationId(), userId);
        return questionRepo.findBySurveyIdOrderByOrderIndex(surveyId);
    }

    public boolean hasParticipated(UUID surveyId, String userId) {
        return participationRepo.existsBySurveyIdAndUserId(surveyId, UUID.fromString(userId));
    }

    @Transactional
    public void submitResponse(UUID surveyId, String userId, SubmitResponseRequest req) {
        UUID uid = UUID.fromString(userId);
        EmployeeSurvey survey = getSurveyOrThrow(surveyId);
        if (survey.getStatus() != SurveyStatus.ACTIVE)
            throw new IllegalStateException("Survey is not active");
        assertMember(survey.getOrganisationId(), userId);
        if (participationRepo.existsBySurveyIdAndUserId(surveyId, uid))
            throw new IllegalStateException("You have already submitted a response to this survey");

        // Create anonymous response (no user_id stored)
        SurveyResponse response = SurveyResponse.builder().surveyId(surveyId).build();
        response = responseRepo.save(response);
        final UUID responseId = response.getId();

        // Save answers
        List<SurveyQuestionAnswer> answers = req.answers().stream().map(a ->
                SurveyQuestionAnswer.builder()
                        .responseId(responseId)
                        .questionId(a.questionId())
                        .ratingValue(a.ratingValue())
                        .textAnswer(a.textAnswer())
                        .build()
        ).collect(Collectors.toList());
        answerRepo.saveAll(answers);

        // Record participation (separate from response — no FK link)
        participationRepo.save(SurveyParticipation.builder().surveyId(surveyId).userId(uid).build());
    }

    // ── Analytics computation ─────────────────────────────────────────────────

    private SurveyAnalytics computeAnalytics(UUID surveyId, UUID orgId) {
        List<SurveyResponse> responses = responseRepo.findBySurveyId(surveyId);
        int totalResponses = responses.size();
        if (totalResponses == 0) return SurveyAnalytics.empty(totalResponses);

        List<UUID> responseIds = responses.stream().map(SurveyResponse::getId).collect(Collectors.toList());
        List<SurveyQuestionAnswer> allAnswers = answerRepo.findByResponseIdIn(responseIds);
        List<SurveyQuestion> questions = questionRepo.findBySurveyIdOrderByOrderIndex(surveyId);

        Map<UUID, SurveyQuestion> qMap = questions.stream()
                .collect(Collectors.toMap(SurveyQuestion::getId, q -> q));

        // Scores per category
        Map<String, List<Integer>> categoryRatings = new LinkedHashMap<>();
        List<String> textAnswers = new ArrayList<>();
        List<Double> allRatings = new ArrayList<>();

        for (SurveyQuestionAnswer ans : allAnswers) {
            SurveyQuestion q = qMap.get(ans.getQuestionId());
            if (q == null) continue;
            if (q.getQuestionType() == QuestionType.TEXT) {
                if (ans.getTextAnswer() != null && !ans.getTextAnswer().isBlank())
                    textAnswers.add(ans.getTextAnswer());
            } else if (ans.getRatingValue() != null) {
                String cat = q.getCategory().name();
                categoryRatings.computeIfAbsent(cat, k -> new ArrayList<>()).add(ans.getRatingValue());
                // Normalize SCALE (1-5) to 1-10 for overall score
                double norm = q.getQuestionType() == QuestionType.SCALE
                        ? ans.getRatingValue() * 2.0 : ans.getRatingValue();
                allRatings.add(norm);
            }
        }

        Map<String, Double> scoreByCategory = new LinkedHashMap<>();
        for (QuestionCategory cat : QuestionCategory.values()) {
            List<Integer> ratings = categoryRatings.get(cat.name());
            if (ratings != null && !ratings.isEmpty()) {
                double avg = ratings.stream().mapToInt(i -> i).average().orElse(0);
                // Normalize if it was a SCALE category
                scoreByCategory.put(cat.name(), Math.round(avg * 10.0) / 10.0);
            }
        }

        double overallScore = allRatings.isEmpty() ? 0
                : Math.round(allRatings.stream().mapToDouble(d -> d).average().orElse(0) * 10.0) / 10.0;

        long totalOrgMembers = memberRepo.countByOrganisationIdAndStatus(orgId, "APPROVED");
        int responseRate = totalOrgMembers > 0 ? (int) (totalResponses * 100L / totalOrgMembers) : 0;

        return new SurveyAnalytics(totalResponses, overallScore, scoreByCategory, textAnswers, responseRate);
    }

    // ── AI integration ────────────────────────────────────────────────────────

    private String callAiInsights(String surveyTitle, SurveyAnalytics analytics) {
        String url = aiServiceUrl + "/survey-insights/analyze";
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("survey_title", surveyTitle);
            payload.put("total_responses", analytics.totalResponses());
            payload.put("overall_score", analytics.overallScore());
            payload.put("score_by_category", analytics.scoreByCategory());
            payload.put("open_text_responses", analytics.openTextResponses());
            payload.put("response_rate", analytics.responseRate());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<String> res = restTemplate.postForEntity(url, entity, String.class);
            if (res.getStatusCode().is2xxSuccessful() && res.getBody() != null)
                return res.getBody();
        } catch (Exception e) {
            log.warn("AI insight service unavailable: {}", e.getMessage());
        }
        return buildFallbackInsight(analytics);
    }

    private String buildFallbackInsight(SurveyAnalytics analytics) {
        double score = analytics.overallScore();
        String sentiment = score >= 8 ? "positive" : score >= 6 ? "moderate" : "concerning";
        String retentionRisk = score < 5 ? "critical" : score < 6 ? "high" : score < 7.5 ? "moderate" : "low";
        String burnout = score < 6 ? "High risk — scores suggest elevated disengagement and possible burnout." : "Low to moderate — no immediate burnout signals from scores alone.";
        String morale = score >= 7 ? "Generally positive team morale indicated by overall scores." : "Morale appears moderate; targeted engagement initiatives are recommended.";
        // find top 3 lowest and highest categories for strengths/concerns
        var sorted = analytics.scoreByCategory().entrySet().stream()
                .sorted(java.util.Map.Entry.comparingByValue())
                .toList();
        String concerns = sorted.stream().limit(3)
                .map(e -> "\"" + e.getKey().replace("_", " ") + " (" + String.format("%.1f", e.getValue()) + "/10)\"")
                .collect(java.util.stream.Collectors.joining(","));
        String strengths = sorted.stream().skip(Math.max(0, sorted.size() - 3))
                .map(e -> "\"" + e.getKey().replace("_", " ") + " (" + String.format("%.1f", e.getValue()) + "/10)\"")
                .collect(java.util.stream.Collectors.joining(","));
        return String.format("""
            {"overall_sentiment":"%s","satisfaction_analysis":"Overall satisfaction score of %.1f/10 indicates a %s work environment. AI analysis is currently unavailable; scores are summarised automatically.",
            "burnout_indicators":"%s","team_morale":"%s","retention_risk":"%s",
            "retention_risk_explanation":"Based on an overall score of %.1f/10, retention risk is estimated as %s. Full AI analysis unavailable.",
            "culture_assessment":"Automated summary only — AI service unavailable. Review category scores to identify cultural gaps.",
            "top_strengths":[%s],
            "critical_concerns":[%s],
            "recommendations":[
              {"priority":"high","action":"Address lowest-scoring categories immediately","rationale":"Low scores in key areas directly affect retention and engagement."},
              {"priority":"medium","action":"Share aggregated results transparently with the team","rationale":"Transparency builds trust and shows leadership takes feedback seriously."},
              {"priority":"low","action":"Schedule a follow-up pulse survey in 30 days","rationale":"Track whether interventions are having a measurable positive impact."}
            ],
            "low_score_categories":[],
            "high_score_categories":[],
            "manager_action_plan":"30 days: Review this report with your team leads. 60 days: Launch targeted improvement initiatives for lowest-scoring areas. 90 days: Run a follow-up pulse survey to measure progress.",
            "pulse_survey_suggested":%s,"ai_available":false}""",
                sentiment, score, sentiment,
                burnout, morale, retentionRisk, score, retentionRisk,
                strengths, concerns,
                score < 7 ? "true" : "false");
    }

    // ── Guard helpers ──────────────────────────────────────────────────────────

    private void assertManager(UUID orgId, String userId) {
        UUID uid = UUID.fromString(userId);
        boolean isManager = memberRepo.findByOrganisationIdAndUserId(orgId, uid)
                .map(m -> m.getStatus().equals("APPROVED") &&
                          (m.getRole() == OrgMemberRole.ORG_ADMIN || m.getRole() == OrgMemberRole.HR))
                .orElse(false);
        if (!isManager)
            throw new SecurityException("Not authorised: must be an ORG_ADMIN or HR member");
    }

    private void assertMember(UUID orgId, String userId) {
        UUID uid = UUID.fromString(userId);
        boolean isMember = memberRepo.findByOrganisationIdAndUserId(orgId, uid)
                .map(m -> m.getStatus().equals("APPROVED"))
                .orElse(false);
        if (!isMember)
            throw new SecurityException("Not a member of this organisation");
    }

    private EmployeeSurvey getSurveyOrThrow(UUID id) {
        return surveyRepo.findById(id).orElseThrow(() -> new RuntimeException("Survey not found: " + id));
    }

    // ── Request / Response DTOs ────────────────────────────────────────────────

    public record CreateSurveyRequest(String title, String description) {}

    public record AnswerInput(UUID questionId, Integer ratingValue, String textAnswer) {}

    public record SubmitResponseRequest(List<AnswerInput> answers) {}

    public record SurveyWithCount(EmployeeSurvey survey, long responseCount) {}

    public record SurveyAnalytics(
            int totalResponses,
            double overallScore,
            Map<String, Double> scoreByCategory,
            List<String> openTextResponses,
            int responseRate
    ) {
        static SurveyAnalytics empty(int responses) {
            return new SurveyAnalytics(responses, 0, Map.of(), List.of(), 0);
        }
    }
}
