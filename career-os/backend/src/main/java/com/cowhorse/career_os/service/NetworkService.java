package com.cowhorse.career_os.service;
 
import com.cowhorse.career_os.dto.*;
import com.cowhorse.career_os.entity.*;
import com.cowhorse.career_os.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NetworkService {

    private final NetworkRepository networkRepository;
    private final NotificationService notificationService;
    
    public NetworkDTO sendConnectionRequest(UUID requesterId, UUID addresseeId,
                                            String requesterName, String addresseeName) {
        // FIX: Prevent users from sending connection requests to themselves
        if (requesterId.equals(addresseeId)) {
            throw new IllegalArgumentException("You cannot send a connection request to yourself.");
        }

        if (networkRepository.requestExists(requesterId, addresseeId)) {
            throw new IllegalStateException("Connection request already exists");
        }
 
        Network network = Network.builder()
                .requesterId(requesterId)
                .addresseeId(addresseeId)
                .status("pending")
                .build();
 
        Network saved = networkRepository.save(network);
 
        // Notify addressee (Now compiles safely because visibility is public)
        notificationService.createNotification(addresseeId, requesterId, requesterName,
                "network_request", null, null,
                requesterName + " sent you a connection request");
 
        return toNetworkDTO(saved, requesterName, addresseeName);
    }
 
    public NetworkDTO respondToRequest(Long networkId, UUID addresseeId,
                                       String addresseeName, boolean accept) {
        Network network = networkRepository.findById(networkId)
                .orElseThrow(() -> new NoSuchElementException("Network request not found: " + networkId));
 
        if (!network.getAddresseeId().equals(addresseeId)) {
            throw new SecurityException("Not authorised to respond to this request");
        }
 
        network.setStatus(accept ? "accepted" : "declined");
        Network saved = networkRepository.save(network);
 
        if (accept) {
            notificationService.createNotification(network.getRequesterId(), addresseeId, addresseeName,
                    "network_accepted", null, null,
                    addresseeName + " accepted your connection request");
        }
 
        return toNetworkDTO(saved, null, addresseeName);
    }
 
    @Transactional(readOnly = true)
    public List<NetworkDTO> getConnections(UUID userId) {
        return networkRepository.findAcceptedConnectionsByUserId(userId)
                .stream()
                .map(n -> toNetworkDTO(n, null, null))
                .collect(Collectors.toList());
    }
 
    @Transactional(readOnly = true)
    public List<NetworkDTO> getPendingRequests(UUID userId) {
        return networkRepository.findPendingRequestsForUser(userId)
                .stream()
                .map(n -> toNetworkDTO(n, null, null))
                .collect(Collectors.toList());
    }
 
    @Transactional(readOnly = true)
    public boolean areConnected(UUID user1, UUID user2) {
        return networkRepository.areConnected(user1, user2);
    }
 
    private NetworkDTO toNetworkDTO(Network n, String requesterName, String addresseeName) {
        return NetworkDTO.builder()
                .id(n.getId())
                .requesterId(n.getRequesterId())
                .addresseeId(n.getAddresseeId())
                .requesterName(requesterName)
                .addresseeName(addresseeName)
                .status(n.getStatus())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
