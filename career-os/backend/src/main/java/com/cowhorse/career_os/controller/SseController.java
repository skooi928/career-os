package com.cowhorse.career_os.controller;

import com.cowhorse.career_os.service.SseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*") // In production, restrict to your frontend domain
public class SseController {

    private final SseService sseService;

    @Autowired
    public SseController(SseService sseService) {
        this.sseService = sseService;
    }

    @GetMapping(path = "/subscribe/{userId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@PathVariable UUID userId) {
        return sseService.subscribe(userId);
    }
}
