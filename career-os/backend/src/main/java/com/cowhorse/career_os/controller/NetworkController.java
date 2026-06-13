package com.cowhorse.career_os.controller;
 
import com.cowhorse.career_os.dto.*;
import com.cowhorse.career_os.service.NetworkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/network")
@RequiredArgsConstructor
public class NetworkController {

    // FIX: Properly injected bean instance
    private final NetworkService networkService;

    // ══ HELPERS ══════════════════════════════════════════════════════════════
    private UUID requiredUserId(String raw) {
        if (raw == null || raw.isBlank() || "null".equalsIgnoreCase(raw.trim())) {
            throw new IllegalArgumentException("X-User-Id header is required for network actions.");
        }
        try {
            return UUID.fromString(raw.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid UUID format in X-User-Id header.");
        }
    }
 
    // ══ ENDPOINTS ════════════════════════════════════════════════════════════
 
    /**
     * POST /api/network/request
     */
    @PostMapping("/request")
    public ResponseEntity<NetworkDTO> sendConnectionRequest(
            @RequestBody NetworkDTO request, // FIX: Reused your existing NetworkDTO here!
            @RequestHeader("X-User-Id")   String userId,
            @RequestHeader("X-User-Name") String userName) {

        // Extract fields cleanly from your existing DTO structure
        NetworkDTO result = networkService.sendConnectionRequest(
                requiredUserId(userId), 
                request.getAddresseeId(), 
                userName, 
                request.getAddresseeName()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

 
    /**
     * PUT /api/network/{networkId}/respond
     */
    @PutMapping("/{networkId}/respond") // FIX: Removed duplicate path segment prefix
    public ResponseEntity<NetworkDTO> respondToRequest(
            @PathVariable Long networkId,
            @RequestBody Map<String, Boolean> body,
            @RequestHeader("X-User-Id")   String userId,
            @RequestHeader("X-User-Name") String userName) {
 
        boolean accept = body != null && Boolean.TRUE.equals(body.get("accept"));
        return ResponseEntity.ok(
                networkService.respondToRequest(networkId, requiredUserId(userId), userName, accept));
    }
 
    /**
     * GET /api/network/connections
     */
    @GetMapping("/connections") // FIX: Removed duplicate path segment prefix
    public ResponseEntity<List<NetworkDTO>> getConnections(
            @RequestHeader("X-User-Id") String userId) {
 
        return ResponseEntity.ok(networkService.getConnections(requiredUserId(userId)));
    }
 
    /**
     * GET /api/network/pending
     */
    @GetMapping("/pending") // FIX: Removed duplicate path segment prefix
    public ResponseEntity<List<NetworkDTO>> getPendingRequests(
            @RequestHeader("X-User-Id") String userId) {
 
        return ResponseEntity.ok(networkService.getPendingRequests(requiredUserId(userId)));
    }
 
    /**
     * GET /api/network/status?targetUserId={uuid}
     */
    @GetMapping("/status") // FIX: Removed duplicate path segment prefix
    public ResponseEntity<Map<String, Boolean>> getConnectionStatus(
            @RequestParam UUID targetUserId,
            @RequestHeader("X-User-Id") String userId) {
 
        boolean connected = networkService.areConnected(requiredUserId(userId), targetUserId);
        return ResponseEntity.ok(Map.of("connected", connected));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
    }
}
