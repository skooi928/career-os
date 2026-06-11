package com.cowhorse.career_os.service;

import com.cowhorse.career_os.entity.*;
import com.cowhorse.career_os.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MockInterviewService {

    private final MockInterviewSessionRepository sessionRepository;
    private final InterviewQuestionRepository questionRepository;
    private final InterviewAnswerRepository answerRepository;
    private final InterviewEvaluationRepository evaluationRepository;
    private final WebClient webClient;

    public MockInterviewService(
            MockInterviewSessionRepository sessionRepository,
            InterviewQuestionRepository questionRepository,
            InterviewAnswerRepository answerRepository,
            InterviewEvaluationRepository evaluationRepository,
            WebClient.Builder webClientBuilder,
            @Value("${ai.service.url:http://localhost:8000}") String aiServiceUrl) {
        this.sessionRepository = sessionRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.evaluationRepository = evaluationRepository;
        this.webClient = webClientBuilder.baseUrl(aiServiceUrl).build();
    }

    public MockInterviewSession startSession(MockInterviewSession session, List<String> skills) {
        session.setStatus("in_progress");
        MockInterviewSession savedSession = sessionRepository.save(session);

        // Call Python AI Service to generate questions
        Map<String, Object> requestBody = Map.of(
                "targetRole", session.getTargetRole(),
                "industry", session.getIndustry(),
                "seniorityLevel", session.getSeniorityLevel(),
                "skills", skills
        );

        try {
            Map response = webClient.post()
                    .uri("/interview/generate-questions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("questions")) {
                List<Map<String, String>> questions = (List<Map<String, String>>) response.get("questions");
                int seq = 1;
                for (Map<String, String> qData : questions) {
                    InterviewQuestion q = InterviewQuestion.builder()
                            .sessionId(savedSession.getSessionId())
                            .questionText(qData.get("question_text"))
                            .questionTag(qData.get("question_tag"))
                            .questionType(qData.get("question_type"))
                            .difficultyLevel(qData.get("difficulty_level"))
                            .sequenceNumber(seq++)
                            .build();
                    questionRepository.save(q);
                }
            }
        } catch (Exception e) {
            // Log and handle AI service failure
            e.printStackTrace();
        }

        return savedSession;
    }

    public List<InterviewQuestion> getSessionQuestions(UUID sessionId) {
        return questionRepository.findBySessionIdOrderBySequenceNumberAsc(sessionId);
    }

    public InterviewEvaluation submitAnswer(InterviewAnswer answer, String questionText, String targetRole) {
        // Save the answer
        InterviewAnswer savedAnswer = answerRepository.save(answer);

        // Request Evaluation from AI Service
        // Ensure no nulls are passed to Map.of
        String finalAnswer = answer.getTranscriptText();
        if (finalAnswer == null || finalAnswer.trim().isEmpty()) {
            finalAnswer = answer.getAnswerText();
        }
        if (finalAnswer == null) {
            finalAnswer = "";
        }

        // Fast-path: bypass AI if the user explicitly skipped the question
        if ("Skipped".equalsIgnoreCase(finalAnswer.trim())) {
            InterviewEvaluation eval = new InterviewEvaluation();
            eval.setAnswerId(savedAnswer.getAnswerId());
            eval.setTechnicalScore(BigDecimal.ZERO);
            eval.setCommunicationScore(BigDecimal.ZERO);
            eval.setConfidenceScore(BigDecimal.ZERO);
            eval.setRoleFitScore(BigDecimal.ZERO);
            eval.setOverallAnswerScore(BigDecimal.ZERO);
            eval.setFeedbackText("You skipped this question.");
            eval.setStrengths("N/A");
            eval.setWeaknesses("Did not attempt to answer the question.");
            eval.setImprovedSampleAnswer("No sample answer provided because the question was skipped. However, for a real interview, you should attempt to discuss what you know.");
            eval.setSkillGapDetected("N/A");
            eval.setAiModelUsed("None (Skipped)");
            
            savedAnswer.setConfidenceLevel(BigDecimal.ZERO);
            savedAnswer.setFillerWordCount(0);
            answerRepository.save(savedAnswer);
            
            return evaluationRepository.save(eval);
        }

        Map<String, String> requestBody = Map.of(
                "question", questionText != null ? questionText : "",
                "answer_text", finalAnswer,
                "role", targetRole != null ? targetRole : ""
        );

        InterviewEvaluation eval = new InterviewEvaluation();
        eval.setAnswerId(savedAnswer.getAnswerId());

        try {
            Map response = webClient.post()
                    .uri("/interview/evaluate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("evaluation")) {
                Map<String, Object> evalData = (Map<String, Object>) response.get("evaluation");
                eval.setTechnicalScore(getBigDecimal(evalData.get("technical_score")));
                eval.setCommunicationScore(getBigDecimal(evalData.get("communication_score")));
                eval.setConfidenceScore(getBigDecimal(evalData.get("confidence_score")));
                eval.setRoleFitScore(getBigDecimal(evalData.get("role_fit_score")));
                eval.setOverallAnswerScore(getBigDecimal(evalData.get("overall_answer_score")));
                eval.setFeedbackText((String) evalData.get("feedback_text"));
                eval.setStrengths((String) evalData.get("strengths"));
                eval.setWeaknesses((String) evalData.get("weaknesses"));
                eval.setImprovedSampleAnswer((String) evalData.get("improved_sample_answer"));
                eval.setSkillGapDetected((String) evalData.get("skill_gap_detected"));
                eval.setAiModelUsed("Groq-Llama3");

                // Also update the answer entity with AI-derived metrics
                savedAnswer.setConfidenceLevel(getBigDecimal(evalData.get("confidence_score")));
                
                Object fillerCountObj = evalData.get("filler_words_used");
                if (fillerCountObj != null) {
                    try {
                        savedAnswer.setFillerWordCount(Integer.parseInt(fillerCountObj.toString()));
                    } catch (Exception ignored) {}
                }
                answerRepository.save(savedAnswer);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return evaluationRepository.save(eval);
    }

    private BigDecimal getBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof Integer) return BigDecimal.valueOf((Integer) value);
        if (value instanceof Double) return BigDecimal.valueOf((Double) value);
        if (value instanceof String) {
            try {
                return new BigDecimal((String) value);
            } catch (Exception e) {
                return BigDecimal.ZERO;
            }
        }
        return BigDecimal.ZERO;
    }
}
