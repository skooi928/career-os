package com.cowhorse.career_os.controller;

import com.cowhorse.career_os.entity.InterviewAnswer;
import com.cowhorse.career_os.entity.InterviewEvaluation;
import com.cowhorse.career_os.entity.InterviewQuestion;
import com.cowhorse.career_os.entity.MockInterviewSession;
import com.cowhorse.career_os.service.MockInterviewService;
import com.cowhorse.career_os.service.LocalStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/mock-interview")
public class MockInterviewController {

    private final MockInterviewService interviewService;
    private final LocalStorageService localStorageService;

    public MockInterviewController(MockInterviewService interviewService, LocalStorageService localStorageService) {
        this.interviewService = interviewService;
        this.localStorageService = localStorageService;
    }

    public static class StartSessionRequest {
        public UUID userId;
        public String targetRole;
        public String industry;
        public String department;
        public String seniorityLevel;
        public String language;
        public String interviewMode;
        public String interviewType;
        public List<String> skills;
    }

    @PostMapping("/start")
    public ResponseEntity<MockInterviewSession> startSession(@RequestBody StartSessionRequest req) {
        MockInterviewSession session = MockInterviewSession.builder()
                .userId(req.userId)
                .targetRole(req.targetRole)
                .industry(req.industry)
                .department(req.department)
                .seniorityLevel(req.seniorityLevel)
                .language(req.language)
                .interviewMode(req.interviewMode)
                .interviewType(req.interviewType)
                .build();
        
        return ResponseEntity.ok(interviewService.startSession(session, req.skills));
    }

    @GetMapping("/{sessionId}/questions")
    public ResponseEntity<List<InterviewQuestion>> getQuestions(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(interviewService.getSessionQuestions(sessionId));
    }

    @PostMapping("/answer")
    public ResponseEntity<InterviewEvaluation> submitAnswer(
            @RequestParam("questionId") UUID questionId,
            @RequestParam("userId") UUID userId,
            @RequestParam("answerText") String answerText,
            @RequestParam(value = "transcriptText", required = false) String transcriptText,
            @RequestParam(value = "audioFile", required = false) MultipartFile audioFile,
            @RequestParam(value = "videoFile", required = false) MultipartFile videoFile,
            @RequestParam("questionText") String questionText,
            @RequestParam("targetRole") String targetRole,
            @RequestParam(value = "responseDuration", required = false) Integer responseDuration) throws IOException {

        String audioUrl = null;
        if (audioFile != null && !audioFile.isEmpty()) {
            try {
                audioUrl = localStorageService.uploadFile(audioFile, userId);
            } catch (Exception e) {
                System.err.println("Warning: Failed to upload audio locally. Error: " + e.getMessage());
            }
        }
        
        String videoUrl = null;
        if (videoFile != null && !videoFile.isEmpty()) {
            try {
                videoUrl = localStorageService.uploadFile(videoFile, userId);
            } catch (Exception e) {
                System.err.println("Warning: Failed to upload video locally. Error: " + e.getMessage());
            }
        }

        InterviewAnswer answer = InterviewAnswer.builder()
                .questionId(questionId)
                .userId(userId)
                .answerText(answerText)
                .transcriptText(transcriptText)
                .audioUrl(audioUrl)
                .videoUrl(videoUrl)
                .responseDuration(responseDuration)
                .build();

        return ResponseEntity.ok(interviewService.submitAnswer(answer, questionText, targetRole));
    }
}
